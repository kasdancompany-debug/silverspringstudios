import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { ARTICLES, RESOURCE_HUBS, articlePath } from "@/lib/resources/articles";
import { listPublishedPartners } from "@/lib/partners/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Draft legal pages and unfinished article outlines stay on the site but
  // out of the sitemap until counsel-approved / fully published.
  const routes = [
    "",
    "/submit",
    "/how-it-works",
    "/what-we-look-for",
    "/filmmakers",
    "/about",
    "/our-approach",
    "/contact",
    "/resources",
    "/checklist",
  ];

  const hubRoutes = RESOURCE_HUBS.map((hub) => `/resources/${hub.slug}`);
  const articleRoutes = ARTICLES.filter((article) => article.status === "published").map((article) =>
    articlePath(article),
  );

  const { data: partners } = await listPublishedPartners();
  const partnerRoutes = partners.map((partner) => `/partners/${partner.slug}`);

  const staticEntries = [...routes, ...hubRoutes, ...articleRoutes, ...partnerRoutes].map(
    (route) => ({
      url: `${SITE.url}${route}`,
      lastModified: new Date(),
      changeFrequency:
        route === "" || route === "/resources" ? ("weekly" as const) : ("monthly" as const),
      priority:
        route === ""
          ? 1
          : route === "/submit" || route === "/resources" || route === "/checklist" || route === "/our-approach"
            ? 0.9
            : route.startsWith("/partners/")
              ? 0.6
              : route.startsWith("/resources/")
                ? 0.7
                : 0.7,
    }),
  );

  return staticEntries;
}
