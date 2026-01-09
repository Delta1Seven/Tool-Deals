import DealsClient from "@/app/components/DealsClient";
import { getDeals } from "@/lib/deals";

export default async function Page() {
  const deals = await getDeals();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-14">
      <DealsClient deals={deals} />
    </main>
  );
}
