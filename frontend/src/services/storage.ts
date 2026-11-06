import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Resizes and compresses an image to maximum 512x512 JPEG/PNG
 */
export async function compressImage(file: File, maxSize: number = 512): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validates and uploads profile photo.
 * Falls back to base64 localStorage storage if Supabase is unconfigured.
 */
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Please upload a valid image file (JPG, PNG, or WebP).');
  }

  // Validate file size (max 2 MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File size exceeds 2 MB limit. Please select a smaller photo.');
  }

  const compressedBlob = await compressImage(file, 512);

  // If Supabase is connected
  if (isSupabaseConfigured && supabase) {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, compressedBlob, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.warn('Supabase storage upload error, falling back to data URL:', uploadError.message);
    } else {
      const { data } = supabase.storage.from('profile-photos').getPublicUrl(filePath);
      return data.publicUrl;
    }
  }

  // Fallback: Convert to Base64 data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl);
    };
    reader.onerror = () => reject(new Error('Failed to convert photo to persistent format'));
    reader.readAsDataURL(compressedBlob);
  });
}
