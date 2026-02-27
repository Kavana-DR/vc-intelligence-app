"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/companies", label: "Companies" },
  { href: "/lists", label: "Lists" },
  { href: "/saved", label: "Saved Searches" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-slate-200 bg-white lg:min-h-screen lg:w-64 lg:border-r lg:border-b-0">
      <div className="px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Navigation</p>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
