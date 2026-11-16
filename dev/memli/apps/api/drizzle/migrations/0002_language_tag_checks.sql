-- Every language column holds a canonical BCP 47 tag: es, pt-BR, es-419,
-- zh-Hant. The same rule as languageTagSchema in @workspace/schemas, as far
-- as SQL can check it without Intl. It refuses what a hand-written row gets
-- wrong: an empty string, a name (English), the wrong case (ES, pt-br) or
-- the wrong separator (pt_BR). GLOB is case-sensitive.
--
-- Triggers, not CHECK constraints, on purpose. SQLite can only add a CHECK
-- by rebuilding the table, and rebuilding courses or users on D1 deletes
-- every card, mnemonic, progress row and review that hangs off them: D1
-- runs migrations in a transaction, where PRAGMA foreign_keys=OFF does
-- nothing, and DROP TABLE fires ON DELETE CASCADE. A trigger is added in
-- place and touches no rows.
--
-- Each column gets two: one before an insert, one before an update of that
-- column. The error message is the rule's name, like a CHECK's.
--
-- Written by hand (drizzle-kit generate --custom): Drizzle does not model
-- triggers, so src/db/schema.ts points here from each column.

CREATE TRIGGER users_ui_locale_check_insert
BEFORE INSERT ON users
WHEN NOT (
  NEW.ui_locale GLOB '[a-z][a-z]*'
  AND NOT NEW.ui_locale GLOB '[a-z][a-z][a-z][a-z]*'
  AND NOT NEW.ui_locale GLOB '*[^a-zA-Z0-9-]*'
  AND NOT NEW.ui_locale GLOB '*-'
  AND NOT NEW.ui_locale GLOB '*--*'
  AND NOT NEW.ui_locale GLOB '[a-z][a-z]-[a-z][a-z]'
  AND NOT NEW.ui_locale GLOB '[a-z][a-z][a-z]-[a-z][a-z]'
)
BEGIN
  SELECT RAISE(ABORT, 'users_ui_locale_check');
END;
--> statement-breakpoint
CREATE TRIGGER users_ui_locale_check_update
BEFORE UPDATE OF ui_locale ON users
WHEN NOT (
  NEW.ui_locale GLOB '[a-z][a-z]*'
  AND NOT NEW.ui_locale GLOB '[a-z][a-z][a-z][a-z]*'
  AND NOT NEW.ui_locale GLOB '*[^a-zA-Z0-9-]*'
  AND NOT NEW.ui_locale GLOB '*-'
  AND NOT NEW.ui_locale GLOB '*--*'
  AND NOT NEW.ui_locale GLOB '[a-z][a-z]-[a-z][a-z]'
  AND NOT NEW.ui_locale GLOB '[a-z][a-z][a-z]-[a-z][a-z]'
)
BEGIN
  SELECT RAISE(ABORT, 'users_ui_locale_check');
END;
--> statement-breakpoint
CREATE TRIGGER courses_learning_language_check_insert
BEFORE INSERT ON courses
WHEN NOT (
  NEW.learning_language GLOB '[a-z][a-z]*'
  AND NOT NEW.learning_language GLOB '[a-z][a-z][a-z][a-z]*'
  AND NOT NEW.learning_language GLOB '*[^a-zA-Z0-9-]*'
  AND NOT NEW.learning_language GLOB '*-'
  AND NOT NEW.learning_language GLOB '*--*'
  AND NOT NEW.learning_language GLOB '[a-z][a-z]-[a-z][a-z]'
  AND NOT NEW.learning_language GLOB '[a-z][a-z][a-z]-[a-z][a-z]'
)
BEGIN
  SELECT RAISE(ABORT, 'courses_learning_language_check');
