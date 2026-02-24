# Claude Project Guidelines

This file defines the coding standards and conventions for this project. Follow these rules consistently across all files.

---

## File Naming

- **All file names must be `kebab-case`**
  - ✅ `user-service.ts`, `media-processor.ts`, `upload-queue.ts`
  - ❌ `userService.ts`, `UserService.ts`, `user_service.ts`
- This applies to all file types: `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.css`, etc.

---

## Function & Variable Naming

- **Functions must be `camelCase`**
  - ✅ `getUserById`, `processMediaFile`, `generateEmbedding`
  - ❌ `get_user_by_id`, `GetUserById`

- **Variables must be `camelCase`**
  - ✅ `const userId`, `let mediaFiles`, `const embeddings`
  - ❌ `const user_id`, `let MediaFiles`

- **Constants (module-level) must be `SCREAMING_SNAKE_CASE`**
  - ✅ `const MAX_BATCH_SIZE = 5`, `const QDRANT_COLLECTION = "media"`
  - ❌ `const maxBatchSize = 5`

- **Classes and Types must be `PascalCase`**
  - ✅ `class MediaProcessor`, `type UserPayload`, `type QueueJob`
  - ❌ `class mediaProcessor`, `type user_payload`

---

## Functions

- **Always use arrow functions** for components, handlers, utilities, and general function definitions.

  ```ts
  // ✅ Correct
  const getUserById = async (id: string): Promise<User> => {
    // ...
  };

  const processImage = (filePath: string) => {
    // ...
  };
  ```

  ```ts
  // ❌ Avoid
  async function getUserById(id: string): Promise<User> {
    // ...
  }

  function processImage(filePath: string) {
    // ...
  }
  ```

- **Exception:** Class methods use standard method syntax (not arrow functions), as they bind correctly via the class instance.

  ```ts
  class MediaProcessor {
    // ✅ Method syntax is fine inside classes
    async process(file: string) {
      // ...
    }
  }
  ```

---

## React / React Native Components

- **All components must be arrow functions with a default export**

  ```tsx
  // ✅ Correct
  const MediaCard = ({ title, url }: MediaCardProps) => {
    return <View>...</View>;
  };

  export default MediaCard;
  ```

  ```tsx
  // ❌ Avoid
  function MediaCard({ title, url }: MediaCardProps) {
    return <View>...</View>;
  }

  export default MediaCard;
  ```

- **Component file names must match the component name in `kebab-case`**
  - Component `MediaCard` → file `media-card.tsx`
  - Component `SearchBar` → file `search-bar.tsx`

---

## Database & Schema

- **All database column names and schema fields must be `snake_case`** (Prisma / PostgreSQL convention)
  - ✅ `user_id`, `created_at`, `file_path`, `embedding_vector`
  - ❌ `userId`, `createdAt`, `filePath`

- **Table names must be `snake_case` and plural**
  - ✅ `media_files`, `user_albums`, `processing_jobs`
  - ❌ `MediaFiles`, `userAlbums`

---

## TypeScript

- **Always define explicit return types** for non-trivial functions.

  ```ts
  const getMedia = async (id: string): Promise<MediaFile | null> => { ... };
  ```

- **Always use `type`** for all type definitions — object shapes, unions, and aliases.

  ```ts
  type MediaFile = {
    id: string;
    filePath: string;
    createdAt: Date;
  };

  type MediaStatus = "pending" | "processing" | "done" | "failed";
  ```

- **No `any`** — use `unknown` and narrow the type, or define a proper type.

---

## Imports

- **Use named imports** over default imports where possible (except for components and third-party defaults).
- **Group imports** in this order, separated by a blank line:
  1. Node built-ins (e.g., `path`, `fs`)
  2. Third-party packages (e.g., `express`, `prisma`)
  3. Internal modules (relative paths)

  ```ts
  import path from "path";
  import fs from "fs";

  import { PrismaClient } from "@prisma/client";
  import Bull from "bull";

  import { generateEmbedding } from "../services/embedding-service";
  import { QdrantClient } from "../lib/qdrant-client";
  ```

---

## Package Manager

- **Always use `bun`** — never use `npm`, `yarn`, or `pnpm`

  ```sh
  # ✅ Correct
  bun install
  bun add express
  bun remove lodash
  bun run dev

  # ❌ Avoid
  npm install
  npm run dev
  ```

- Use `bun.lockb` for lockfile — do not commit `package-lock.json` or `yarn.lock`
- Scripts in `package.json` are still valid — run them via `bun run <script>`

---

## General Style

- **Indentation:** 2 spaces (no tabs)
- **Quotes:** Single quotes `'` for TypeScript/JavaScript; double quotes `"` for JSX attributes
- **Semicolons:** Always include semicolons
- **Trailing commas:** Always use trailing commas in multi-line arrays/objects
- **Max line length:** 100 characters

---

## Comments

- Use `//` for single-line comments and `/** */` for JSDoc on exported functions.
- Keep comments meaningful — explain *why*, not *what*.

```ts
/**
 * Generates a text embedding for a media file description
 * using the nomic-embed-text model via Ollama.
 */
const generateEmbedding = async (text: string): Promise<number[]> => {
  // Ollama returns normalized vectors by default
  const response = await ollama.embed({ model: "nomic-embed-text", input: text });
  return response.embeddings[0];
};
```

## Env

- Take envs from constants/env.ts
