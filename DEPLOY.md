# Deployment (maintainers)

Development happens on `main` (via feature branches and PRs); deploying means merging `main` into `production` and pushing.

`production` is **not** identical to `main` — it carries a small production-only overlay that must never reach `main`:

- `src/main.tsx` — renders `<Analytics />`
- `package.json` / `pnpm-lock.yaml` — the `@vercel/analytics` dependency

## Deploying

```bash
git checkout production
git merge main      # keep BOTH main's changes and the analytics lines on conflict
git push            # Vercel builds and deploys automatically
```

> [!IMPORTANT]
> Merge in one direction only: `main` → `production`.
>
> - **Never** merge `production` into `main`, or rebase/force-push `production` onto `main` — either will leak the analytics overlay into `main` or silently drop it from `production`.
> - Merging `main` → `production` will usually conflict on the three files above. Resolve by keeping `main`'s changes **and** re-adding the analytics lines.
