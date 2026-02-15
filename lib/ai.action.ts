import puter from "@heyputer/puter.js";
import { ROOMIFY_RENDER_PROMPT } from "./constant";

export async function fetchAsDataUrl(url: string): Promise<string> {
    // Fetch the image
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    // Convert response to Blob
    const blob = await response.blob();

    // Convert Blob → Base64 Data URL using FileReader
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to convert blob to Data URL."));
            }
        };

        reader.onerror = () => {
            reject(reader.error ?? new Error("FileReader error"));
        };

        reader.readAsDataURL(blob);
    });
}


export const generate3DView = async ({ sourceImage }: Generate3DViewParams) => {
    const dataUrl = sourceImage.startsWith("data:")
        ? sourceImage
        : await fetchAsDataUrl(sourceImage);

    const base64Data = dataUrl.split(",")[1]; // Extract base64 part
    const mimeType = dataUrl.split(';')[0].split(':')[1]; // Extract MIME type

    if (!mimeType || !base64Data) throw new Error("Invalid image data");

    const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
        provider: 'gemini',
        model: 'gemini-2.5-flash-image-preview',
        input_image: base64Data,
        input_image_mime_type: mimeType,
        ratio: { w: 1024, h: 1024 },
    })

    const rawImageUrl = (response as HTMLImageElement).src ?? null;
    if (!rawImageUrl) return { renderedImage: null, renderedPath: undefined };

    const renderedImage = rawImageUrl.startsWith("data:")
        ? rawImageUrl
        : await fetchAsDataUrl(rawImageUrl);

    return { renderedImage, renderedPath: undefined };
}