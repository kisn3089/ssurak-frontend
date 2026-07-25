export function buildImageUrl(
  imageKey: string | null | undefined,
  variant: "hero" | "thumbnail" = "hero"
): string | null {
  if (!imageKey) {
    return null;
  }

  return `https://${process.env.NEXT_PUBLIC_IMAGE_HOSTNAME}/${imageKey}/${variant}.webp`;
}

export function parseImageUrlToImageKey(
  imageUrl: string | null | undefined,
  variant: "hero" | "thumbnail" = "hero"
): string | undefined {
  if (!imageUrl) return undefined;

  const url = new URL(imageUrl);
  const urlPathname = url.pathname.slice(1);

  return urlPathname.split(`/${variant}.webp`)[0];
}
