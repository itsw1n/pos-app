# IPSS — POS & Stock Management for Cafe Elvira

A mobile point-of-sale app with built-in stock monitoring for Cafe Elvira.
Sell from the counter with cash, GCash, or Maya — and keep track of inventory
from the same device.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=fff)
![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo&logoColor=fff)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=fff)

## What it does

- **Take orders** from the menu and check out with cash or e-wallets.
- **Track stock** in real time — sales deduct inventory automatically.
- **Monitor low stock** so you restock before you run out.
- **Print receipts** with an optional barcode.
- **Keep working offline** — sales are saved locally and synced when
  you're back online.

## Roles

| Role    | What they can do                                                             |
| ------- | ---------------------------------------------------------------------------- |
| Cashier | Take orders, process payments, issue receipts, view own sales history        |
| Admin   | Everything a cashier can, plus menu management, stock-in, reports, dashboard |

## Capabilities

| Area                | Cashier | Admin |
| ------------------- | :-----: | :---: |
| Sales & checkout    |    ✓    |   ✓   |
| Receive payments    |    ✓    |   ✓   |
| Transaction history |   own   |  all  |
| View inventory      |    ✓    |   ✓   |
| Manage menu         |    —    |   ✓   |
| Stock-in & reorder  |    —    |   ✓   |
| Reports & dashboard |    —    |   ✓   |
| User management     |    —    |   ✓   |

## Payments accepted

Cash (with change calculator), GCash, and Maya.

## Try it

Demo accounts, seeded with the sample data:

| Role    | Username              | Password     |
| ------- | --------------------- | ------------ |
| Admin   | `admin@elvira.cafe`   | `admin123`   |
| Cashier | `cashier@elvira.cafe` | `cashier123` |

## Run it locally

For developers. Requires Node.js, a Docker-compatible runtime, and the Supabase
CLI (invoked through `npx`). No local environment file is required.

```bash
make setup      # install dependencies
make db-reset   # start local Supabase, migrate, and seed demo data
make dev        # start local Supabase + Expo for a phone on the same LAN
```

`make dev-loopback` is available for host/loopback development. The local
Supabase API, database, and Studio use ports 54321, 54322, and 54323.

Preview and production APKs read `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_ANON_KEY` from their corresponding EAS environments;
local `.env.development` and `.env.production` files are not used. The three
app variants have separate package IDs so their auth sessions and offline
SQLite caches cannot mix.

Before running `make preview` or `make production`, configure those two public
variables in the matching EAS environment. Use a hosted staging project for
preview and the live project for production; never add a service-role key to
EAS client variables.

For a full list of available commands, run `make help`.

> This README is for end users and stakeholders. Developers, see
> [`AGENTS.md`](AGENTS.md) for setup, architecture, and quality gates.
