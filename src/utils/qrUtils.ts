import QRCode from "qrcode";
import jsQR from "jsqr";

export interface DecodedUpiPayload {
  rawText: string;
  upiId: string;
  payeeName?: string;
  merchantCode?: string;
  orgId?: string;
}

export interface ProcessedUploadedQr {
  compressedDataUrl: string;
  decodedUpi: DecodedUpiPayload | null;
  wasCompressed: boolean;
}

/**
 * Render an exact ISO/IEC 18004 scannable QR code as a crisp high-contrast
 * SVG data URL synchronously (black modules on white background with 4-module quiet zone).
 */
export function generateQrSvgDataUrl(payload: string): string {
  const qr = QRCode.create(payload, { errorCorrectionLevel: "M" });
  const count = qr.modules.size;
  const margin = 4;
  const size = count + margin * 2;

  const paths: string[] = [];
  for (let r = 0; r < count; r++) {
    let runStart = -1;
    for (let c = 0; c <= count; c++) {
      const dark = c < count && qr.modules.get(r, c) === 1;
      if (dark && runStart === -1) {
        runStart = c;
      } else if (!dark && runStart !== -1) {
        paths.push(`M${runStart + margin},${r + margin}h${c - runStart}v1h-${c - runStart}z`);
        runStart = -1;
      }
    }
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="320" height="320" shape-rendering="crispEdges">` +
    `<rect width="100%" height="100%" fill="#FFFFFF"/>` +
    `<path d="${paths.join("")}" fill="#0F172A"/>` +
    `</svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

/**
 * Parse a raw `upi://pay?...` QR string to extract its VPA (`pa`), payee name (`pn`),
 * merchant code (`mc`), and `orgid` without copying stale signatures (`sign`).
 */
export function parseUpiQrPayload(rawText: string): DecodedUpiPayload | null {
  const trimmed = rawText.trim();
  if (!trimmed.toLowerCase().startsWith("upi://")) return null;
  try {
    const queryIndex = trimmed.indexOf("?");
    if (queryIndex === -1) return null;
    const params = new URLSearchParams(trimmed.slice(queryIndex + 1));
    const pa = params.get("pa")?.trim();
    if (!pa || !/^[^\s@]+@[^\s@]+$/.test(pa)) return null;

    const pn = params.get("pn")?.trim() || undefined;
    const mc = params.get("mc")?.trim() || undefined;
    const orgId = params.get("orgid")?.trim() || undefined;
    return {
      rawText: trimmed,
      upiId: pa,
      payeeName: pn,
      merchantCode: mc && /^\d{4}$/.test(mc) ? mc : undefined,
      orgId,
    };
  } catch {
    return null;
  }
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to read image"));
    img.src = src;
  });
}

function tryDecodeCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): string | null {
  const imgData = ctx.getImageData(0, 0, width, height);
  const code = jsQR(imgData.data, width, height, { inversionAttempts: "attemptBoth" });
  return code?.data?.trim() || null;
}

/**
 * Try decoding a QR code across multiple scales and crops so full PhonePe / GPay
 * merchant poster screenshots with logos and borders decode cleanly.
 */
function decodeQrFromImage(img: HTMLImageElement): string | null {
  const natW = img.naturalWidth || img.width;
  const natH = img.naturalHeight || img.height;
  if (!natW || !natH) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const attempts: Array<{ sx: number; sy: number; sw: number; sh: number; maxOut: number }> = [
    { sx: 0, sy: 0, sw: natW, sh: natH, maxOut: 1000 },
    { sx: 0, sy: 0, sw: natW, sh: natH, maxOut: 640 },
    // Center crop catches tall phone screenshots (GPay / PhonePe poster layout)
    {
      sx: Math.floor(natW * 0.1),
      sy: Math.floor(natH * 0.15),
      sw: Math.floor(natW * 0.8),
      sh: Math.floor(natH * 0.7),
      maxOut: 800,
    },
    {
      sx: Math.floor(natW * 0.15),
      sy: Math.floor(natH * 0.25),
      sw: Math.floor(natW * 0.7),
      sh: Math.floor(natH * 0.5),
      maxOut: 700,
    },
  ];

  for (const a of attempts) {
    const scale = Math.min(1, a.maxOut / Math.max(a.sw, a.sh));
    const dw = Math.max(1, Math.round(a.sw * scale));
    const dh = Math.max(1, Math.round(a.sh * scale));
    canvas.width = dw;
    canvas.height = dh;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, dw, dh);
    ctx.drawImage(img, a.sx, a.sy, a.sw, a.sh, 0, 0, dw, dh);

    const hit = tryDecodeCanvas(ctx, dw, dh);
    if (hit) return hit;
  }
  return null;
}

