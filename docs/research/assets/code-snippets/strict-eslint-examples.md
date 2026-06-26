# Strict ESLint Code Snippet Examples

> Here are the code snippets for each custom rule added to in the strict ESLint configuration.<br /><br />For each rule, you'll find an example of code that will trigger an error or warning, followed by the corrected version that satisfies the linter.

---

### 1. `@typescript-eslint/no-unused-vars`

* **Linter Action:** Warns on dead code, but ignores variables or arguments prefixed with an underscore.

#### ❌ Failing Code

```tsx
// Error: 'data' and 'id' are declared but never used
export function UserComponent({ data, id }: { data: any; id: string }) {
  const result = "Hello"; 
  return <div>{result}</div>;
}

```

#### Corrected Code

```tsx
// Passed: Unused variables are removed, and intentional placeholders use an underscore prefix
export function UserComponent({ id }: { id: string }) {
  const result = `Hello user ${id}`; 
  return <div>{result}</div>;
}

// Passed: If 'data' must remain in the signature for architectural reasons:
export function AlternativeComponent({ _data, id }: { _data: any; id: string }) {
  return <div>ID: {id}</div>;
}

```

---

### 2. `@typescript-eslint/no-explicit-any`

* **Linter Action:** Completely bans the use of `any` to enforce type safety.

#### ❌ Failing Code

```tsx
// Error: Unexpected any. Specify a different type.
function logUserData(user: any): void {
  console.log(user.name);
}

```

#### Corrected Code

```tsx
interface User {
  name: string;
  id: string;
}

// Passed: Shape is explicitly typed
function logUserData(user: User): void {
  console.log(user.name);
}

// Passed: Use 'unknown' if the data shape is truly dynamic, then type-guard it
function logDynamicData(data: unknown): void {
  if (data && typeof data === "object" && "name" in data) {
    console.log((data as Record<string, unknown>).name);
  }
}

```

---

### 3. `@typescript-eslint/explicit-function-return-type`

* **Linter Action:** Requires explicit return types on exported functions to keep API contracts locked down.

#### ❌ Failing Code

```tsx
// Error: Missing return type on leading function expression
export function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

```

#### Corrected Code

```tsx
// Passed: Explicitly declared that this function returns a string
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Passed: Inline arrow functions (like inside array methods) are safely allowed without explicit types
const prices = [10, 20, 30];
const formatted = prices.map((p) => `$${p}`); 

```

---

### 4. `@typescript-eslint/consistent-type-imports`

* **Linter Action:** Forces type-only imports to use the `import type` syntax, allowing the bundler to safely strip them out.

#### ❌ Failing Code

```tsx
// Error: Use 'import type' instead of 'import' for type-only imports
import { UserInterface } from "../types"; 
import { Button } from "@workspace/ui/components/button"; 

```

#### Corrected Code

```tsx
// Passed: Differentiates runtime code from compile-time contracts
import type { UserInterface } from "../types";
import { Button } from "@workspace/ui/components/button";

```

---

### 5. `react-hooks/rules-of-hooks`

* **Linter Action:** Enforces that hooks are only called at the top level of a component (never inside loops, conditions, or nested functions).

#### ❌ Failing Code

```tsx
// Error: React Hook "useState" is called conditionally.
export function Profile({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (!isLoggedIn) return <div>Please log in</div>;

  const [userData, setUserData] = useState(null); 
  return <div>Welcome back!</div>;
}

```

#### Corrected Code

```tsx
// Passed: Hooks are pulled to the absolute top of the component
export function Profile({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [userData, setUserData] = useState(null);

  if (!isLoggedIn) return <div>Please log in</div>;

  return <div>Welcome back!</div>;
}

```

---

### 6. `no-console`

* **Linter Action:** Warns against leaving behind noisy `console.log` traces while allowing production alerts like `.warn` and `.error`.

#### ❌ Failing Code

```tsx
export function handleDataFetch() {
  // Warning: Unexpected console statement
  console.log("I am a leftover debug trace from earlier"); 
}

```

#### Corrected Code

```tsx
export function handleDataFetch() {
  try {
    // Run fetch logic...
  } catch (error) {
    // Passed: Allowed by the rule options to preserve systemic error logs
    console.error("Critical telemetry catch:", error); 
  }
}

```

---

### 7. `no-debugger`

* **Linter Action:** Breaks the build if a `debugger;` statement is accidentally committed.

#### ❌ Failing Code

```tsx
export function calculateScore() {
  const score = 42;
  debugger; // Error: Unexpected 'debugger' statement
  return score;
}

```

#### Corrected Code

```tsx
export function calculateScore() {
  const score = 42;
  // Passed: Breakpoint deleted; use modern browser developer tools/editor break targets instead
  return score;
}

```

---

### 8. `eqeqeq`

* **Linter Action:** Requires strict evaluation operators (`===` and `!==`) to eliminate invisible coercion bugs.

#### ❌ Failing Code

```tsx
// Error: Expected '===' and instead saw '=='
if (userId == 123) {
  // Code executes if userId is the string "123" or number 123
}

```

#### Corrected Code

```tsx
// Passed: Type and value are checked with absolute strictness
if (userId === 123) {
  // Code only executes if types perfectly match
}

```