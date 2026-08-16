comment on column public.businesses.editorial_status is
  'Independent editorial-completeness axis. A business is publicly representable only when this axis is compatible with public presentation together with the other cumulative publication gates; it is not merged into publication_status or any persisted synthetic publishability state.';

comment on column public.businesses.substantial_status is
  'Independent substantial activity axis. Cessation affects how the business is presented and prevents representation as active, without being merged into publication_status, editorial_status, administrative_status, or a persisted synthetic publishability state.';

comment on column public.businesses.publication_status is
  'Local publication decision for the business: unpublished or public. The value public is necessary but not sufficient for effective public representation, which also depends on the cumulative editorial, substantial, archival, quality, valid-representative, and moderation gates. No synthetic publishability state is persisted.';

comment on column public.businesses.administrative_status is
  'Independent administrative overlay. A suspension or other incompatible administrative condition blocks effective public presentation without rewriting or merging the substantial, editorial, publication, or archival axes.';

comment on column public.businesses.is_archived is
  'Independent current archival indicator. Archived businesses are excluded from ordinary public presentation paths without rewriting the other lifecycle or publication axes and without creating a persisted synthetic publishability state.';

comment on column public.business_locations.visibility_status is
  'Local visibility decision for the location. The value public may remain persisted when the owning business is unpublished or otherwise not publicly representable; effective public visibility additionally requires the business publication gate, and depublishing the business does not rewrite this local value.';

comment on column public.business_channels.visibility_status is
  'Local visibility decision for the channel. The value public may remain persisted when the owning business is unpublished or otherwise not publicly representable; effective public visibility additionally requires the business publication gate, and depublishing the business does not rewrite this local value.';

comment on column public.business_media.visibility_status is
  'Local visibility decision for the media item. The value public may remain persisted when the owning business is unpublished or otherwise not publicly representable; effective public visibility additionally requires the business publication gate and a compatible media_status, and depublishing the business does not rewrite this local value.';

comment on column public.business_media.media_status is
  'Independent media lifecycle status: active or removed. A removed media item is not publicly exposed even when visibility_status is public; the lifecycle value is not rewritten by changes to the owning business publication state.';

comment on column public.business_services.publication_status is
  'Local publication decision for the service: draft or published. The value published may remain persisted when the owning business is unpublished or otherwise not publicly representable; effective public exposure additionally requires the business publication gate and a compatible service_status, with no automatic propagation from business state changes.';

comment on column public.business_services.service_status is
  'Independent service lifecycle status. A removed service is not publicly exposed even when publication_status is published; the lifecycle value and the local publication decision remain distinct.';

comment on column public.business_products.publication_status is
  'Local publication decision for the product: draft or published. The value published may remain persisted when the owning business is unpublished or otherwise not publicly representable; effective public exposure additionally requires the business publication gate and a compatible product_status, with no automatic propagation from business state changes.';

comment on column public.business_products.product_status is
  'Independent product lifecycle status. A removed product is not publicly exposed even when publication_status is published; the lifecycle value and the local publication decision remain distinct.';

comment on column public.business_certifications.certification_status is
  'Certification lifecycle and verification status. Expired or revoked certifications remain persisted but are not represented as valid; any public presentation also requires the owning business to be publicly representable. Certifications have no local S04 publication axis, and no badge, score, or other derived validity state is persisted.';
