-- Canonical platform-language priority for ImmigratiImprenditori.it.
-- This does not disable any editorial language; it only defines the preferred order.

update public.languages
set sort_order = case code
  when 'it' then 1
  when 'en' then 2
  when 'fr' then 3
  when 'es' then 4
  when 'de' then 5
  when 'ar' then 6
  when 'zh' then 7
  else 100
end,
updated_at = now();
