# Contributing to Cambia

Thanks for your interest! Cambia is a small, focused monorepo and contributions are welcome.

## Setup

Cambia uses [Bun](https://bun.sh) workspaces. Tool versions are pinned with
[mise](https://mise.jdx.dev) (`mise.toml`), but any Node 20+ / Bun setup works.

```bash
git clone https://github.com/epode-studio/cambia.git
cd cambia
bun install
bun run build      # builds @epode/cambia-core then the cambia CLI
bun run test       # runs the @epode/cambia-core test suite
```

## Layout

- `packages/core` — `@epode/cambia-core`: pure, framework-zero logic (parse / scaffold / validate). No filesystem or process I/O.
- `packages/cli` — `cambia`: the CLI wrapper. Owns argument parsing, file I/O, and exit codes; calls `@epode/cambia-core`.
- `docs/` — specs and RFCs.
- `website/` — landing page (not published to npm).

Keep new validation/parsing logic in `@epode/cambia-core` (with tests) and keep `packages/cli`
a thin shell over it.

## Workflow

- Branch off `main`, open a PR. CI runs build + `biome check` + tests.
- Format and lint locally with `bun run format` and `bun run lint` (Biome). A husky
  pre-commit hook runs `lint-staged` automatically.
- Add a test in `packages/core/src/*.test.ts` for any behavior change.

## Releasing (maintainers)

Publishing is tag-driven. Bump the version in the changed package(s), then:

```bash
git tag v0.1.x
git push origin v0.1.x
```

The `release` workflow builds and runs `npm publish --access public` for each package
(`@epode/cambia-core` first, then `cambia`). Requires an `NPM_TOKEN` repository secret.
