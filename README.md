<div align="center">

# Aurum

**AI-powered cryptocurrency trading signals**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

</div>

## What is Aurum?

Aurum analyzes cryptocurrency market data with technical indicators and AI reasoning to generate BUY/SELL/HOLD trading signals — with confidence scores, entry/stop-loss/take-profit levels, and a written rationale for each call.

Aurum is signal generation and display only. It does not place trades or manage positions.

## Status

Aurum is currently going through a major update as it evolves from an experimental project into a production product. Expect frequent changes across the stack, features, and setup instructions while this is in progress.

## Tech Stack

- **Framework**: Next.js 15 (App Router + React 19)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI
- **Market data**: Hyperliquid public API (read-only)
- **Validation**: Zod

## Getting Started

```bash
pnpm install
pnpm dev
```

See [CLAUDE.md](CLAUDE.md) for architecture details and environment variable setup.

## License

MIT License — see [LICENSE](LICENSE) file for details.