END;
--> statement-breakpoint
CREATE TRIGGER courses_learning_language_check_update
BEFORE UPDATE OF learning_language ON courses
WHEN NOT (
  NEW.learning_language GLOB '[a-z][a-z]*'
  AND NOT NEW.learning_language GLOB '[a-z][a-z][a-z][a-z]*'
  AND NOT NEW.learning_language GLOB '*[^a-zA-Z0-9-]*'
  AND NOT NEW.learning_language GLOB '*-'
  AND NOT NEW.learning_language GLOB '*--*'
  AND NOT NEW.learning_language GLOB '[a-z][a-z]-[a-z][a-z]'
  AND NOT NEW.learning_language GLOB '[a-z][a-z][a-z]-[a-z][a-z]'
)
BEGIN
  SELECT RAISE(ABORT, 'courses_learning_language_check');
END;
--> statement-breakpoint
CREATE TRIGGER courses_answer_language_check_insert
BEFORE INSERT ON courses
WHEN NOT (
  NEW.answer_language GLOB '[a-z][a-z]*'
  AND NOT NEW.answer_language GLOB '[a-z][a-z][a-z][a-z]*'
  AND NOT NEW.answer_language GLOB '*[^a-zA-Z0-9-]*'
  AND NOT NEW.answer_language GLOB '*-'
  AND NOT NEW.answer_language GLOB '*--*'
  AND NOT NEW.answer_language GLOB '[a-z][a-z]-[a-z][a-z]'
  AND NOT NEW.answer_language GLOB '[a-z][a-z][a-z]-[a-z][a-z]'
)
BEGIN
  SELECT RAISE(ABORT, 'courses_answer_language_check');
END;
--> statement-breakpoint
CREATE TRIGGER courses_answer_language_check_update
BEFORE UPDATE OF answer_language ON courses
WHEN NOT (
  NEW.answer_language GLOB '[a-z][a-z]*'
  AND NOT NEW.answer_language GLOB '[a-z][a-z][a-z][a-z]*'
  AND NOT NEW.answer_language GLOB '*[^a-zA-Z0-9-]*'
  AND NOT NEW.answer_language GLOB '*-'
  AND NOT NEW.answer_language GLOB '*--*'
  AND NOT NEW.answer_language GLOB '[a-z][a-z]-[a-z][a-z]'
  AND NOT NEW.answer_language GLOB '[a-z][a-z][a-z]-[a-z][a-z]'
)
BEGIN
  SELECT RAISE(ABORT, 'courses_answer_language_check');
END;
--> statement-breakpoint
CREATE TRIGGER mnemonics_content_locale_check_insert
BEFORE INSERT ON mnemonics
WHEN NOT (
  NEW.content_locale GLOB '[a-z][a-z]*'
  AND NOT NEW.content_locale GLOB '[a-z][a-z][a-z][a-z]*'
  AND NOT NEW.content_locale GLOB '*[^a-zA-Z0-9-]*'
  AND NOT NEW.content_locale GLOB '*-'
  AND NOT NEW.content_locale GLOB '*--*'
  AND NOT NEW.content_locale GLOB '[a-z][a-z]-[a-z][a-z]'
  AND NOT NEW.content_locale GLOB '[a-z][a-z][a-z]-[a-z][a-z]'
)
BEGIN
  SELECT RAISE(ABORT, 'mnemonics_content_locale_check');
END;
--> statement-breakpoint
CREATE TRIGGER mnemonics_content_locale_check_update
BEFORE UPDATE OF content_locale ON mnemonics
WHEN NOT (
  NEW.content_locale GLOB '[a-z][a-z]*'
  AND NOT NEW.content_locale GLOB '[a-z][a-z][a-z][a-z]*'
  AND NOT NEW.content_locale GLOB '*[^a-zA-Z0-9-]*'
  AND NOT NEW.content_locale GLOB '*-'
  AND NOT NEW.content_locale GLOB '*--*'
  AND NOT NEW.content_locale GLOB '[a-z][a-z]-[a-z][a-z]'
  AND NOT NEW.content_locale GLOB '[a-z][a-z][a-z]-[a-z][a-z]'
)
BEGIN
  SELECT RAISE(ABORT, 'mnemonics_content_locale_check');
END;
