import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `https://silverprices.in${item.url}`,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      {/* Schema.org BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <ol className="flex items-center space-x-1.5 text-xs text-slate-500 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.url} className="flex items-center space-x-1.5">
              {index === 0 ? (
                <Link
                  href={item.url}
                  className="flex items-center space-x-1 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.name}</span>
                </Link>
              ) : isLast ? (
                <span className="font-semibold text-slate-800" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {item.name}
                </Link>
              )}

              {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
