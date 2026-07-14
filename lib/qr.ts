import "server-only";
import QRCode from "qrcode";

export async function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    margin: 1,
    width: 500,
    color: { dark: "#3a2e26", light: "#00000000" }, // tinta cálida, fondo transparente
  });
}
