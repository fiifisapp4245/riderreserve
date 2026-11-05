# RideReserve

Redesign of RideReserve's car-rental site (Ghana). Built with Next.js 16, shadcn/ui and Tailwind 4. Fonts: Inter and Bricolage Grotesque, the same as CashPath.

## Run locally

```bash
cp .env.example .env.local   # demo mode on: sample prices, simulated payments
npm install
npm run dev
```

Demo booking for **Manage booking**: reference `RR-DEMO42`, phone `024 123 4567`.

## Checks

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

## Docs

- `docs/DECISIONS.md`: architecture, demo vs production, missing integrations
- `docs/UNRESOLVED.md`: business rules RideReserve still needs to confirm
- `docs/AUDIT_CHECKLIST.md`: coverage of RR-01 to RR-24
