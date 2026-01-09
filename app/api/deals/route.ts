import { NextResponse } from "next/server";
import { getDeals } from "@/lib/deals";

export const revalidate = 3600;

export async function GET() {
  const useRainApiRaw = process.env.USE_RAIN_API ?? "";
  const useRainApi = useRainApiRaw.toLowerCase() === "true";
  console.log("USE_RAIN_API =", useRainApiRaw);
  console.log(useRainApi ? "USING RAINFOREST API" : "USING MOCK DEALS");
  const deals = await getDeals({ useRainApi });
  return NextResponse.json({ deals }, {
    headers: {
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
