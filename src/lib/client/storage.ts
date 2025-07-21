import { createClient } from '@supabase/supabase-js'
import { env } from '@/env'

// Initialize Supabase client for storage operations
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Storage bucket names
export const STORAGE_BUCKETS = {
  LEAGUES: 'league-assets',
  TRYOUTS: 'tryout-assets', 
  SCHOOLS: 'school-assets',
  PLAYERS: 'player-assets',
  COACHES: 'coach-assets'
} as const

// Asset types for different entities
export const ASSET_TYPES = {
  LOGO: 'logo',
  BANNER: 'banner',
  AVATAR: 'avatar',
  THUMBNAIL: 'thumbnail'
} as const

// File upload constraints
export const UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  RECOMMENDED_SIZES: {
    LOGO: { width: 400, height: 400, description: 'Square logo (400x400px recommended)' },
    BANNER: { width: 1200, height: 300, description: 'Banner image (1200x300px recommended)' },
    AVATAR: { width: 200, height: 200, description: 'Profile picture (200x200px recommended)' },
    THUMBNAIL: { width: 300, height: 200, description: 'Thumbnail image (300x200px recommended)' }
  }
} as const

// File validation
export function validateFile(file: File): { isValid: boolean; error?: string } {
  if (file.size > UPLOAD_CONSTRAINTS.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size too large. Maximum size is ${UPLOAD_CONSTRAINTS.MAX_FILE_SIZE / 1024 / 1024}MB`
    }
  }

  if (!UPLOAD_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as typeof UPLOAD_CONSTRAINTS.ALLOWED_TYPES[number])) {
    return {
      isValid: false,
      error: `File type not supported. Allowed types: ${UPLOAD_CONSTRAINTS.ALLOWED_TYPES.join(', ')}`
    }
  }

  return { isValid: true }
}

// Generate file path
export function generateFilePath(
  bucket: keyof typeof STORAGE_BUCKETS,
  entityId: string,
  assetType: keyof typeof ASSET_TYPES,
  fileName: string
): string {
  const timestamp = Date.now()
  const extension = fileName.split('.').pop() ?? 'jpg'
  return `${entityId}/${assetType}/${timestamp}.${extension}`
}

// Upload file to Supabase Storage
export async function uploadFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  filePath: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .getPublicUrl(filePath)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown upload error'
    }
  }
}

// Delete file from Supabase Storage
export async function deleteFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown delete error'
    }
  }
}

// Extract file path from URL (for deletion)
export function extractFilePathFromUrl(url: string, bucket: keyof typeof STORAGE_BUCKETS): string | null {
  try {
    const bucketName = STORAGE_BUCKETS[bucket]
    const pattern = new RegExp(`/storage/v1/object/public/${bucketName}/(.+)`)
    const match = url.match(pattern)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

// Upload asset with validation and path generation
export async function uploadAsset(
  bucket: keyof typeof STORAGE_BUCKETS,
  entityId: string,
  assetType: keyof typeof ASSET_TYPES,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Validate file
  const validation = validateFile(file)
  if (!validation.isValid) {
    return { success: false, error: validation.error }
  }

  // Generate file path
  const filePath = generateFilePath(bucket, entityId, assetType, file.name)
  
  // Upload file
  return await uploadFile(bucket, filePath, file)
}

// Delete asset by URL
export async function deleteAsset(
  bucket: keyof typeof STORAGE_BUCKETS,
  url: string
): Promise<{ success: boolean; error?: string }> {
  const filePath = extractFilePathFromUrl(url, bucket)
  if (!filePath) {
    return { success: false, error: 'Invalid URL format' }
  }

  return await deleteFile(bucket, filePath)
} 