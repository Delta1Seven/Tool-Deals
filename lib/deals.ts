import { unstable_cache } from "next/cache";
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
const USE_MOCK_DATA = process.env.USE_MOCK_DATA !== "false";

const toAffiliateLink = (asin: string) =>
  `https://www.amazon.com/dp/${asin}?tag=${affiliateTag}`;

const normalizeDeal = (deal: RawDeal): Deal => {
  const amountOff = Math.max(0, deal.originalPrice - deal.currentPrice);
  const percentOff = deal.originalPrice
    ? Math.round((amountOff / deal.originalPrice) * 100)
    : 0;

  return {
    ...deal,
    amountOff,
    percentOff,
    link: toAffiliateLink(deal.asin),
    alerts: []
  };
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
        image: item.image ?? "",
        currentPrice: item.price?.value ?? 0,
        originalPrice: item.price_before?.value ?? item.price?.value ?? 0,
        droppedAt: item.updated_at ?? new Date().toISOString()
      }));
  },
  ["rainforest-deals"],
  { revalidate: 3600 }
);

export const getDeals = async (): Promise<Deal[]> => {
  const rawDeals = USE_MOCK_DATA ? mockDeals : await fetchRainforestDeals();
  return rawDeals.map(normalizeDeal);
};
