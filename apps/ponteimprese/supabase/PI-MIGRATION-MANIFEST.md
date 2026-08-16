# PonteImprese — ownership migration (SPLIT-2)

`PI_MIGRATION_OWNERSHIP = COPIED`
`PI_DATABASE_BOOTSTRAP = SPLIT_3_PENDING`

Copia non distruttiva di **126** file inventario `PONTE_IMPRESE` (`125` `migration_sql` + `supabase/config.toml`).

- Nomi, timestamp e SQL **invariati**.
- Originali root `supabase/**` **preservati**.
- Questa copia **non** è una catena eseguibile autonoma: dipende dallo schema CONDIVISO e dalla storia completa del progetto unico.
- **Non eseguire** queste migration da questa cartella in SPLIT-2.
- Baseline/database fisico: **SPLIT-3**.

| path | timestamp | dominio | dipendenza schema condiviso |
|---|---|---|---|
| `supabase/config.toml` | n/a | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260718103949_create_profiles_table.sql` | 20260718103949 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260718113000_extend_profiles_for_person_domain.sql` | 20260718113000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260718192647_create_training_course_types_table.sql` | 20260718192647 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260718192648_create_training_delivery_modes_and_venue_types_tables.sql` | 20260718192648 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260718192650_create_training_offers_table.sql` | 20260718192650 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260718192652_create_training_offer_sectors_table.sql` | 20260718192652 | piattaforma/altro | possibile (cataloghi/template CONDIVISO) |
| `supabase/migrations/20260718192653_create_training_offer_venue_types_table.sql` | 20260718192653 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260718192654_create_training_requests_table.sql` | 20260718192654 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260718192656_create_training_provider_qualifications_table.sql` | 20260718192656 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260719153227_create_competencies_table.sql` | 20260719153227 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260719154330_create_profile_competencies_table.sql` | 20260719154330 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260719155533_create_personal_stories_table.sql` | 20260719155533 | persone | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260720225301_create_opportunities_core.sql` | 20260720225301 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260720231348_extend_opportunity_lifecycle_vocabularies.sql` | 20260720231348 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260720234303_create_opportunity_controlled_lists.sql` | 20260720234303 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260720235323_associate_opportunity_classifications.sql` | 20260720235323 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260721102213_create_opportunity_sources.sql` | 20260721102213 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260721105727_create_opportunity_evidences.sql` | 20260721105727 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260721131942_create_opportunity_audience_classifications.sql` | 20260721131942 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260730094530_create_opportunity_requirements.sql` | 20260730094530 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260730221921_create_opportunity_benefits.sql` | 20260730221921 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260730232814_create_opportunity_access_procedure.sql` | 20260730232814 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260730234248_create_opportunity_time_windows.sql` | 20260730234248 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260730234300_add_opportunity_temporal_milestones.sql` | 20260730234300 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731000110_create_opportunity_party_references.sql` | 20260731000110 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731000927_create_opportunity_representation_utilizations.sql` | 20260731000927 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731001652_create_opportunity_context_references.sql` | 20260731001652 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731010517_create_opportunity_verifications.sql` | 20260731010517 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731011847_add_opportunity_publication_state.sql` | 20260731011847 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731070000_create_businesses_core.sql` | 20260731070000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731080000_add_business_lifecycle_and_publication_axes.sql` | 20260731080000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731110000_create_business_locations.sql` | 20260731110000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731120000_create_business_channels.sql` | 20260731120000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731130000_create_business_services.sql` | 20260731130000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731140000_create_business_products.sql` | 20260731140000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731150000_create_business_certifications.sql` | 20260731150000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731160000_create_business_media.sql` | 20260731160000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731170000_create_business_verifications.sql` | 20260731170000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731220000_add_business_publication_and_visibility_coherence.sql` | 20260731220000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731230000_create_business_membership_roles.sql` | 20260731230000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731231000_create_business_memberships.sql` | 20260731231000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731232000_create_business_membership_qualifications.sql` | 20260731232000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731233000_create_business_membership_sources.sql` | 20260731233000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731234000_create_business_membership_evidences.sql` | 20260731234000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731235000_create_business_membership_management_authorizations.sql` | 20260731235000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731236000_create_business_membership_responsibility_declarations.sql` | 20260731236000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731237000_create_business_membership_verifications.sql` | 20260731237000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731238000_create_international_activity_types.sql` | 20260731238000 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731239000_create_international_access_channels.sql` | 20260731239000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260731240000_create_internationalization_need_types.sql` | 20260731240000 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260802090000_create_international_markets.sql` | 20260802090000 | mercati | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260802110000_create_international_market_support_resources.sql` | 20260802110000 | mercati | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260802120000_create_international_market_presences.sql` | 20260802120000 | mercati | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260802130000_create_international_market_interests.sql` | 20260802130000 | mercati | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260802140000_create_international_market_activities.sql` | 20260802140000 | mercati | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260802150000_create_international_commercial_relations.sql` | 20260802150000 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260802160000_create_internationalization_needs.sql` | 20260802160000 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260802170000_create_international_market_presence_sources.sql` | 20260802170000 | mercati | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260802180000_create_international_market_presence_evidences.sql` | 20260802180000 | mercati | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260802190000_create_international_market_presence_verifications.sql` | 20260802190000 | mercati | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260802200000_create_international_commercial_relation_sources.sql` | 20260802200000 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260802210000_create_international_commercial_relation_evidences.sql` | 20260802210000 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260802220000_create_international_commercial_relation_verifications.sql` | 20260802220000 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260803090000_create_professional_categories.sql` | 20260803090000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260803100000_create_professional_practice_modes.sql` | 20260803100000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260803110000_create_professional_source_kinds.sql` | 20260803110000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260803120000_create_professional_service_natures.sql` | 20260803120000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260804090000_create_professional_profiles.sql` | 20260804090000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260804100000_create_professional_qualifications.sql` | 20260804100000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260804110000_create_professional_registrations.sql` | 20260804110000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260804120000_create_professional_authorizations.sql` | 20260804120000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260804130000_create_professional_certifications.sql` | 20260804130000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260804140000_create_professional_association_memberships.sql` | 20260804140000 | imprese/appartenenza | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260804150000_create_professional_profile_categories.sql` | 20260804150000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260804160000_create_professional_competencies.sql` | 20260804160000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260804170000_create_professional_services.sql` | 20260804170000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260804200000_create_professional_served_markets.sql` | 20260804200000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260804210000_create_professional_served_sectors.sql` | 20260804210000 | professionisti/servizi | possibile (cataloghi/template CONDIVISO) |
| `supabase/migrations/20260804220000_create_professional_profile_sources.sql` | 20260804220000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260804230000_create_professional_profile_evidences.sql` | 20260804230000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260804240000_create_professional_profile_verifications.sql` | 20260804240000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260805090000_create_service_categories.sql` | 20260805090000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260805100000_create_service_economic_bands.sql` | 20260805100000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260805110000_create_service_offers.sql` | 20260805110000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260805140000_create_service_offer_sectors.sql` | 20260805140000 | professionisti/servizi | possibile (cataloghi/template CONDIVISO) |
| `supabase/migrations/20260805150000_create_service_offer_markets.sql` | 20260805150000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260805160000_create_service_requests.sql` | 20260805160000 | professionisti/servizi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260805190000_create_service_request_sectors.sql` | 20260805190000 | professionisti/servizi | possibile (cataloghi/template CONDIVISO) |
| `supabase/migrations/20260807160000_create_content_event_links.sql` | 20260807160000 | eventi (ibrido) | possibile (cataloghi/template CONDIVISO) |
| `supabase/migrations/20260809090000_create_accounts.sql` | 20260809090000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260809100000_create_account_role_assignments.sql` | 20260809100000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260810090000_create_collaborations.sql` | 20260810090000 | collaborazioni | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260810100000_create_collaboration_participants.sql` | 20260810100000 | collaborazioni | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812090000_create_access_identity_helpers.sql` | 20260812090000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812100000_create_access_role_helpers.sql` | 20260812100000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812110000_create_access_business_context_helpers.sql` | 20260812110000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812120000_create_access_identity_rpcs.sql` | 20260812120000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812130000_create_access_business_management_rpcs.sql` | 20260812130000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812140000_create_access_accounts_roles_rls.sql` | 20260812140000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812150000_create_access_profiles_rls.sql` | 20260812150000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812160000_create_access_businesses_rls.sql` | 20260812160000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812170000_create_access_memberships_rls.sql` | 20260812170000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812180000_create_access_business_authorizations_rls.sql` | 20260812180000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812190000_create_access_foundation_catalogs_rls.sql` | 20260812190000 | identita/accessi | possibile (cataloghi/template CONDIVISO) |
| `supabase/migrations/20260812200000_create_access_mercati_internazionali_rls.sql` | 20260812200000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812210000_create_access_professionisti_rls.sql` | 20260812210000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812220000_create_access_opportunita_rls.sql` | 20260812220000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812230000_create_access_servizi_rls.sql` | 20260812230000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812240000_create_access_eventi_rls.sql` | 20260812240000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812250000_create_access_collaborazioni_rls.sql` | 20260812250000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260812290000_create_access_residual_catalogs_rls.sql` | 20260812290000 | identita/accessi | possibile (cataloghi/template CONDIVISO) |
| `supabase/migrations/20260812300000_harden_access_function_execute_privileges.sql` | 20260812300000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260813140000_create_opportunity_activity_scopes.sql` | 20260813140000 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260813150000_add_collaboration_activity_scope.sql` | 20260813150000 | collaborazioni | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260814100000_create_person_contact_channels.sql` | 20260814100000 | persone | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260814110000_harden_legacy_profiles_phone.sql` | 20260814110000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260815100000_create_terms_acceptances.sql` | 20260815100000 | legal/privacy | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260816100000_create_legal_retention_records.sql` | 20260816100000 | legal/privacy | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260817100000_create_self_service_account_deletion.sql` | 20260817100000 | identita/accessi | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260818100000_create_management_reassignment_cases.sql` | 20260818100000 | piattaforma/altro | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260820100000_prepare_opportunity_external_ingestion.sql` | 20260820100000 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260820120000_opportunity_sources_public_select.sql` | 20260820120000 | opportunita | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260820140000_events_editorial_ownership.sql` | 20260820140000 | eventi (ibrido) | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260820150000_events_external_identity_provenance.sql` | 20260820150000 | eventi (ibrido) | FK verso identità/cataloghi del progetto unico |
| `supabase/migrations/20260820160000_prepare_events_external_ingestion_rls.sql` | 20260820160000 | eventi (ibrido) | FK verso identità/cataloghi del progetto unico |
