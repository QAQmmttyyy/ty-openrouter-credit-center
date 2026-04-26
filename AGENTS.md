# Guides

- ALWAYS USE PARALLEL TOOLS WHEN APPLICABLE.
- Prefer automation: execute requested actions without confirmation unless blocked by missing info or safety/irreversibility.
- When initializing the project, it is necessary to ensure that the .gitignore file exists first.
- When the version or functionality of the tool relied upon by Skill does not fully match the description in the Skill documentation, you should stop, explain to the user, and seek confirmation.
- **Prohibit Interactive Shell**: All commands must be run non-interactively; if interaction is necessary, ask the user instead of blocking the process.
- use Bun.
- **Log-Driven Backgrounding**: Whenever executing long-running or background processes (e.g., `next dev`):
    1. **Log Redirection**: Always append output using `>> .terminals/<name>.log 2>&1 &`. Prepend a session separator with a timestamp (e.g., `echo "\n--- [$(date)] Starting <name> ---" >> .terminals/<name>.log`) to ensure historical runs are distinguishable and not overwritten.
    2. **Log as Truth**: Treat `.terminals/*.log` as the primary source for runtime information (ports, errors). Before starting a new service, inspect these logs to identify and clean up orphan processes from previous sessions.
- **Strict Process Management**: It is strictly prohibited to use fuzzy matching commands like `pkill -f` to terminate processes. To safely stop a service:
    1. **Trace Port**: Identify the port from `.terminals/` logs, `.env` files, or previous conversation context.
    2. **Get PID**: Use `lsof -i :<port>` to find the specific PID associated with the project's port.
    3. **Targeted Kill**: Execute `kill <PID>` only after confirming it belongs to the current project.
    If the port cannot be determined, stop and ask the user for clarification.

- **browser use**: You can access the browser with the user's profile. Operate independently without asking the user to do things themselves.
    1. **Operate independently**: Use `agent-browser` commands directly for browsing, clicking, filling forms, screenshots, etc. — no need to ask the user.
    2. **Multi-tab workflow**: Use `agent-browser tab new <url>` to open different websites in new tabs instead of asking the user to open them manually.
    3. **Login & credentials**: agent-browser loads the user's Chrome profile, so on login pages attempt to sign in directly — the browser autofills saved credentials. **Never** say "cannot access account credentials" — prefer saved sessions and ask the user only as a last resort.
    4. **Element operation sequence** (must follow this order):
        - `scrollintoview @eN` — ensure the target element is visible
        - `focus @eN` — focus the element
        - Perform the action (click/fill/type/press, etc.)
    5. **Form monitoring**: On form submission, use `agent-browser network requests` to monitor network traffic and check the console for errors. Report any errors found.
    6. **Ref retry rule**: After page changes, immediately re-snapshot with `snapshot -i` to get fresh refs. **Do not retry the same ref more than 3 times**. After 3 failures, try `find` semantic locators or CSS selectors before stopping and reporting to the user.
    7. **Three-strike rule**: Any operation (login, form submission, click, etc.) **fails no more than 3 times**. After 3 failures, stop and report the situation to the user for intervention.

## Style Guide

### General Principles

- Keep things in one function unless composable or reusable
- **Avoid using the `any` type**
- Prefer single word variable names where possible
- Rely on type inference when possible; avoid explicit type annotations or interfaces unless necessary for exports or clarity
- Prefer functional array methods (flatMap, filter, map) over for loops; use type guards on filter to maintain type inference downstream
- The style class should use the standard classes provided by TailwindCSS or the classes specified in the project's guidelines, avoiding invalid or non-compliant classes that do not follow best practices. The values within the class will also first use the values from the project theme.

### Naming

Prefer single word names for variables and functions. Only use multiple words if necessary.

### Naming Enforcement (Read This)

THIS RULE IS MANDATORY FOR AGENT WRITTEN CODE.

- Use single word names by default for new locals, params, and helper functions.
- Multi-word names are allowed only when a single word would be unclear or ambiguous.
- Do not introduce new camelCase compounds when a short single-word alternative is clear.
- Before finishing edits, review touched lines and shorten newly introduced identifiers where possible.
- Good short names to prefer: `pid`, `cfg`, `err`, `opts`, `dir`, `root`, `child`, `state`, `timeout`.
- Examples to avoid unless truly required: `inputPID`, `existingClient`, `connectTimeout`, `workerPath`.

```ts
// Good
const foo = 1
function journal(dir: string) {}

// Bad
const fooBar = 1
function prepareJournal(dir: string) {}
```

Reduce total variable count by inlining when a value is only used once.

```ts
// Good
const journal = await Bun.file(path.join(dir, "journal.json")).json()

// Bad
const journalPath = path.join(dir, "journal.json")
const journal = await Bun.file(journalPath).json()
```

### Destructuring

Avoid unnecessary destructuring. Use dot notation to preserve context.

```ts
// Good
obj.a
obj.b

// Bad
const { a, b } = obj
```

### Variables

Prefer `const` over `let`. Use ternaries or early returns instead of reassignment.

```ts
// Good
const foo = condition ? 1 : 2

// Bad
let foo
if (condition) foo = 1
else foo = 2
```

### Control Flow

Avoid `else` statements. Prefer early returns.

```ts
// Good
function foo() {
  if (condition) return 1
  return 2
}

// Bad
function foo() {
  if (condition) return 1
  else return 2
}
```

### Schema Definitions (Drizzle)

Use snake_case for field names so column names don't need to be redefined as strings.

```ts
// Good
const table = sqliteTable("session", {
  id: text().primaryKey(),
  project_id: text().notNull(),
  created_at: integer().notNull(),
})

// Bad
const table = sqliteTable("session", {
  id: text("id").primaryKey(),
  projectID: text("project_id").notNull(),
  createdAt: integer("created_at").notNull(),
})
```

## Testing

- Avoid mocks as much as possible
- Test actual implementation, do not duplicate logic into tests

## Type Checking

- Always run `typecheck` from package directories (e.g., `packages/x`), never `tsc` directly.

## Thinking and Behave

- Apply **Polanyi tacit knowledge**. One **must** read and understand the code or files before coming up with a solution.
- It is necessary to avoid destructive changes and refrain from making unexpected code modifications outside of the plan.
- You should take into account token consumption and be optimized for efficient use.

## Output style

- Output must be concise and to the point. No unnecessary sample code. Cut the crap. Always use chinese.
