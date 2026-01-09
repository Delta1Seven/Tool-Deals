import { type RawDeal, mockDeals } from "./mockDeals";

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

const isValidAsin = (asin: string) => /^[A-Z0-9]{10}$/.test(asin);

const isValidImageUrl = (imageUrl: string) => {
  if (!imageUrl || typeof imageUrl !== "string") {
    return false;
  }
  try {
    const parsed = new URL(imageUrl);
    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
    const isAmazonHost = parsed.hostname.endsWith("amazon.com");
    return isHttp && isAmazonHost;
  } catch {
    return false;
  }
};

const fetchRainforestDeals = async (): Promise<RawDeal[]> => {
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

  const response = await fetch(url.toString());

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    search_results?: Array<{
      asin?: string;
      title?: string;
      brand?: string;
      price?: { value?: number };
      price_before?: { value?: number };
      updated_at?: string;
      product?: {
        asin?: string;
        main_image?: { link?: string };
        images?: Array<{ link?: string }>;
      };
    }>;
  };

  return (data.search_results ?? [])
    .map((item) => {
      const rawAsin = item.asin ?? item.product?.asin ?? "";
      const asinMatch = rawAsin.match(/[A-Z0-9]{10}/i);
      const asin = asinMatch?.[0]?.toUpperCase() ?? "";
      const imageUrl =
        item.product?.main_image?.link ?? item.product?.images?.[0]?.link ?? "";

      return {
        asin,
        title: item.title ?? "",
        brand: item.brand ?? "Amazon",
        imageUrl,
        currentPrice: item.price?.value ?? 0,
        originalPrice: item.price_before?.value ?? item.price?.value ?? 0,
        lastUpdated: item.updated_at ?? new Date().toISOString()
      };
    })
    .filter((item) => {
      if (!item.title || item.currentPrice <= 0) {
        return false;
      }
      if (!isValidAsin(item.asin)) {
        return false;
      }
      if (!isValidImageUrl(item.imageUrl)) {
        return false;
      }
      return true;
    })
    .slice(0, 30);
};

export const getDeals = async (
  options: { useRainApi?: boolean } = {}
): Promise<Deal[]> => {
  if (options.useRainApi === true) {
    const rawDeals = await fetchRainforestDeals();
    return rawDeals.map(normalizeDeal);
  }

  if (options.useRainApi === false) {
    return mockDeals.map(normalizeDeal);
  }

  const useRainApiRaw = process.env.USE_RAIN_API ?? "";
  const useRainApi = useRainApiRaw.toLowerCase() === "true";
  if (!useRainApi) {
    return mockDeals.map(normalizeDeal);
  }

  const rawDeals = await fetchRainforestDeals();
  return rawDeals.map(normalizeDeal);
};
