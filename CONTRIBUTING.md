# Contributing to MegaMart

First off, thank you for considering contributing! 🎉

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the [issues list](https://github.com/Roodraksh12/supermart/issues) to avoid duplicates.

When filing a bug report, include:
- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behaviour**
- **Screenshots** if applicable
- **Environment** (OS, browser, Node version)

### Suggesting Features

Open an issue with the tag `enhancement`. Describe:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

### Submitting Pull Requests

1. Fork the repo and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure:
   - Code follows the existing style
   - Frontend changes run without errors (`npm run dev`)
   - Backend changes don't break existing routes

3. Write a clear commit message:
   ```
   feat: add promo code expiry date field
   fix: correct cart total when promo applied
   chore: update dependencies
   ```

4. Push and open a Pull Request against `main`.

## Code Style

- **Frontend**: Follow React best practices; use functional components and hooks
- **Backend**: Keep route handlers clean; extract logic into helper functions
- **CSS**: Use Tailwind utility classes; avoid inline styles

## Development Setup

See the [README](./README.md#-getting-started) for full setup instructions.