/**
 * Resize and compress any image File on a canvas so it stores reliably inside browser
 * storage without QuotaExceededError while keeping crisp QR edges.
 */
export async function compressImageFile(
  file: File,
  maxDimension: number = 720,
  quality: number = 0.86
): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

  const img = await loadImageElement(rawDataUrl);
  const natW = img.naturalWidth || img.width || maxDimension;
  const natH = img.naturalHeight || img.height || maxDimension;
  const scale = Math.min(1, maxDimension / Math.max(natW, natH));
  const targetW = Math.max(1, Math.round(natW * scale));
  const targetH = Math.max(1, Math.round(natH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return rawDataUrl;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const jpeg = canvas.toDataURL("image/jpeg", quality);
  return jpeg.length < rawDataUrl.length ? jpeg : rawDataUrl;
}

/**
 * Decode UPI metadata from a doctor's uploaded PhonePe / GPay QR photo AND produce
 * a compact, localStorage-safe image data URL.
 */
export async function decodeAndCompressUploadedQr(file: File): Promise<ProcessedUploadedQr> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read uploaded QR image"));
    reader.readAsDataURL(file);
  });

  const img = await loadImageElement(rawDataUrl);
  const decodedRaw = decodeQrFromImage(img);
  const decodedUpi = decodedRaw ? parseUpiQrPayload(decodedRaw) : null;

  const natW = img.naturalWidth || img.width || 640;
  const natH = img.naturalHeight || img.height || 640;
  const maxDim = 640;
  const scale = Math.min(1, maxDim / Math.max(natW, natH));
  const targetW = Math.max(1, Math.round(natW * scale));
  const targetH = Math.max(1, Math.round(natH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  let compressedDataUrl = rawDataUrl;
  let wasCompressed = false;

  if (ctx) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);
    // Use JPEG compression to fit cleanly under ~60KB inside localStorage
    const candidate = canvas.toDataURL("image/jpeg", 0.85);
    if (candidate.length < rawDataUrl.length || rawDataUrl.startsWith("data:image/svg+xml")) {
      compressedDataUrl = candidate;
      wasCompressed = true;
    }
  }

  return {
    compressedDataUrl,
    decodedUpi,
    wasCompressed,
  };
}

/**
 * Export any displayed QR (SVG or raster) as a crisp white-margined PNG data URL
 * so mobile browsers saving to Photos can import it via PhonePe / GPay "Scan from Gallery".
 */
export async function exportQrAsPngDataUrl(src: string, size: number = 800): Promise<string> {
  const img = await loadImageElement(src);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return src;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);

  const pad = Math.round(size * 0.06);
  const avail = size - pad * 2;
  const natW = img.naturalWidth || img.width || avail;
  const natH = img.naturalHeight || img.height || avail;
  const ratio = Math.min(avail / natW, avail / natH);
  const drawW = natW * ratio;
  const drawH = natH * ratio;
  const dx = (size - drawW) / 2;
  const dy = (size - drawH) / 2;

  ctx.imageSmoothingEnabled = src.startsWith("data:image/svg+xml") ? false : true;
  ctx.drawImage(img, dx, dy, drawW, drawH);

  return canvas.toDataURL("image/png");
}
