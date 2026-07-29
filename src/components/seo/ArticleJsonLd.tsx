import { SITE } from "@/lib/constants";

export function ArticleJsonLd({
  headline,
  description,
  author,
  publishedAt,
  updatedAt,
  path,
  image,
}: {
  headline: string;
  description: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  path: string;
  image?: string;
}) {
  const url = `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    author: {
      "@type": "Organization",
      name: author,
    },
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    ...(image
      ? {
          image: [image.startsWith("http") ? image : `${SITE.url}${image}`],
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
