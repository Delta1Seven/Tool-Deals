"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Deal } from "@/lib/deals";

const sortOptions = [
  { value: "percent", label: "Highest % off" },
  { value: "amount", label: "Highest $ off" },
  { value: "brand", label: "Brand A–Z" },
  { value: "recent", label: "Recently dropped" }
];

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);

export default function DealsClient({ deals }: { deals: Deal[] }) {
  const [sortBy, setSortBy] = useState("percent");
  const fallbackImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23f5f5f5'/%3E%3Cpath d='M48 104h64l-16-24-12 16-8-10-28 18z' fill='%23d4d4d4'/%3E%3Ccircle cx='62' cy='58' r='10' fill='%23e5e5e5'/%3E%3C/svg%3E";

  const sortedDeals = useMemo(() => {
    const nextDeals = [...deals];

    switch (sortBy) {
      case "amount":
        return nextDeals.sort((a, b) => b.amountOff - a.amountOff);
      case "brand":
        return nextDeals.sort((a, b) => a.brand.localeCompare(b.brand));
      case "recent":
        return nextDeals.sort(
          (a, b) => new Date(b.droppedAt).getTime() - new Date(a.droppedAt).getTime()
        );
      case "percent":
      default:
        return nextDeals.sort((a, b) => b.percentOff - a.percentOff);
    }
  }, [deals, sortBy]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Curated Amazon deals
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Tools & garage equipment
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-500">
            Minimal, up-to-date pricing with clean comparisons for the best tool savings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs uppercase tracking-[0.3em] text-neutral-400" htmlFor="sort">
            Sort
          </label>
          <select
            id="sort"
            className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 shadow-sm focus:border-neutral-300 focus:outline-none"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedDeals.map((deal) => (
          <article
            key={deal.asin}
            className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                {deal.brand}
              </span>
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-500">
                {deal.percentOff}% off
              </span>
            </div>
            <div className="mt-4 flex justify-center">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50">
                <Image
                  src={deal.image || fallbackImage}
                  alt={deal.title}
                  fill
                  sizes="80px"
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
            <h2
              className="mt-4 text-sm font-semibold text-neutral-900"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            >
              {deal.title}
            </h2>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-base font-semibold text-neutral-900">
                {formatPrice(deal.currentPrice)}
              </span>
              <span className="text-sm text-neutral-400 line-through">
                {formatPrice(deal.originalPrice)}
              </span>
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Save {formatPrice(deal.amountOff)}
            </div>
            <div className="mt-4">
              <a
                href={deal.link}
                className="inline-flex w-full items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-900"
                target="_blank"
                rel="noreferrer"
              >
                View on Amazon
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
