import { Suspense } from "react";
import ReportedWyraClient from "../../../components/reported-wyra";

export default function Page() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading…</div>}>
      <ReportedWyraClient />
    </Suspense>
  );
}