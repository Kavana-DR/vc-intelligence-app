"use client";

import { useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "saved-searches";

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  });
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");

  const persist = (nextSearches) => {
    setSearches(nextSearches);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSearches));
  };

  const saveSearch = () => {
    const label = name.trim();
    if (!label) return;

    const nextSearch = {
      id: Date.now(),
      name: label,
      query: query.trim(),
      createdAt: new Date().toISOString(),
    };

    persist([nextSearch, ...searches]);
    setName("");
    setQuery("");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Saved Searches</h1>
        <p className="text-sm text-slate-600">Store reusable search filters in local storage.</p>
      </div>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Save New Search</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Search name (e.g., Fintech Growth)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search text"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
        />
        <button
          type="button"
          onClick={saveSearch}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Save Search
        </button>
      </section>

      <section className="space-y-3">
        {searches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No saved searches yet.
          </div>
        ) : (
          searches.map((saved) => (
            <article key={saved.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{saved.name}</h3>
                  <p className="text-sm text-slate-600">
                    Query: <span className="font-medium">{saved.query || "(empty)"}</span>
                  </p>
                </div>
                <Link
                  href={saved.query ? `/companies?search=${encodeURIComponent(saved.query)}` : "/companies"}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Run Search
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
