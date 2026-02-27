"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PAGE_SIZE = 5;

export default function CompaniesTable({ companies }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(1);

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return companies;
    return companies.filter((company) =>
      [company.name, company.industry, company.location, company.stage].some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  }, [companies, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedCompanies = filteredCompanies.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const onSearch = (value) => {
    setSearch(value);
    setPage(1);

    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("search", value.trim());
    else params.delete("search");

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          type="text"
          placeholder="Search by name, industry, location, or stage"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring-2 sm:max-w-md"
        />
        <p className="text-sm text-slate-500">
          {filteredCompanies.length} result{filteredCompanies.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Industry</th>
              <th className="px-3 py-2 font-medium">Location</th>
              <th className="px-3 py-2 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCompanies.map((company) => (
              <tr key={company.id} className="border-b border-slate-100 last:border-b-0">
                <td className="px-3 py-3">
                  <Link href={`/companies/${company.id}`} className="font-medium text-slate-900 hover:text-blue-700">
                    {company.name}
                  </Link>
                </td>
                <td className="px-3 py-3 text-slate-700">{company.industry}</td>
                <td className="px-3 py-3 text-slate-700">{company.location}</td>
                <td className="px-3 py-3 text-slate-700">{company.stage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCompanies.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No companies match your search.
        </p>
      ) : (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={safePage === 1}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-sm text-slate-600">
            Page {safePage} of {totalPages}
          </p>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safePage === totalPages}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
