"use client";

import Link from "next/link";
import { useState } from "react";

export default function CompanyProfileClient({ company }) {
  const [notes, setNotes] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(`company-notes-${company.id}`) || "";
  });
  const [isSaved, setIsSaved] = useState(() => {
    if (typeof window === "undefined") return false;
    const savedCompanies = JSON.parse(localStorage.getItem("saved-companies") || "[]");
    return savedCompanies.some((item) => item.id === company.id);
  });
  const [enriched, setEnriched] = useState(false);

  const persistNotes = (nextNotes) => {
    setNotes(nextNotes);
    localStorage.setItem(`company-notes-${company.id}`, nextNotes);
  };

  const saveCompany = () => {
    const savedCompanies = JSON.parse(localStorage.getItem("saved-companies") || "[]");
    if (savedCompanies.some((item) => item.id === company.id)) return;
    const updated = [...savedCompanies, company];
    localStorage.setItem("saved-companies", JSON.stringify(updated));
    setIsSaved(true);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            <Link href="/companies" className="hover:text-slate-700">
              Companies
            </Link>{" "}
            / Profile
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">{company.name}</h1>
        </div>
        <button
          type="button"
          onClick={saveCompany}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-default disabled:opacity-60"
          disabled={isSaved}
        >
          {isSaved ? "Company Saved" : "Save Company"}
        </button>
      </div>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Website</p>
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            {company.website}
          </a>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Industry</p>
          <p className="text-sm text-slate-800">{company.industry}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
          <p className="text-sm text-slate-800">{company.location}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Stage</p>
          <p className="text-sm text-slate-800">{company.stage}</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => persistNotes(e.target.value)}
          rows={6}
          placeholder="Add your investment notes here..."
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-slate-300 focus:ring-2"
        />
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Enrichment</h2>
          <button
            type="button"
            onClick={() => setEnriched(true)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Enrich Company
          </button>
        </div>

        {enriched ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <EnrichmentCard title="Summary" value={`${company.name} is a ${company.stage} company in ${company.industry}.`} />
            <EnrichmentCard title="What they do" value={`${company.name} builds solutions for customers in ${company.location}.`} />
            <EnrichmentCard title="Keywords" value={`${company.industry}, ${company.stage}, ${company.location}`} />
            <EnrichmentCard title="Signals" value="Hiring growth, product launches, and market expansion placeholders." />
            <EnrichmentCard title="Sources" value={`${company.website}, news APIs, and CRM data source placeholders.`} />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500">
            Enrichment placeholders will appear here after you click &quot;Enrich Company&quot;.
          </div>
        )}
      </section>
    </div>
  );
}

function EnrichmentCard({ title, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:col-span-1">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-sm text-slate-800">{value}</p>
    </div>
  );
}
