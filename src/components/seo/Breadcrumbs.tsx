import Link from "next/link"
import { breadcrumbJsonLd } from "@/lib/seo"

interface BreadcrumbItem {
  name: string
  path: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(items)),
        }}
      />
      <nav aria-label="breadcrumb" className="mb-8">
        <ol className="flex items-center gap-1.5 text-sm text-[#43474e]">
          <li>
            <Link
              href="/"
              className="hover:text-[#795900] transition-colors"
            >
              홈
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={item.path} className="flex items-center gap-1.5">
              <span className="text-[#c4c6cf]">/</span>
              {i === items.length - 1 ? (
                <span className="text-[#022448] font-medium truncate max-w-[200px] sm:max-w-none">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="hover:text-[#795900] transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
