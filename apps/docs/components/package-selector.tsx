'use client';

import { useCallback, useState } from 'react';

// Packages available in the docs. Add new entries here when a new feature
// package ships; the selector will pick them up automatically.
export const docsPackages = [
  {
    href: '/docs',
    label: '@discord-selfbot/core',
    value: 'core',
  },
] as const;

export type DocsPackage = (typeof docsPackages)[number];

export const PackageSelector = () => {
  const [value, setValue] = useState<string>(docsPackages[0].value);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const next = docsPackages.find((pkg) => pkg.value === event.target.value);
      setValue(event.target.value);
      if (next && next.href && next.value !== value) {
        window.location.assign(next.href);
      }
    },
    [value]
  );

  return (
    <select
      aria-label="Documentation package"
      className="border-fd-border bg-fd-card hover:bg-fd-accent rounded-md border px-2 py-1 font-mono text-xs transition-colors"
      onChange={handleChange}
      value={value}
    >
      {docsPackages.map((pkg) => (
        <option key={pkg.value} value={pkg.value}>
          {pkg.label}
        </option>
      ))}
      {docsPackages.length < 2 ? (
        <option disabled value="__more__">
          More packages coming soon
        </option>
      ) : null}
    </select>
  );
};
