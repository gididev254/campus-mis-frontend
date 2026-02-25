/**
 * StructuredData component - Injects JSON-LD structured data into the page
 */
import React from 'react';

interface StructuredDataProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
