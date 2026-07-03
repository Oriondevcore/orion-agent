# Contributing

Thanks for your interest in the Orion Agent. All contributions — bug reports, feature requests, docs, PRs — are welcome.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Be respectful, constructive, and inclusive.

## Getting Started

See [docs/SETUP.md](docs/SETUP.md) for local development setup.

## Branching & PRs

1. Fork the repo and create a branch from `main`:
   ```
   git checkout -b fix/your-bug-description
   ```
2. Make your changes. Keep commits atomic.
3. Run typecheck and build before committing:
   ```
   cd apps/orion-agent
   bun run typecheck
   cd client && bun run build
   ```
4. Push and open a pull request against `main`.

## Commit Style

Use [conventional commits](https://www.conventionalcommits.org/):

```
feat: add WebSocket keepalive
fix: correct model assignment race condition
docs: update SETUP with new env vars
chore: bump dependencies
```

## PR Checklist

- [ ] TypeScript compiles (`tsc --noEmit`)
- [ ] Client builds (`cd client && bun run build`)
- [ ] No new warnings
- [ ] PR description explains the problem and solution

## Reporting Bugs

Open an issue using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

## Feature Requests

Open an issue using the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

## Questions

Open a discussion or reach out to graham@oriondevcore.com.
