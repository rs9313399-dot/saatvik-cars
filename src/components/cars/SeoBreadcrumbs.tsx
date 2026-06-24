'use client';

import { useMemo } from 'react';

/**
 * SeoBreadcrumbs — emits a BreadcrumbList JSON-LD script so search
 * engines can render breadcrumb rich results for the Saatvik Cars
 * single-page site.
 *
 * Renders NO visible UI — just the `<script>` tag. Drop `<SeoBreadcrumbs />`
 * anywhere on the page (e.g. near the top of page.tsx) to enable.
 *
 * Main agent owns layout.tsx / page.tsx, so this is a self-contained
 * client component the main agent can mount without touching those files.
 */
export default function SeoBreadcrumbs() {
  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://saatvikcars.in/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Used Cars',
          item: 'https://saatvikcars.in/#cars',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Finance',
          item: 'https://saatvikcars.in/#finance',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Services',
          item: 'https://saatvikcars.in/#services',
        },
      ],
    }),
    [],
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
