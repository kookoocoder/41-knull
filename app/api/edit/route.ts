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

    // Check anon limit for editing (using same limit as restoration)
    if (!user && anonId) {
      const { data: existing, error: countError } = await supabase
        .from("edits")
        .select("id", { count: "exact" })
        .eq("anon_id", anonId);
      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 });
      }
      if ((existing?.length ?? 0) >= 2) {
        return NextResponse.json({ error: "Anonymous limit reached. Please log in for more edits." }, { status: 403 });
      }
    }

    // Parse input
    const { inputImage, prompt } = await request.json();
    
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required for editing" }, { status: 400 });
    }

    // Decode base64 payload from Data URI and compute SHA-256 hash for consistent cache lookup
    const base64Match = inputImage.match(/^data:.*;base64,(.*)$/);
    const originalBuffer = base64Match
      ? Buffer.from(base64Match[1], 'base64')
      : Buffer.from(inputImage, 'base64');
    const originalHash = createHash('sha256').update(originalBuffer).digest('hex');
    const promptHash = createHash('sha256').update(prompt.trim().toLowerCase()).digest('hex');
    const combinedHash = createHash('sha256').update(originalHash + promptHash).digest('hex');
    
    // Check cache for existing edited image by combined hash
    const { data: cacheEntry, error: cacheError } = await supabase
      .from("cache_edits")
      .select("edited_data")
      .eq("combined_hash", combinedHash)
      .single();
    if (!cacheError && cacheEntry?.edited_data) {
      // Return cached edited image
      return NextResponse.json({ output: cacheEntry.edited_data });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json({ error: "Missing Replicate API token" }, { status: 500 });
    }

    // Call Replicate API for editing
    const replicateRes = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-max/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({ 
          input: { 
            input_image: inputImage,
            prompt: prompt.trim(),
            output_format: "jpg"
          } 
        }),
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

    let editedDataUrl: string;
    // At this point, output is a string
    // If Replicate already returns a data URI
    if (output.startsWith('data:')) {
      editedDataUrl = output;
    } else if (/^https?:\/\//.test(output)) {
      // Remote URL: fetch and convert to base64
      const imageRes = await fetch(output);
      if (!imageRes.ok) {
        const error = await imageRes.text();
        return NextResponse.json({ error: `Failed to fetch edited image: ${error}` }, { status: 500 });
      }
      const arrayBuffer = await imageRes.arrayBuffer();
      const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
      editedDataUrl = `data:${contentType};base64,${Buffer.from(arrayBuffer).toString('base64')}`;
    } else {
      // Plain base64 string: prefix with image MIME
      editedDataUrl = `data:image/jpeg;base64,${output}`;
    }

    // Cache this edit for future identical requests
    await supabase
      .from('cache_edits')
      .upsert(
        [{ 
          combined_hash: combinedHash,
          original_hash: originalHash,
          prompt_hash: promptHash,
          original_data: inputImage, 
          prompt: prompt.trim(),
          edited_data: editedDataUrl 
        }],
        { onConflict: 'combined_hash' }
      );

    // Persist edit
    const insertPayload: Record<string, any> = {
      original_url: inputImage,
      edited_url: editedDataUrl,
      prompt: prompt.trim(),
      created_at: new Date().toISOString(),
    };
    if (user) {
      insertPayload.user_id = user.id;
    } else if (anonId) {
      insertPayload.anon_id = anonId;
    }
    const { error: insertError } = await supabase
      .from("edits")
      .insert(insertPayload);

    if (insertError) {
      console.error("DB Insert Error:", insertError);
    }

    // Build response
    const response = NextResponse.json({ output: editedDataUrl });
    if (!user && anonId) {
      response.cookies.set("anon-id", anonId, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (err) {
    console.error('Error in POST /api/edit:', err);
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
    .from("edits")
    .select("id, original_url, edited_url, prompt, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ edits: data });
} 