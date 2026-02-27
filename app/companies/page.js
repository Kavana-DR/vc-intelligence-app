import { Suspense } from "react";
import companies from "../../data/companies.json";
import CompaniesTable from "../components/CompaniesTable";

export default function CompaniesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Companies</h1>
        <p className="text-sm text-slate-600">Browse and filter companies in your discovery pipeline.</p>
      </div>
      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Loading companies...
          </div>
        }
      >
        <CompaniesTable companies={companies} />
      </Suspense>
    </div>
  );
}
