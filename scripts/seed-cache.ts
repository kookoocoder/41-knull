#!/usr/bin/env node
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { existsSync, readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const SUPABASE_URL = "https://eyczsngyjmxhczwclppx.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y3pzbmd5am14aGN6d2NscHB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4MTEwOCwiZXhwIjoyMDY1MDU3MTA4fQ.E19-0jcAf6spIcWnbUDhjQlkgRQMAIItxhOszfDQbQY"

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Manually load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf-8')
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^([\w_]+)=['"]?(.*)['"]?$/)
    if (match) {
      process.env[match[1]] = match[2]
    }
  }
}

async function seedCache() {
  const cacheDir = path.resolve(process.cwd(), 'img_cache')
  const files = await readdir(cacheDir)
  const originals = files.filter(f => /-original\.(png|jpe?g)$/i.test(f))

  for (const original of originals) {
    // Extract numeric ID from filename (e.g., image-4-original.png -> ID = 4)
    const match = original.match(/-(\d+)-original\.(png|jpe?g)$/i)
    if (!match) {
      console.warn(`Skipping ${original}: invalid original filename format`)
      continue
    }
    const id = match[1]
    // Find the matching restored file by the same numeric ID
    const restored = files.find(f => new RegExp(`-${id}-restored\.(png|jpe?g)$`, 'i').test(f))
    if (!restored) {
      console.warn(`Skipping ${original}: no matching restored file found for ID ${id}`)
      continue
    }

    const [origBuf, restBuf] = await Promise.all([
      readFile(path.join(cacheDir, original)),
      readFile(path.join(cacheDir, restored)),
    ])

    const extMap: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' }
    const origExt = path.extname(original).slice(1).toLowerCase()
    const restExt = path.extname(restored).slice(1).toLowerCase()
    const origMime = extMap[origExt] || `image/${origExt}`
    const restMime = extMap[restExt] || `image/${restExt}`

    const originalData = `data:${origMime};base64,${origBuf.toString('base64')}`
    const restoredData = `data:${restMime};base64,${restBuf.toString('base64')}`
    // Compute a SHA-256 hash of the original image bytes
    const originalHash = createHash('sha256').update(origBuf).digest('hex')

    const { error } = await supabase
      .from('cache_images')
      .upsert(
        [{ original_hash: originalHash, original_data: originalData, restored_data: restoredData }],
        { onConflict: ['original_hash'] }
      )

    if (error) {
      console.error(`Error seeding ${original}:`, error)
    } else {
      console.log(`Seeded cache for ${original} → ${restored}`)
    }
  }
}

seedCache()
  .then(() => {
    console.log('Cache seeding complete')
    process.exit(0)
  })
  .catch(err => {
    console.error('Seeding failed:', err)
    process.exit(1)
  }) 