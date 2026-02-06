import { createAdminClient } from "./supabase/server";

const STORAGE_BUCKET = "documents";

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param path - Storage path format: {group_id}/{deal_id}/{filename}
 * @returns Upload result with data or error
 */
export async function uploadToStorage(file: File, path: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  return { data, error };
}

/**
 * Get a signed URL for downloading a file
 * @param path - Storage path of the file
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL result with data or error
 */
export async function getSignedUrl(path: string, expiresIn: number = 3600) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, expiresIn);

  return { data, error };
}

/**
 * Delete a file from Supabase Storage
 * @param path - Storage path of the file to delete
 * @returns Deletion result with data or error
 */
export async function deleteFromStorage(path: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  return { data, error };
}

/**
 * Generate storage path for a document
 * @param groupId - Group ID
 * @param dealId - Deal ID
 * @param filename - Original filename
 * @returns Formatted storage path
 */
export function generateStoragePath(
  groupId: string,
  dealId: string,
  filename: string
): string {
  return `${groupId}/${dealId}/${filename}`;
}
