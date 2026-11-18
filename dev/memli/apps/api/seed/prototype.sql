-- Prototype data for local development and the gated staging database
-- (`bun run db:seed:staging`, #165). Never part of a migration, and never
-- loaded into production.
--
-- Safe to run again. Every row is an upsert keyed by its id: a second run
-- updates what is here and never touches `user_progress`, so reseeding keeps
-- the learner's reviews. To drop or reorder seeded rows, start over instead
-- (delete .wrangler/state, then `bun run db:setup`).
--
-- Writing a row by hand:
--   * A quote inside SQL text is doubled: 'We''re going to eat.'
--   * `answers` and `story` are JSON, so their strings use double quotes.
--
-- src/db/seed.test.ts runs this file and checks every row against the Zod
-- schemas in @workspace/schemas, so a typo here fails `bun run test`.

-- ---------------------------------------------------------------------------
-- Learners
-- ---------------------------------------------------------------------------
-- usr_prototype_01 is the learner the web app has used since MS 1
-- (useViewer(), #110). Better Auth (#108) replaces it with real sign-ups.
--
-- The others wrote the seeded mnemonics. A mnemonic's author is a `users`
-- row, and `name` is the display name shown under the story.

INSERT INTO users (id, name, email, email_verified, ui_locale)
VALUES
  ('usr_prototype_01', 'Phillip', 'learner@prototype.memli.test', 1, 'en'),
  ('usr_seed_lucia_m', 'lucia_m', 'lucia_m@seed.memli.test', 1, 'en'),
  ('usr_seed_kenji_k', 'kenji.k', 'kenji.k@seed.memli.test', 1, 'en'),
  ('usr_seed_sam_studies', 'sam_studies', 'sam_studies@seed.memli.test', 1, 'en'),
  ('usr_seed_dan_learns', 'dan.learns', 'dan.learns@seed.memli.test', 1, 'en'),
  ('usr_seed_profe_ana', 'profe_ana', 'profe_ana@seed.memli.test', 1, 'en')
ON CONFLICT (id) DO UPDATE SET
  name = excluded.name,
  email = excluded.email,
  email_verified = excluded.email_verified,
  ui_locale = excluded.ui_locale,
  updated_at = cast(unixepoch('subsecond') * 1000 as integer);

-- ---------------------------------------------------------------------------
-- Courses
-- ---------------------------------------------------------------------------
-- `learning_language` is what the course teaches. `answer_language` is what
-- the meanings are written in. Neither is anyone's `ui_locale`.

INSERT INTO courses (id, title, learning_language, answer_language)
VALUES
  ('spanish-core-1000', 'Spanish Core 1000', 'es', 'en'),
  ('japanese-kana', 'Japanese Hiragana & Katakana', 'ja', 'en'),
  ('french-travel-phrases', 'French Travel Phrases', 'fr', 'en'),
  ('portuguese-essentials', 'Portuguese Essentials', 'pt', 'en')
ON CONFLICT (id) DO UPDATE SET
  title = excluded.title,
  learning_language = excluded.learning_language,
  answer_language = excluded.answer_language,
  updated_at = cast(unixepoch('subsecond') * 1000 as integer);

-- ---------------------------------------------------------------------------
-- Cards
-- ---------------------------------------------------------------------------
-- `position` is the order new words are introduced in, from 1, per course.
-- `gender` is NULL for words and languages that have none.
-- `answers` lists every accepted meaning. The first is shown on reveal.

INSERT INTO cards (id, course_id, position, term, part_of_speech, gender,
  answers, phonetic, example_text, example_translation)
VALUES
  -- Spanish Core 1000
  ('es-gato', 'spanish-core-1000', 1, 'gato', 'noun', 'masculine',
    '["cat"]', '/ˈɡato/',
    'El gato está durmiendo en el sofá.',
    'The cat is sleeping on the sofa.'),
  ('es-casa', 'spanish-core-1000', 2, 'casa', 'noun', 'feminine',
    '["house","home"]', '/ˈkasa/',
    'Mi casa es tu casa.',
    'My house is your house.'),
  ('es-comer', 'spanish-core-1000', 3, 'comer', 'verb', NULL,
    '["to eat","eat"]', '/koˈmeɾ/',
    'Vamos a comer a las dos.',
    'We''re going to eat at two.'),
  ('es-rapido', 'spanish-core-1000', 4, 'rápido', 'adjective', NULL,
    '["fast","quick"]', '/ˈrapido/',
    'El tren es muy rápido.',
    'The train is very fast.'),
  ('es-que-tal', 'spanish-core-1000', 5, '¿Qué tal?', 'phrase', NULL,
    '["how are you","how''s it going"]', '/ke ˈtal/',
    'Hola, Ana, ¿qué tal?',
    'Hi, Ana, how''s it going?'),

  -- Japanese Hiragana & Katakana. `phonetic` is a romanization.
  ('ja-neko', 'japanese-kana', 1, 'ねこ', 'noun', NULL,
    '["cat"]', 'neko',
    'ねこが すきです。',
    'I like cats.'),
  ('ja-mizu', 'japanese-kana', 2, 'みず', 'noun', NULL,
    '["water"]', 'mizu',
    'みずを ください。',
    'Water, please.'),
  ('ja-arigatou', 'japanese-kana', 3, 'ありがとう', 'phrase', NULL,
    '["thank you","thanks"]', 'arigatō',
    'てつだってくれて ありがとう。',
    'Thanks for helping me.'),
  ('ja-kamera', 'japanese-kana', 4, 'カメラ', 'noun', NULL,
    '["camera"]', 'kamera',
    'カメラを かいました。',
    'I bought a camera.'),

  -- French Travel Phrases
  ('fr-bonjour', 'french-travel-phrases', 1, 'bonjour', 'phrase', NULL,
    '["hello","good morning"]', '/bɔ̃.ʒuʁ/',
    'Bonjour, une table pour deux, s''il vous plaît.',
    'Hello, a table for two, please.'),
  -- A long phrase, so the prompt's wrapping gets exercised.
  ('fr-ou-est-la-gare', 'french-travel-phrases', 2,
    'Où se trouve la gare la plus proche ?', 'phrase', NULL,
    '["where is the nearest train station","where is the nearest station"]',
    '/u sə tʁuv la ɡaʁ la ply pʁɔʃ/',
    'Excusez-moi, où se trouve la gare la plus proche ?',
    'Excuse me, where is the nearest train station?'),
  ('fr-gare', 'french-travel-phrases', 3, 'gare', 'noun', 'feminine',
    '["train station","station"]', '/ɡaʁ/',
    'La gare est à cinq minutes.',
    'The station is five minutes away.'),
  ('fr-addition', 'french-travel-phrases', 4, 'addition', 'noun', 'feminine',
    '["bill","check","the bill"]', '/a.di.sjɔ̃/',
    'L''addition, s''il vous plaît.',
    'The bill, please.'),

  -- Portuguese Essentials
  ('pt-obrigado', 'portuguese-essentials', 1, 'obrigado', 'phrase', NULL,
    '["thank you","thanks"]', '/obɾiˈɡadu/',
    'Obrigado pela ajuda!',
    'Thanks for the help!'),
  ('pt-pao', 'portuguese-essentials', 2, 'pão', 'noun', 'masculine',
    '["bread"]', '/ˈpɐ̃w̃/',
    'Quero pão com manteiga.',
    'I want bread with butter.'),
  ('pt-falar', 'portuguese-essentials', 3, 'falar', 'verb', NULL,
    '["to speak","speak","to talk","talk"]', '/faˈlaʁ/',
    'Você fala inglês?',
    'Do you speak English?')
ON CONFLICT (id) DO UPDATE SET
  course_id = excluded.course_id,
  position = excluded.position,
  term = excluded.term,
  part_of_speech = excluded.part_of_speech,
  gender = excluded.gender,
  answers = excluded.answers,
  phonetic = excluded.phonetic,
  example_text = excluded.example_text,
  example_translation = excluded.example_translation,
  updated_at = cast(unixepoch('subsecond') * 1000 as integer);

-- ---------------------------------------------------------------------------
-- Mnemonics
-- ---------------------------------------------------------------------------
-- `story` is a JSON array of parts, never markup:
--   plain    story text, in `content_locale`
--   term     the word being learned, in the course's learning language
--   keyword  the sound-alike hook that links the term to its meaning
-- `content_locale` is what the story and the picture's description are
-- written in. A picture is optional, but `image_src` and `image_alt` come as
-- a pair. Pictures live in apps/web/public/mnemonics.
--
-- Only the Spanish course has mnemonics so far. es-rapido and es-que-tal have
-- none on purpose, so the "no mnemonic yet" state shows in a real course.

INSERT INTO mnemonics (id, card_id, author_id, content_locale, story, upvotes,
  image_src, image_alt)
VALUES
  -- ‑ is a non-breaking hyphen. It keeps "Gala-cat" on one line.
  ('mn-es-gato-1', 'es-gato', 'usr_seed_lucia_m', 'en',
    '[{"kind":"plain","text":"A cat in a giant sombrero crashes a fancy "},
      {"kind":"keyword","text":"gala"},
      {"kind":"plain","text":". Gala‑cat, "},
      {"kind":"term","text":"gato"},
      {"kind":"plain","text":"!"}]',
    1240,
    '/mnemonics/gato.svg',
    'A ginger cat in a bow tie, wearing a giant sombrero at a gala.'),
  ('mn-es-gato-2', 'es-gato', 'usr_seed_kenji_k', 'en',
    '[{"kind":"plain","text":"A cat knocks over your "},
      {"kind":"keyword","text":"gateau"},
      {"kind":"plain","text":" and licks the frosting. Bad "},
      {"kind":"term","text":"gato"},
      {"kind":"plain","text":"!"}]',
    312, NULL, NULL),
  ('mn-es-gato-3', 'es-gato', 'usr_seed_sam_studies', 'en',
    '[{"kind":"plain","text":"The cat is the "},
      {"kind":"keyword","text":"gatekeeper"},
      {"kind":"plain","text":": no one gets past the "},
      {"kind":"term","text":"gato"},
      {"kind":"plain","text":"."}]',
    1, NULL, NULL),
  ('mn-es-casa-1', 'es-casa', 'usr_seed_dan_learns', 'en',
    '[{"kind":"plain","text":"You keep your "},
      {"kind":"keyword","text":"cash"},
      {"kind":"plain","text":" in your "},
      {"kind":"term","text":"casa"},
      {"kind":"plain","text":", the safest place in the house."}]',
    860,
    '/mnemonics/casa.svg',
    'A house with a box of cash sitting on its roof.'),
  ('mn-es-casa-2', 'es-casa', 'usr_seed_lucia_m', 'en',
    '[{"kind":"plain","text":"Your house is your "},
      {"kind":"keyword","text":"castle"},
      {"kind":"plain","text":", and every "},
      {"kind":"term","text":"casa"},
      {"kind":"plain","text":" is a castle to someone."}]',
    94, NULL, NULL),
  -- No picture, so the story-only layout shows in a real course.
  ('mn-es-comer-1', 'es-comer', 'usr_seed_profe_ana', 'en',
    '[{"kind":"plain","text":"Dinner''s ready: "},
      {"kind":"keyword","text":"come here"},
      {"kind":"plain","text":" and eat! "},
      {"kind":"term","text":"Comer"},
      {"kind":"plain","text":" means to eat."}]',
    57, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  card_id = excluded.card_id,
  author_id = excluded.author_id,
  content_locale = excluded.content_locale,
  story = excluded.story,
  upvotes = excluded.upvotes,
  image_src = excluded.image_src,
  image_alt = excluded.image_alt,
  updated_at = cast(unixepoch('subsecond') * 1000 as integer);

-- ---------------------------------------------------------------------------
-- Enrollments
-- ---------------------------------------------------------------------------
-- The courses on usr_prototype_01's dashboard (#174). It starts with all four
-- seeded courses. Reseeding never removes one, but it adds back a course the
-- learner removed.

INSERT INTO enrollments (user_id, course_id)
VALUES
  ('usr_prototype_01', 'spanish-core-1000'),
  ('usr_prototype_01', 'japanese-kana'),
  ('usr_prototype_01', 'french-travel-phrases'),
  ('usr_prototype_01', 'portuguese-essentials')
ON CONFLICT (user_id, course_id) DO NOTHING;
