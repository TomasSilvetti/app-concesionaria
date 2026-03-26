import sharp from "sharp";

export class ImageTooSmallError extends Error {
  constructor() {
    super("La imagen debe tener al menos 800px en su lado más largo.");
    this.name = "ImageTooSmallError";
  }
}

export async function processVehiclePhoto(
  buffer: Buffer
): Promise<{ full: Buffer; thumb: Buffer }> {
  const metadata = await sharp(buffer).metadata();
  const longestSide = Math.max(metadata.width ?? 0, metadata.height ?? 0);

  if (longestSide < 800) {
    throw new ImageTooSmallError();
  }

  const [full, thumb] = await Promise.all([
    sharp(buffer)
      .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
      .webp()
      .toBuffer(),
    sharp(buffer)
      .resize({ width: 400, height: 400, fit: "inside", withoutEnlargement: true })
      .webp()
      .toBuffer(),
  ]);

  return { full, thumb };
}
