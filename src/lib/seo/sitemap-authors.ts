export type SitemapAuthorProfile = {
  id: string;
  slug: string;
};

export type SitemapContentAuthorLink = {
  author_profile_id: string | null;
  content_id: string | null;
};

export function authorsWithPublishedContent(
  profiles: SitemapAuthorProfile[],
  links: SitemapContentAuthorLink[],
  publishedContentIds: ReadonlySet<string>,
) {
  const eligibleAuthorIds = new Set(
    links
      .filter(
        (link): link is { author_profile_id: string; content_id: string } =>
          Boolean(
            link.author_profile_id &&
              link.content_id &&
              publishedContentIds.has(link.content_id),
          ),
      )
      .map((link) => link.author_profile_id),
  );

  return profiles.filter((profile) => eligibleAuthorIds.has(profile.id));
}
