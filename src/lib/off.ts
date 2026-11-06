/**
 * Open Food Facts: a free, open database of packaged foods (strong in France and Morocco).
 * https://openfoodfacts.github.io/openfoodfacts-server/api/
 *
 * - Search is rate-limited (about 10 searches a minute per user), so the Log screen waits until
 *   typing pauses and results are cached here for the session.
 * - Barcode lookups are cheap and unlimited for normal use.
 * Values are stored per 100 g, and the portion picker turns them into what was actually eaten.
 */
import { Platform } from 'react-native';

import type { Lang } from './i18n';

export type Per100 = { kcal: number; p: number; c: number; f: number };
export type OffFood = { code: string; name: string; brand?: string; per100: Per100; serving?: number; servingLabel?: string; img?: string };

const BASE = 'https://world.openfoodfacts.org';
const FIELDS = 'code,product_name,product_name_fr,product_name_en,product_name_ar,product_name_es,brands,nutriments,serving_quantity,serving_size,image_small_url,image_front_small_url';
// OFF asks apps to identify themselves. Browsers do not allow setting User-Agent, so only native sends it.
const HEADERS: Record<string, string> = Platform.OS === 'web' ? {} : { 'User-Agent': 'FuelAndForm/1.0 (Expo app)' };

const searchCache = new Map<string, OffFood[]>();
const codeCache = new Map<string, OffFood | null>();

const num = (v: unknown) => {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : NaN;
};
const round1 = (n: number) => Math.round(n * 10) / 10;

type RawProduct = Record<string, unknown> & { nutriments?: Record<string, unknown> };

/** Turns an OFF product into our shape, or null when it has no usable calories. */
export function parseProduct(raw: RawProduct, lang: Lang = 'en'): OffFood | null {
  const n = raw.nutriments ?? {};
  let kcal = num(n['energy-kcal_100g']);
  if (!Number.isFinite(kcal)) {
    const kj = num(n['energy-kj_100g'] ?? n['energy_100g']);
    if (Number.isFinite(kj)) kcal = kj / 4.184;
  }
  if (!Number.isFinite(kcal)) return null;
  const name = String(raw[`product_name_${lang}`] || raw.product_name || raw.product_name_fr || raw.product_name_en || '').trim();
  if (!name) return null;
  const g = (k: string) => { const v = num(n[k]); return Number.isFinite(v) ? round1(v) : 0; };
  const serving = num(raw.serving_quantity);
  const brand = String(raw.brands || '').split(',')[0].trim() || undefined;
  return {
    code: String(raw.code || ''),
    name,
    brand,
    per100: { kcal: Math.round(kcal), p: g('proteins_100g'), c: g('carbohydrates_100g'), f: g('fat_100g') },
    serving: Number.isFinite(serving) && serving > 0 && serving < 2000 ? serving : undefined,
    servingLabel: raw.serving_size ? String(raw.serving_size) : undefined,
    img: String(raw.image_front_small_url || raw.image_small_url || '') || undefined,
  };
}

/** Free-text search. Throws on network errors so the screen can say so. */
export async function searchOff(q: string, lang: Lang, signal?: AbortSignal): Promise<OffFood[]> {
  const key = `${lang}:${q.trim().toLowerCase()}`;
  const hit = searchCache.get(key);
  if (hit) return hit;
  const url = `${BASE}/cgi/search.pl?search_terms=${encodeURIComponent(q.trim())}&search_simple=1&action=process&json=1&page_size=20&lc=${lang}&fields=${FIELDS}`;
  const res = await fetch(url, { headers: HEADERS, signal });
  if (!res.ok) throw new Error(`Open Food Facts ${res.status}`);
  const data = (await res.json()) as { products?: RawProduct[] };
  const seen = new Set<string>();
  const out = (data.products ?? [])
    .map((p) => parseProduct(p, lang))
    .filter((p): p is OffFood => !!p && !seen.has(p.code) && !!seen.add(p.code));
  searchCache.set(key, out);
  return out;
}

/** Barcode lookup (EAN-13, EAN-8, UPC). Returns null when the product is unknown or has no calories. */
export async function productByCode(code: string, lang: Lang): Promise<OffFood | null> {
  if (codeCache.has(code)) return codeCache.get(code) ?? null;
  const res = await fetch(`${BASE}/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`, { headers: HEADERS });
  if (res.status === 404) { codeCache.set(code, null); return null; }
  if (!res.ok) throw new Error(`Open Food Facts ${res.status}`);
  const data = (await res.json()) as { status?: number; product?: RawProduct };
  const food = data.status === 1 && data.product ? parseProduct({ ...data.product, code }, lang) : null;
  codeCache.set(code, food);
  return food;
}

/** What a portion of `grams` contains. */
export function forGrams(per100: Per100, grams: number): Per100 {
  const k = grams / 100;
  return { kcal: Math.round(per100.kcal * k), p: round1(per100.p * k), c: round1(per100.c * k), f: round1(per100.f * k) };
}
