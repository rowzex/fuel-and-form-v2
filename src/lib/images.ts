import { useEffect, useState } from 'react';

// Food photos come from TheMealDB's free public API (test key "1").
const API = 'https://www.themealdb.com/api/json/v1/1';

export function ingredientImage(name: string): string {
  if (/^https?:\/\//.test(name)) return name; // a product photo URL (Open Food Facts)
  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}-Small.png`;
}

type Meal = { strMealThumb?: string };
const cache = new Map<string, Promise<string | null>>();

function pick(list: Meal[] | null | undefined, seed: string): string | null {
  const thumbs = (list ?? []).map((m) => m.strMealThumb).filter((u): u is string => !!u);
  if (!thumbs.length) return null;
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return thumbs[Math.abs(h) % thumbs.length];
}

async function getJson(url: string): Promise<{ meals?: Meal[] | null } | null> {
  try {
    const res = await fetch(url);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** Finds a dish photo: by dish name first, then by main ingredient. The title varies the pick between similar dishes. */
export function findDishImage(query: string, ingredient: string, title: string): Promise<string | null> {
  const key = `${query}|${ingredient}|${title}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = (async () => {
      const byName = await getJson(`${API}/search.php?s=${encodeURIComponent(query)}`);
      const a = pick(byName?.meals, title);
      if (a) return a;
      const byIngredient = await getJson(`${API}/filter.php?i=${encodeURIComponent(ingredient.replace(/ /g, '_'))}`);
      return pick(byIngredient?.meals, title);
    })();
    cache.set(key, hit);
  }
  return hit;
}

export function useDishImage(query: string, ingredient: string, title: string): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    findDishImage(query, ingredient, title).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [query, ingredient, title]);
  return url;
}
