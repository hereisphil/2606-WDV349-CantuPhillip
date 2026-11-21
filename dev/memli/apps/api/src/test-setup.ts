import { beforeEach } from "vitest"

import { stubBreachedPasswords } from "./lib/test-breach-list"

// Every test starts with a breach list that knows no passwords.
beforeEach(() => {
  stubBreachedPasswords()
})
