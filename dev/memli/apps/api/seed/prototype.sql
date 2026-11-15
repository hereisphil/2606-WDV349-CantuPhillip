-- Local development data only. Never part of a migration, so it can never
-- reach a real database. Safe to run again: it updates instead of duplicating.
--
-- The prototype learner the web app has used since MS 1 (useViewer(), #110),
-- now a real row. Better Auth (#108) replaces it with real sign-ups.
-- Starter courses, cards and mnemonics arrive with #112.

INSERT INTO users (id, name, email, email_verified, ui_locale)
VALUES (
  'usr_prototype_01',
  'Phillip',
  'learner@prototype.memli.test',
  1,
  'en'
)
ON CONFLICT (id) DO UPDATE SET
  name = excluded.name,
  email = excluded.email,
  email_verified = excluded.email_verified,
  ui_locale = excluded.ui_locale,
  updated_at = cast(unixepoch('subsecond') * 1000 as integer);
