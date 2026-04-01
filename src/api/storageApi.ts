import { supabase } from '../lib/supabase';
import {
    buildVariantFilePath,
    createImageAssetId,
    getImageVariantPaths,
} from '../utils/imageVariants';

type UploadImageOptions = {
    skipOptimization?: boolean;
};

type ImageOptimizationPreset = {
    maxWidth: number;
    maxHeight: number;
    targetFormat: 'webp' | 'jpeg' | 'png' | 'original';
    quality?: number;
    skipIfSmallerThanBytes?: number;
};

type ImageDeliveryVariant = 'card' | 'popup';

type ImageDeliveryVariantPreset = {
    name: ImageDeliveryVariant;
    preset: ImageOptimizationPreset;
};

const BUCKET_CANDIDATES = [
    import.meta.env.VITE_SUPABASE_BUCKET,
    'Humanpartner',
    'HumanPartner',
    'humanpartner',
    'products',
    'public',
    'uploads',
]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim());

const uniqueBuckets = Array.from(new Set(BUCKET_CANDIDATES));
const LONG_CACHE_CONTROL_SECONDS = '31536000';
const DEFAULT_SMALL_FILE_SKIP_BYTES = 250 * 1024;

const isBucketNotFoundError = (error: any) => {
    const message = `${error?.message || ''} ${error?.error || ''} ${error?.details || ''}`.toLowerCase();
    return message.includes('bucket') && message.includes('not found');
};

const getErrorText = (error: any) =>
    error?.message || error?.error_description || error?.details || 'Unknown error';

const isSvgImage = (file: File) => file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
const isGifImage = (file: File) => file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
const isRasterImage = (file: File) => file.type.startsWith('image/') && !isSvgImage(file) && !isGifImage(file);

const getOutputMimeType = (preset: ImageOptimizationPreset, sourceFile: File) => {
    if (preset.targetFormat === 'original') {
        return sourceFile.type || 'image/png';
    }

    if (preset.targetFormat === 'png') return 'image/png';
    if (preset.targetFormat === 'jpeg') return 'image/jpeg';
    return 'image/webp';
};

const getFileExtensionFromMimeType = (mimeType: string, fallbackFileName: string) => {
    if (mimeType === 'image/webp') return 'webp';
    if (mimeType === 'image/jpeg') return 'jpg';
    if (mimeType === 'image/png') return 'png';
    const currentExtension = fallbackFileName.split('.').pop()?.trim();
    return currentExtension || 'png';
};

const getImageOptimizationPreset = (folder: string): ImageOptimizationPreset => {
    switch (folder) {
        case 'alliance':
            return {
                maxWidth: 1400,
                maxHeight: 700,
                targetFormat: 'original',
                skipIfSmallerThanBytes: 150 * 1024,
            };
        case 'quickmenu':
            return {
                maxWidth: 768,
                maxHeight: 768,
                targetFormat: 'original',
                skipIfSmallerThanBytes: 120 * 1024,
            };
        case 'banners':
            return {
                maxWidth: 1920,
                maxHeight: 1280,
                targetFormat: 'webp',
                quality: 0.84,
                skipIfSmallerThanBytes: DEFAULT_SMALL_FILE_SKIP_BYTES,
            };
        case 'popups':
            return {
                maxWidth: 1600,
                maxHeight: 1600,
                targetFormat: 'webp',
                quality: 0.82,
                skipIfSmallerThanBytes: DEFAULT_SMALL_FILE_SKIP_BYTES,
            };
        case 'description-images':
            return {
                maxWidth: 1600,
                maxHeight: 1600,
                targetFormat: 'webp',
                quality: 0.8,
                skipIfSmallerThanBytes: DEFAULT_SMALL_FILE_SKIP_BYTES,
            };
        case 'notices':
        case 'installation-cases':
        case 'main-reviews':
        case 'product-images':
        case 'products':
            return {
                maxWidth: 1600,
                maxHeight: 1200,
                targetFormat: 'webp',
                quality: 0.82,
                skipIfSmallerThanBytes: DEFAULT_SMALL_FILE_SKIP_BYTES,
            };
        default:
            return {
                maxWidth: 1600,
                maxHeight: 1200,
                targetFormat: 'webp',
                quality: 0.82,
                skipIfSmallerThanBytes: DEFAULT_SMALL_FILE_SKIP_BYTES,
            };
    }
};

