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

  const insights = useMemo(() => {
    const industries = new Set(companies.map((company) => company.industry).filter(Boolean));
    const regions = new Set(companies.map((company) => company.location).filter(Boolean));

    return {
      totalCompanies: companies.length,
      industriesCount: industries.size,
      regionsCount: regions.size,
    };
  }, [companies]);

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
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
      <section className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-3">
        <InsightStat label="Total Companies" value={insights.totalCompanies} />
        <InsightStat label="Industries" value={insights.industriesCount} />
        <InsightStat label="Regions Represented" value={insights.regionsCount} />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          type="text"
          placeholder="Search by name, industry, location, or stage"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition-all duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:max-w-md"
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
              <th className="px-3 py-2 font-medium">Signals</th>
              <th className="px-3 py-2 font-medium">Stage</th>
              <th className="px-3 py-2 font-medium">Momentum</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCompanies.map((company) => (
              <tr
                key={company.id}
                className="border-b border-slate-100 transition-all duration-150 hover:-translate-y-px hover:bg-slate-50 hover:shadow-sm last:border-b-0"
              >
                <td className="px-3 py-3">
                  <Link href={`/companies/${company.id}`} className="inline-flex items-center gap-2.5 font-semibold text-slate-800 hover:text-blue-700">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                      {String(company.name).charAt(0).toUpperCase()}
                    </span>
                    <span>{company.name}</span>
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-medium ${getIndustryBadgeClasses(company.industry)}`}
                  >
                    {company.industry}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-700">{company.location}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {buildSignals(company).map((signal) => (
                      <span
                        key={`${company.id}-${signal}`}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className={getStageBadgeClasses(company.stage)}>
                    {company.stage}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <Sparkline seed={company.name} />
                </td>
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
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function InsightStat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function getStageBadgeClasses(stage) {
  return stage === "Series B"
    ? "bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-medium border border-blue-100"
    : stage === "Series C"
      ? "bg-purple-50 text-purple-600 px-2 py-1 rounded-md text-xs font-medium border border-purple-100"
      : stage === "Series D"
        ? "bg-green-50 text-green-600 px-2 py-1 rounded-md text-xs font-medium border border-green-100"
        : "bg-slate-50 text-slate-600 px-2 py-1 rounded-md text-xs font-medium border border-slate-200";
}

function getIndustryBadgeClasses(industry) {
  const lower = String(industry).toLowerCase();

  if (lower.includes("fintech")) return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (lower.includes("product")) return "border-indigo-100 bg-indigo-50 text-indigo-700";

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function buildSignals(company) {
  const signals = [];

  signals.push(company.location === "USA" ? "Global" : "Regional");
  signals.push(company.industry === "Fintech" ? "Fintech" : company.industry === "Productivity" ? "SaaS" : "Startup");
  signals.push(company.stage);

  return signals;
}

function Sparkline({ seed }) {
  const points = buildSparklinePoints(seed);

  return (
    <svg viewBox="0 0 80 24" className="h-6 w-20">
      <path d={points} fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400" />
      <path d={points} fill="none" stroke="currentColor" strokeWidth="1" className="text-indigo-200" />
    </svg>
  );
}

function buildSparklinePoints(seed) {
  const chars = String(seed).split("");
  const values = chars.slice(0, 6).map((char, index) => ((char.charCodeAt(0) + index * 7) % 12) + 6);
  const padded = values.length < 6 ? [...values, ...Array(6 - values.length).fill(10)] : values;
  const mapped = padded.map((val, index) => `${index * 14},${24 - val}`);
  return `M ${mapped.join(" L ")}`;
}
