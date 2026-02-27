"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/companies", label: "Companies", icon: "building" },
  { href: "/lists", label: "Lists", icon: "list" },
  { href: "/saved", label: "Saved Searches", icon: "bookmark" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-slate-200 bg-white shadow-sm lg:min-h-screen lg:w-72 lg:border-r lg:border-b-0">
      <div className="px-6 pt-7 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Navigation</p>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 pb-5 lg:block lg:space-y-2 lg:px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <NavIcon type={item.icon} active={isActive} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function NavIcon({ type, active }) {
  const colorClass = active ? "text-white" : "text-slate-500";

  if (type === "building") {
    return (
      <svg className={`h-4 w-4 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 10h.01M9 14h.01M9 18h.01M15 10h.01M15 14h.01M15 18h.01" />
      </svg>
    );
  }

  if (type === "list") {
    return (
      <svg className={`h-4 w-4 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    );
  }

  return (
    <svg className={`h-4 w-4 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
