import Link from "next/link";
import Image from "next/image";
import { brand } from "@/lib/config/brand";

/** Top navigation shown on the public pages (/, /login, /signup). */
export default function BrandHeader() {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-[family-name:var(--font-playfair)] text-xl font-bold tracking-tight"
          style={{ color: brand.primaryColor }}
        >
          <Image src={brand.logo} alt={`${brand.name} logo`} width={28} height={28} />
          {brand.name}
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="rounded-md px-3 py-1.5 text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full px-3 py-2 text-xs font-semibold whitespace-nowrap text-white shadow-sm hover:brightness-110 sm:px-4 sm:text-sm"
            style={{ backgroundColor: brand.primaryColor }}
          >
            <span className="sm:hidden">Start</span>
            <span className="hidden sm:inline">Start your list</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
