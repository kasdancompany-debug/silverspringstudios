import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

export function createMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
  type = "website",
  publishedTime,
  modifiedTime,
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const url = `${SITE.url}${path}`;
  const fullTitle =
    title === SITE.name
      ? `${SITE.name} | Independent Film Distribution`
      : `${title} | ${SITE.name}`;

  // Open Graph images come from src/app/opengraph-image.tsx (generated).
  // Do not hardcode a missing /og-image.jpg asset.
  const openGraph =
    type === "article"
      ? {
          title: fullTitle,
          description,
          url,
          siteName: SITE.name,
          type: "article" as const,
          locale: "en_US",
          ...(publishedTime ? { publishedTime } : {}),
          ...(modifiedTime ? { modifiedTime } : {}),
        }
      : {
          title: fullTitle,
          description,
          url,
          siteName: SITE.name,
          type: "website" as const,
          locale: "en_US",
        };

  return {
    title: { absolute: fullTitle },
    description,
    metadataBase: new URL(SITE.url),
    alternates: { canonical: url },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    email: SITE.email,
    areaServed: ["CA", "US"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; path: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FaqJsonLd({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
