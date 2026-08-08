import { supabase } from './supabase';

export const PRODUCT_IMAGES_BUCKET = 'product-images';

export interface ProductImageFile {
  base64: string;
  mimeType: string;
  fileName: string;
}

/**
 * Native atob may throw on inputs with whitespace; encodeURIComponent keeps
 * the base64 round-trippable before decoding to bytes.
 */
function base64ToBytes(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

function extensionFromMime(mimeType: string): string {
  const match = /^image\/(\w+)/.exec(mimeType);
  const ext = match ? match[1] : 'jpg';
  if (ext === 'jpeg') return 'jpg';
  return ext;
}

function sanitizeFileName(fileName: string): string {
  const safe = (fileName ?? '').replace(/[^a-zA-Z0-9._-]/g, '');
  return safe || 'image';
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Path look-up inside the bucket. Handles both a bare path and a full public
 * URL; returns null when the URL does not point at our bucket.
 */
export function getStoragePath(urlOrPath: string | null): string | null {
  if (!urlOrPath) return null;
  if (urlOrPath.includes('/storage/v1/object/public/')) {
    const bucket = encodeURIComponent(PRODUCT_IMAGES_BUCKET);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = urlOrPath.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(urlOrPath.slice(index + marker.length));
  }
  return urlOrPath.startsWith(`${PRODUCT_IMAGES_BUCKET}/`) ? urlOrPath : null;
}

export function getPublicUrl(path: string): string {
  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data
    .publicUrl;
}

/**
 * Upload a picked image (base64 payload from expo-image-picker) into the
 * product-images bucket and return its public URL.
 */
export async function uploadProductImage(
  file: ProductImageFile,
): Promise<string> {
  if (!file.base64) {
    throw new Error('Image data is missing');
  }
  const ext = extensionFromMime(file.mimeType);
  const name = sanitizeFileName(file.fileName);
  const path = `${randomId()}-${name}.${ext}`;
  const bytes = base64ToBytes(file.base64);

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, bytes, {
      contentType: file.mimeType || 'image/jpeg',
      upsert: true,
    });
  if (error) throw error;
  return getPublicUrl(path);
}

/**
 * Best-effort removal of an image file from the bucket. File within the
 * product bucket only (guarded by getStoragePath); never throws.
 */
export async function deleteProductImage(url: string | null): Promise<void> {
  const path = getStoragePath(url);
  if (!path) return;
  try {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
  } catch {
    // Storage cleanup must never block catalog operations.
  }
}