const getImageDeliveryVariants = (folder: string): ImageDeliveryVariantPreset[] => {
    switch (folder) {
        case 'banners':
            return [
                {
                    name: 'card',
                    preset: {
                        maxWidth: 1280,
                        maxHeight: 854,
                        targetFormat: 'webp',
                        quality: 0.8,
                    },
                },
            ];
        case 'popups':
            return [
                {
                    name: 'popup',
                    preset: {
                        maxWidth: 800,
                        maxHeight: 800,
                        targetFormat: 'webp',
                        quality: 0.78,
                    },
                },
            ];
        case 'description-images':
            return [
                {
                    name: 'card',
                    preset: {
                        maxWidth: 960,
                        maxHeight: 960,
                        targetFormat: 'webp',
                        quality: 0.76,
                    },
                },
            ];
        case 'notices':
        case 'installation-cases':
        case 'main-reviews':
        case 'product-images':
        case 'products':
            return [
                {
                    name: 'card',
                    preset: {
                        maxWidth: 960,
                        maxHeight: 720,
                        targetFormat: 'webp',
                        quality: 0.76,
                    },
                },
            ];
        default:
            return [];
    }
};

const loadImageElement = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to decode image file.'));
        };

        image.src = objectUrl;
    });

const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> =>
    new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Failed to generate optimized image blob.'));
                return;
            }
            resolve(blob);
        }, mimeType, quality);
    });

