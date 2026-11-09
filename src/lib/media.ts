import type { Media } from "./store";

const MAX_VIDEO_BYTES = 3 * 1024 * 1024;

/** Turn picked files into storable media: images are shrunk to 1080px JPEG, small videos kept as-is. */
export async function filesToMedia(files: FileList | File[]): Promise<{ media: Media[]; skipped: number }> {
  const media: Media[] = [];
  let skipped = 0;
  for (const f of Array.from(files)) {
    if (f.type.startsWith("image/")) media.push({ type: "image", src: await shrink(f) });
    else if (f.type.startsWith("video/") && f.size <= MAX_VIDEO_BYTES) media.push({ type: "video", src: await asDataUrl(f) });
    else skipped++;
  }
  return { media, skipped };
}

function asDataUrl(f: Blob) {
  return new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}

async function shrink(f: File) {
  const url = await asDataUrl(f);
  const img = new Image();
  img.src = url;
  await img.decode().catch(() => {});
  const scale = Math.min(1, 1080 / Math.max(img.width || 1, img.height || 1));
  const c = document.createElement("canvas");
  c.width = Math.round((img.width || 1) * scale);
  c.height = Math.round((img.height || 1) * scale);
  const ctx = c.getContext("2d");
  if (!ctx || !img.width) return url;
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.8);
}
