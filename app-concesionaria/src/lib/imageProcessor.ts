import sharp from "sharp";

export async function processVehiclePhoto(
  buffer: Buffer
): Promise<{ full: Buffer; thumb: Buffer }> {
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