const transformImageForPreset = async (file: File, preset: ImageOptimizationPreset): Promise<File> => {
    if (!isRasterImage(file)) {
        return file;
    }

    const image = await loadImageElement(file);
    const originalWidth = image.naturalWidth || image.width;
    const originalHeight = image.naturalHeight || image.height;

    if (!originalWidth || !originalHeight) {
        return file;
    }

    const scale = Math.min(1, preset.maxWidth / originalWidth, preset.maxHeight / originalHeight);
    const targetWidth = Math.max(1, Math.round(originalWidth * scale));
    const targetHeight = Math.max(1, Math.round(originalHeight * scale));

    const isAlreadySmallEnough =
        scale === 1 && file.size <= (preset.skipIfSmallerThanBytes || DEFAULT_SMALL_FILE_SKIP_BYTES);

    if (isAlreadySmallEnough) {
        return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext('2d');
    if (!context) {
        return file;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.clearRect(0, 0, targetWidth, targetHeight);
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const mimeType = getOutputMimeType(preset, file);
    let optimizedBlob: Blob;

    try {
        optimizedBlob = await canvasToBlob(canvas, mimeType, preset.quality);
    } catch {
        if (mimeType !== file.type) {
            optimizedBlob = await canvasToBlob(canvas, file.type || 'image/png');
        } else {
            return file;
        }
    }

    if (optimizedBlob.size >= file.size && scale === 1) {
        return file;
    }

    const extension = getFileExtensionFromMimeType(optimizedBlob.type || mimeType, file.name);
    const nextFileName = file.name.replace(/\.[^.]+$/, '') || `upload-${Date.now()}`;
    return new File([optimizedBlob], `${nextFileName}.${extension}`, {
        type: optimizedBlob.type || mimeType,
        lastModified: file.lastModified,
    });
};

const optimizeImageForUpload = async (file: File, folder: string): Promise<File> =>
    transformImageForPreset(file, getImageOptimizationPreset(folder));

export const uploadImage = async (
    file: File,
    folder: string = 'products',
    options: UploadImageOptions = {},
): Promise<string> => {
    const uploadFile = options.skipOptimization ? file : await optimizeImageForUpload(file, folder);
    const assetId = createImageAssetId();
    const baseFileExtension = uploadFile.name.split('.').pop() || 'png';
    const baseFilePath = buildVariantFilePath({
        folder,
        assetId,
        extension: baseFileExtension,
        variant: 'base',
    });
    const errors: string[] = [];
    const deliveryVariants = isRasterImage(uploadFile)
        ? await Promise.all(
              getImageDeliveryVariants(folder).map(async ({ name, preset }) => {
                  const variantFile = await transformImageForPreset(uploadFile, preset);

                  if (
                      variantFile === uploadFile ||
                      (variantFile.size === uploadFile.size && variantFile.type === uploadFile.type)
                  ) {
                      return null;
                  }

                  return {
                      file: variantFile,
                      filePath: buildVariantFilePath({
                          folder,
                          assetId,
                          extension: variantFile.name.split('.').pop() || 'png',
                          variant: name,
                      }),
                      variantName: name,
                  };
              }),
          ).then((items) => items.filter((item): item is NonNullable<typeof item> => item !== null))
        : [];

    for (const bucket of uniqueBuckets) {
        const { error } = await supabase.storage.from(bucket).upload(baseFilePath, uploadFile, {
            cacheControl: LONG_CACHE_CONTROL_SECONDS,
            contentType: uploadFile.type || undefined,
            upsert: false,
        });

        if (error) {
            errors.push(`${bucket}: ${getErrorText(error)}`);
            continue;
        }

        await Promise.all(
            deliveryVariants.map(async ({ file: variantFile, filePath, variantName }) => {
                const { error: variantError } = await supabase.storage.from(bucket).upload(filePath, variantFile, {
                    cacheControl: LONG_CACHE_CONTROL_SECONDS,
                    contentType: variantFile.type || undefined,
                    upsert: false,
                });

                if (variantError) {
                    console.warn(`Image variant upload failed for ${variantName}:`, variantError);
                }
            }),
        );

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(baseFilePath);
        return urlData.publicUrl;
    }

    throw new Error(
        `Image upload failed. Tried buckets [${uniqueBuckets.join(', ')}]. Errors: ${errors.join(' | ')}`,
    );
};

const parseBucketAndPathFromUrl = (imageUrl: string): { bucket: string; path: string } | null => {
    try {
        const url = new URL(imageUrl);
        const parts = url.pathname.split('/').filter(Boolean);
        // Expected pattern: /storage/v1/object/public/<bucket>/<path...>
        const publicIndex = parts.indexOf('public');
        if (publicIndex === -1 || parts.length <= publicIndex + 2) return null;
        const bucket = parts[publicIndex + 1];
        const path = parts.slice(publicIndex + 2).join('/');
        if (!bucket || !path) return null;
        return { bucket, path };
    } catch {
        return null;
    }
};

export const uploadFile = async (
    file: File,
    folder: string = 'attachments',
): Promise<string> => {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9가-힣.-]/g, '_');
    const filePath = `${folder}/${timestamp}_${cleanFileName}`;
    const errors: string[] = [];

    for (const bucket of uniqueBuckets) {
        const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
            cacheControl: LONG_CACHE_CONTROL_SECONDS,
            contentType: file.type || 'application/octet-stream',
            upsert: false,
        });

        if (error) {
            errors.push(`${bucket}: ${getErrorText(error)}`);
            continue;
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return urlData.publicUrl;
    }

    throw new Error(
        `File upload failed. Tried buckets [${uniqueBuckets.join(', ')}]. Errors: ${errors.join(' | ')}`,
    );
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
    const parsed = parseBucketAndPathFromUrl(imageUrl);
    const bucketsToTry = parsed
        ? [parsed.bucket, ...uniqueBuckets.filter((bucket) => bucket !== parsed.bucket)]
        : uniqueBuckets;

    let lastError: any = null;
    const filePaths = parsed?.path ? getImageVariantPaths(parsed.path) : [];

    if (filePaths.length === 0) return;

    for (const bucket of bucketsToTry) {
        const { error } = await supabase.storage.from(bucket).remove(filePaths);
        if (!error) return;
        lastError = error;
    }

    if (lastError) {
        throw lastError;
    }
};
