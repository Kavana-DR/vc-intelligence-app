"use client";

import { useState } from "react";
import companies from "../../data/companies.json";

const STORAGE_KEY = "vc-lists";

export default function ListsPage() {
  const [lists, setLists] = useState(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  });
  const [newListName, setNewListName] = useState("");

  const persist = (nextLists) => {
    setLists(nextLists);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLists));
  };

  const createList = () => {
    const name = newListName.trim();
    if (!name) return;
    const next = [...lists, { id: Date.now(), name, companyIds: [] }];
    persist(next);
    setNewListName("");
  };

  const addCompanyToList = (listId, companyId) => {
    const next = lists.map((list) => {
      if (list.id !== listId || list.companyIds.includes(companyId)) return list;
      return { ...list, companyIds: [...list.companyIds, companyId] };
    });
    persist(next);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Lists</h1>
        <p className="text-sm text-slate-600">Create and manage company lists in local storage.</p>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          type="text"
          placeholder="New list name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
        />
        <button
          type="button"
          onClick={createList}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:w-auto"
        >
          Create List
        </button>
      </div>

      <div className="space-y-4">
        {lists.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No lists yet. Create one to start organizing companies.
          </div>
        ) : (
          lists.map((list) => {
            const listCompanies = companies.filter((company) => list.companyIds.includes(company.id));
            const available = companies.filter((company) => !list.companyIds.includes(company.id));
            return (
              <section key={list.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">{list.name}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {listCompanies.length} compan{listCompanies.length === 1 ? "y" : "ies"}
                  </span>
                </div>

                <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      addCompanyToList(list.id, Number(e.target.value));
                      e.target.value = "";
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
                  >
                    <option value="">Add company to list</option>
                    {available.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                {listCompanies.length === 0 ? (
                  <p className="text-sm text-slate-500">No companies in this list yet.</p>
                ) : (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {listCompanies.map((company) => (
                      <li key={company.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                        <p className="font-medium text-slate-900">{company.name}</p>
                        <p className="text-slate-600">
                          {company.industry} | {company.location} | {company.stage}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
