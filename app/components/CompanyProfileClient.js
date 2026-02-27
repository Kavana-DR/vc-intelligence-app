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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-500">
            <Link href="/companies" className="transition-colors hover:text-slate-700">
              Companies
            </Link>{" "}
            <span className="mx-1 text-slate-300">/</span>
            <span className="text-slate-600">Profile</span>
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{company.name}</h1>
        </div>

        <button
          type="button"
          onClick={saveCompany}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md disabled:cursor-default disabled:opacity-60"
          disabled={isSaved}
        >
          {isSaved ? "Company Saved" : "Save Company"}
        </button>
      </div>

      {/* Company Info */}
      <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-transform duration-200 hover:-translate-y-0.5 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Website</p>
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-blue-700 transition-colors hover:text-blue-800 hover:underline"
          >
            {company.website}
          </a>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Industry</p>
          <p className="text-sm font-medium text-slate-800">{company.industry}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Location</p>
          <p className="text-sm font-medium text-slate-800">{company.location}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Stage</p>
          <p className="text-sm font-medium text-slate-800">{company.stage}</p>
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-transform duration-200 hover:-translate-y-0.5">
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-slate-900">Notes</h2>

        <textarea
          value={notes}
          onChange={(e) => persistNotes(e.target.value)}
          rows={6}
          placeholder="Add your investment notes here..."
          className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
        />
      </section>

      {/* Enrichment Section */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">AI Enrichment</h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(enrichmentCacheKey);
                setEnrichData(null);
              }}
              disabled={loading || !enrichData}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow disabled:opacity-50"
            >
              Clear Cache
            </button>
            <button
              type="button"
              onClick={enrichCompany}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow disabled:opacity-50"
            >
              {loading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              ) : null}
              {loading ? "Enriching..." : enrichData ? "Refresh Enrichment" : "Enrich Company"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-800">Loading AI insights...</p>
          </div>
        ) : enrichError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">{enrichError}</p>
          </div>
        ) : typeof enrichData === "string" ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{enrichData}</p>
          </div>
        ) : enrichData ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-5 text-sm text-slate-500">
            Click <strong>Enrich Company</strong> to fetch AI insights about this company.
          </div>
        )}
      </section>
    </div>
  );
}

function InfoCard({ title, content }) {
  const items = Array.isArray(content) ? content.filter(Boolean) : [];
  const accentClasses = getAccentClasses(title);
  const icon = getCardIcon(title);

  return (
    <article
      className={`rounded-xl border ${accentClasses.border} ${accentClasses.bg} p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
    >
      <h3 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
        <span className={accentClasses.icon}>{icon}</span>
        {title}
      </h3>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-sm text-slate-800">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
          {typeof content === "string" && content ? content : "Not available yet."}
        </p>
      )}
    </article>
  );
}

function getAccentClasses(title) {
  if (title === "Summary") {
    return { border: "border-blue-200", bg: "bg-blue-50/50", icon: "text-blue-700" };
  }
  if (title === "What they do") {
    return { border: "border-emerald-200", bg: "bg-emerald-50/50", icon: "text-emerald-700" };
  }
  if (title === "Keywords") {
    return { border: "border-violet-200", bg: "bg-violet-50/50", icon: "text-violet-700" };
  }
  if (title === "Signals") {
    return { border: "border-amber-200", bg: "bg-amber-50/60", icon: "text-amber-700" };
  }
  if (title === "Sources") {
    return { border: "border-cyan-200", bg: "bg-cyan-50/50", icon: "text-cyan-700" };
  }
  return { border: "border-slate-200", bg: "bg-slate-50", icon: "text-slate-700" };
}

function getCardIcon(title) {
  if (title === "Summary") return "S";
  if (title === "What they do") return "W";
  if (title === "Keywords") return "K";
  if (title === "Signals") return "G";
  if (title === "Sources") return "R";
  return "M";
}
