# github-timestamp-revealer

A Chrome extension that shows absolute timestamps next to GitHub relative time
labels.

GitHub often renders timestamps as relative labels such as `2 hours ago`.
This extension keeps the relative label and appends the absolute timestamp from
GitHub's `title` or `datetime` metadata.

## Features

- Adds absolute timestamps next to `relative-time`, `time-ago`, `local-time`,
  and `time[datetime]` elements
- Supports GitHub activity page timestamp spans that expose absolute dates via
  `title`
- Includes an options page for choosing append or replace display mode
- Follows GitHub SPA navigation through pjax / Turbo events
- Observes dynamically inserted timestamps

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) v24+
- [pnpm](https://pnpm.io/) v11+

### Setup

```bash
pnpm install
```

### Commands

| Command              | Description                                 |
| -------------------- | ------------------------------------------- |
| `pnpm dev`           | Start the CRXJS dev server                  |
| `pnpm dev:watch`     | Build in watch mode without a dev server    |
| `pnpm build`         | Production build (outputs to `dist/`)       |
| `pnpm test`          | Run tests (Vitest, watch mode)              |
| `pnpm test:run`      | Run tests once                              |
| `pnpm test:ui`       | Run tests with Vitest UI                    |
| `pnpm test:coverage` | Run tests with coverage                     |
| `pnpm typecheck`     | TypeScript type check                       |
| `pnpm lint`          | Lint with oxlint                            |
| `pnpm lint:fix`      | Lint with auto-fix                          |
| `pnpm format`        | Format with Prettier                        |
| `pnpm format:check`  | Check formatting                            |
| `pnpm package`       | Generate `package.zip` for Chrome Web Store |

### Load unpacked extension

1. Run `pnpm dev` for HMR, or `pnpm build` for a production build
2. Open `chrome://extensions` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/` directory

### Options

Open the extension options page to choose how timestamps are displayed:

- `Append`: keep the relative label and add the absolute timestamp
- `Replace`: show only the absolute timestamp

### Chrome Web Store upload

Upload `package.zip` or a release asset named
`github-timestamp-revealer-vX.Y.Z.zip`. Do not upload source archives or the
repository directory; Chrome Web Store expects `manifest.json` at the zip root.

### Tech Stack

- **TypeScript**
- **Vite** + **@crxjs/vite-plugin** - Chrome extension build (Manifest V3)
- **Vitest** + **happy-dom** - Testing
- **oxlint** - Linter
- **Prettier** - Formatter

## License

[MIT](./LICENSE)
