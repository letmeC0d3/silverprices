'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQItem } from '../lib/types';

interface FaqAccordionProps {
  faqs: FAQItem[];
  title?: string;
  subtitle?: string;
}

export default function FaqAccordion({
  faqs,
  title = 'Frequently Asked Questions About Silver Rates in India',
  subtitle = 'Everything you need to know about silver pricing, purity standards, taxation, and physical vs digital investments.',
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Generate Schema.org FAQPage JSON-LD
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      {/* Inject FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
          <HelpCircle className="w-4 h-4" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      <p className="text-xs text-slate-500 mb-6">{subtitle}</p>

      <div className="divide-y divide-slate-200">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-4 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between text-left font-semibold text-slate-900 hover:text-emerald-700 text-sm py-1 transition-colors"
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-2 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="mt-2 text-xs text-slate-600 leading-relaxed pr-4 animate-fadeIn">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
