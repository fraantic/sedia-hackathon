"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ReportFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get("id");

  return (
    <main>
      <h1> IF you see this, it is routed correctly.</h1>
      <button onClick={() => router.push(`/user?id=${locationId}`)}>
        Go Back Button
      </button>
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <ReportFormContent />
    </Suspense>
  );
}