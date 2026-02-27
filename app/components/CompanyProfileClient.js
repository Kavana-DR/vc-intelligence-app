"use client";

import Link from "next/link";
import { useState } from "react";

export default function CompanyProfileClient({ company }) {
  const enrichmentCacheKey = `company-enrichment-${company.id}`;

  const [notes, setNotes] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(`company-notes-${company.id}`) || "";
  });

  const [isSaved, setIsSaved] = useState(() => {
    if (typeof window === "undefined") return false;
    const savedCompanies = JSON.parse(localStorage.getItem("saved-companies") || "[]");
    return savedCompanies.some((item) => item.id === company.id);
  });

  const [enrichData, setEnrichData] = useState(() => {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem(enrichmentCacheKey);
    if (!cached) return null;

    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [enrichError, setEnrichError] = useState("");

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

  const enrichCompany = async () => {
    setLoading(true);
    setEnrichError("");

    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ website: company.website }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEnrichError(data?.error || "We could not enrich this company right now. Please try again in a bit.");
        return;
      }

      if (!data?.result) {
        setEnrichError("Enrichment finished, but no insights were returned.");
        return;
      }

      setEnrichData(data.result);
      localStorage.setItem(enrichmentCacheKey, JSON.stringify(data.result));

    } catch (error) {
      console.error("Enrichment failed:", error);
      setEnrichError("Enrichment is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
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

      {/* Company Info */}
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

      {/* Notes */}
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

      {/* Enrichment Section */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">AI Enrichment</h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(enrichmentCacheKey);
                setEnrichData(null);
              }}
              disabled={loading || !enrichData}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Clear Cache
            </button>
            <button
              type="button"
              onClick={enrichCompany}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              {loading ? "Enriching..." : enrichData ? "Refresh Enrichment" : "Enrich Company"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-800">Loading AI insights...</p>
          </div>
        ) : enrichError ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">{enrichError}</p>
          </div>
        ) : typeof enrichData === "string" ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{enrichData}</p>
          </div>
        ) : enrichData ? (
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard title="Summary" content={enrichData.summary || "Not available yet."} />
            <InfoCard title="What they do" content={enrichData.whatTheyDo} />
            <InfoCard title="Keywords" content={enrichData.keywords} />
            <InfoCard title="Signals" content={enrichData.signals} />
            <InfoCard title="Sources" content={enrichData.sources} />
            <InfoCard
              title="Website Metadata"
              content={[
                `Title: ${enrichData.metadata?.title || "Unavailable"}`,
                `Description: ${enrichData.metadata?.description || "Unavailable"}`,
              ]}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500">
            Click <strong>Enrich Company</strong> to fetch AI insights about this company.
          </div>
        )}
      </section>
    </div>
  );
}

function InfoCard({ title, content }) {
  const items = Array.isArray(content) ? content.filter(Boolean) : [];

  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1 text-sm text-slate-800">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">
          {typeof content === "string" && content ? content : "Not available yet."}
        </p>
      )}
    </article>
  );
}
