import companies from "../../data/companies.json";
import CompaniesTable from "../components/CompaniesTable";

export default function CompaniesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Companies</h1>
        <p className="text-sm text-slate-600">Browse and filter companies in your discovery pipeline.</p>
      </div>
      <CompaniesTable companies={companies} />
    </div>
  );
}
