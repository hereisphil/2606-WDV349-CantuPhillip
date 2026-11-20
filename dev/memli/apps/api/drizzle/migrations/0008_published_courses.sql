-- A course the catalog lists (published_at set) must say what it teaches and
-- where its words came from: a description, a source and a license, none of
-- them blank. A draft (published_at NULL) may leave them empty (#174).
--
-- Triggers, not a CHECK, for the reason in 0002_language_tag_checks.sql: a
-- CHECK means rebuilding courses, which on D1 deletes every card, progress
-- row and review under it. The error message is the rule's name, like a
-- CHECK's.
--
-- Written by hand (drizzle-kit generate --custom): Drizzle does not model
-- triggers, so src/db/schema.ts points here from the columns.

CREATE TRIGGER courses_published_check_insert
BEFORE INSERT ON courses
WHEN NEW.published_at IS NOT NULL AND (
  trim(coalesce(NEW.description, '')) = ''
  OR trim(coalesce(NEW.source, '')) = ''
  OR trim(coalesce(NEW.license, '')) = ''
)
BEGIN
  SELECT RAISE(ABORT, 'courses_published_check');
END;
--> statement-breakpoint
CREATE TRIGGER courses_published_check_update
BEFORE UPDATE OF published_at, description, source, license ON courses
WHEN NEW.published_at IS NOT NULL AND (
  trim(coalesce(NEW.description, '')) = ''
  OR trim(coalesce(NEW.source, '')) = ''
  OR trim(coalesce(NEW.license, '')) = ''
)
BEGIN
  SELECT RAISE(ABORT, 'courses_published_check');
END;
