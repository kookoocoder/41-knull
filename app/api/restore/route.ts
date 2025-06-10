import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from '@/lib/server';
import { Buffer } from 'buffer';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Retrieve or set anon_id
    const cookieAnon = request.cookies.get("anon-id")?.value;
    let anonId = cookieAnon;
    if (!user && !anonId) {
      anonId = crypto.randomUUID();
    }

    // Check anon limit
    if (!user && anonId) {
      const { data: existing, error: countError } = await supabase
        .from("restorations")
        .select("id", { count: "exact" })
        .eq("anon_id", anonId);
      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 });
      }
      if ((existing?.length ?? 0) >= 2) {
        return NextResponse.json({ error: "Anonymous limit reached. Please log in for more restores." }, { status: 403 });
      }
    }

    // Parse input
    const { inputImage } = await request.json();
    // Decode base64 payload from Data URI and compute SHA-256 hash for consistent cache lookup
    const base64Match = inputImage.match(/^data:.*;base64,(.*)$/);
    const originalBuffer = base64Match
      ? Buffer.from(base64Match[1], 'base64')
      : Buffer.from(inputImage, 'base64');
    const originalHash = createHash('sha256').update(originalBuffer).digest('hex');
    // Check cache for existing restored image by hash
    const { data: cacheEntry, error: cacheError } = await supabase
      .from("cache_images")
      .select("restored_data")
      .eq("original_hash", originalHash)
      .single();
    if (!cacheError && cacheEntry?.restored_data) {
      // Return cached restored image
      return NextResponse.json({ output: cacheEntry.restored_data });
    }
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json({ error: "Missing Replicate API token" }, { status: 500 });
    }

    // Call Replicate API
    const replicateRes = await fetch(
      "https://api.replicate.com/v1/models/flux-kontext-apps/restore-image/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({ input: { input_image: inputImage } }),
      }
    );

    if (!replicateRes.ok) {
      const error = await replicateRes.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    const json = await replicateRes.json();
    // Handle edge cases where output can be null or array
    let output = json.output;
    if (!output) {
      return NextResponse.json({ error: 'No output from replicate' }, { status: 500 });
    }
    if (Array.isArray(output)) {
      // Some models return an array of URLs
      output = output[0];
    }
    if (typeof output !== 'string') {
      return NextResponse.json({ error: 'Unexpected output format from replicate' }, { status: 500 });
    }

    let restoredDataUrl: string;
    // At this point, output is a string
    // If Replicate already returns a data URI
    if (output.startsWith('data:')) {
      restoredDataUrl = output;
    } else if (/^https?:\/\//.test(output)) {
      // Remote URL: fetch and convert to base64
      const imageRes = await fetch(output);
      if (!imageRes.ok) {
        const error = await imageRes.text();
        return NextResponse.json({ error: `Failed to fetch restored image: ${error}` }, { status: 500 });
      }
      const arrayBuffer = await imageRes.arrayBuffer();
      const contentType = imageRes.headers.get('content-type') || 'image/png';
      restoredDataUrl = `data:${contentType};base64,${Buffer.from(arrayBuffer).toString('base64')}`;
    } else {
      // Plain base64 string: prefix with image MIME
      restoredDataUrl = `data:image/png;base64,${output}`;
    }

    // Cache this restoration for future identical uploads
    await supabase
      .from('cache_images')
      .upsert(
        [{ original_hash: originalHash, original_data: inputImage, restored_data: restoredDataUrl }],
        { onConflict: ['original_hash'] }
      );

    // Persist restoration
    const insertPayload: Record<string, any> = {
      original_url: inputImage,
      restored_url: restoredDataUrl,
      created_at: new Date().toISOString(),
    };
    if (user) {
      insertPayload.user_id = user.id;
    } else if (anonId) {
      insertPayload.anon_id = anonId;
    }
    const { error: insertError } = await supabase
      .from("restorations")
      .insert(insertPayload);

    if (insertError) {
      console.error("DB Insert Error:", insertError);
    }

    // Build response
    const response = NextResponse.json({ output: restoredDataUrl });
    if (!user && anonId) {
      response.cookies.set("anon-id", anonId, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (err) {
    console.error('Error in POST /api/restore:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("restorations")
    .select("id, original_url, restored_url, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ restorations: data });
}
