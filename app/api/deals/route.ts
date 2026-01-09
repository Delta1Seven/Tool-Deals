import { NextResponse } from "next/server";
import { getDeals } from "@/lib/deals";

export const revalidate = 3600;

export async function GET() {
  const deals = await getDeals();
  return NextResponse.json({ deals }, {
    headers: {
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
