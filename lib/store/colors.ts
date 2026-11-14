/** Small colour helpers so every store page can be themed from the owner's brand colours. */
function parse(hex: string): [number, number, number] {
  const h = (/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#2563eb').slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
export function rgba(hex: string, a: number): string {
  const [r, g, b] = parse(hex);
  return `rgba(${r},${g},${b},${a})`;
}
export function shade(hex: string, amount: number): string {
  // amount -1..1 : negative darkens, positive lightens
  const [r, g, b] = parse(hex).map((v) => Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount));
  return `rgb(${r},${g},${b})`;
}
export function telHref(phone: string): string {
  const d = phone.replace(/\D/g, '');
  return `tel:+${d.length === 10 ? '91' + d : d}`;
}
export function prettyPhone(phone: string): string {
  const d = phone.replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : phone;
}
export function instagramHandle(url: string): string {
  const m = url.match(/instagram\.com\/([^/?#]+)/i);
  return m ? `@${m[1]}` : 'Instagram';
}
