import { unstable_cache } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import { mockDeals, type RawDeal } from "./mockDeals";

export type Deal = {
  asin: string;
  title: string;
  brand: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  percentOff: number;
  amountOff: number;
  droppedAt: string;
  link: string;
  alerts: string[];
};

const affiliateTag = "deals03ce-20";
const USE_RAIN_API = process.env.USE_RAIN_API === "true";
const cacheFilePath = path.join(process.cwd(), "data", "cachedDeals.json");

const toAffiliateLink = (asin: string) =>
  `https://www.amazon.com/dp/${asin}?tag=${affiliateTag}`;

const normalizeDeal = (deal: RawDeal): Deal => {
  const amountOff = Math.max(0, deal.originalPrice - deal.currentPrice);
  const percentOff = deal.originalPrice
    ? Math.round((amountOff / deal.originalPrice) * 100)
    : 0;

  return {
    asin: deal.asin,
    title: deal.title,
    brand: deal.brand,
    image: deal.imageUrl,
    currentPrice: deal.currentPrice,
    originalPrice: deal.originalPrice,
    amountOff,
    percentOff,
    droppedAt: deal.lastUpdated,
    link: toAffiliateLink(deal.asin),
    alerts: []
  };
};

const readCachedDeals = async (): Promise<RawDeal[] | null> => {
  try {
    const contents = await fs.readFile(cacheFilePath, "utf8");
    const parsed = JSON.parse(contents);
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed as RawDeal[];
  } catch (error) {
    return null;
  }
};

const writeCachedDeals = async (deals: RawDeal[]): Promise<void> => {
  await fs.mkdir(path.dirname(cacheFilePath), { recursive: true });
  await fs.writeFile(cacheFilePath, JSON.stringify(deals, null, 2));
};

const fetchRainforestDeals = unstable_cache(
  async (): Promise<RawDeal[]> => {
    const apiKey = process.env.RAINFOREST_API_KEY;
    if (!apiKey) {
      return [];
    }

    const url = new URL("https://api.rainforestapi.com/request");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("type", "search");
    url.searchParams.set("amazon_domain", "amazon.com");
    url.searchParams.set("search_term", "garage tools deals");
    url.searchParams.set("output", "json");

    const response = await fetch(url.toString(), {
      cache: "force-cache",
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as {
      search_results?: Array<{
        asin?: string;
        title?: string;
        brand?: string;
        image?: string;
        price?: { value?: number };
        price_before?: { value?: number };
        updated_at?: string;
      }>;
    };

    return (data.search_results ?? [])
      .filter((item) => item.asin && item.title && item.price?.value)
      .map((item) => ({
        asin: item.asin as string,
        title: item.title as string,
        brand: item.brand ?? "Amazon",
        imageUrl: item.image ?? "",
        currentPrice: item.price?.value ?? 0,
        originalPrice: item.price_before?.value ?? item.price?.value ?? 0,
        lastUpdated: item.updated_at ?? new Date().toISOString()
      }));
  },
  ["rainforest-deals"],
  { revalidate: 3600 }
);

export const getDeals = async (): Promise<Deal[]> => {
  const cachedDeals = await readCachedDeals();
  if (cachedDeals) {
    return cachedDeals.map(normalizeDeal);
  }

  if (!USE_RAIN_API) {
    return mockDeals.map(normalizeDeal);
  }

  const rawDeals = await fetchRainforestDeals();
  await writeCachedDeals(rawDeals);
  return rawDeals.map(normalizeDeal);
};
