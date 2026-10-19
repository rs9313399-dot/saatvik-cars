# Saatvik Cars

Saatvik Cars is a premium used-car marketplace and dealership website built with Next.js. It includes inventory browsing, filters, lead capture, sell-car inquiries, testimonials, blog content, admin inventory management, and customer contact flows.

## Highlights

- Search inventory by brand, budget, fuel type, year, price, body type, and other car details.
- Featured car cards with image galleries, EMI estimates, WhatsApp/call actions, and wishlist support.
- Test-drive, callback, service, and sell-car inquiry workflows.
- Admin login and inventory panel for creating, editing, hiding, and deleting car listings.
- Blog, testimonials, reviews, FAQ, finance, and trust-building sections.
- Live chat and customer-facing conversion flows.
- SEO support with sitemap and structured site sections.
- Prisma data models for cars, admins, leads, testimonials, newsletter subscribers, blog posts, and inquiry records.

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js, React, TypeScript |
| Styling | Tailwind CSS, Radix UI, shadcn/ui patterns |
| Database | Prisma, PostgreSQL (Supabase source; Neon migration branch) |
| State | Zustand-style local store |
| UX | Framer Motion, Sonner toasts, Lucide React |
| Deployment | Standalone Next.js build helpers |

## Project Structure

```text
saatvik-cars/
├── prisma/schema.prisma          # Cars, leads, admins, blog, testimonials, and inquiries
├── public/images/                # Car and hero assets
├── public/uploads/               # Uploaded inventory images
├── scripts/                      # Standalone build/start helpers
├── src/app/api/                  # Auth, cars, leads, stats, blog, newsletter, inquiry APIs
├── src/components/cars/          # Marketplace UI and admin panel
└── src/lib/                      # Business config, API helpers, types, and utility functions
```

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL database and a direct connection URL for Prisma migrations

### Installation

```bash
git clone https://github.com/rs9313399-dot/saatvik-cars.git
cd saatvik-cars
bun install
```

Create `.env`:

```env
DATABASE_URL="YOUR_POSTGRES_POOLED_CONNECTION_STRING"
DIRECT_URL="YOUR_POSTGRES_DIRECT_CONNECTION_STRING"
ADMIN_USERNAME="YOUR_ADMIN_USERNAME"
ADMIN_PASSWORD="YOUR_ADMIN_PASSWORD"
SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVER_ONLY_STORAGE_KEY"
SUPABASE_STORAGE_BUCKET="car-images"
```

Prepare the database:

```bash
bun run db:generate
bun run db:deploy
bun run db:check
```

Run locally:

```bash
bun run dev
```

Open `http://localhost:3000`.

### Database migration

The app uses Prisma with PostgreSQL. Use the pooled `DATABASE_URL` for application traffic and the direct `DIRECT_URL` for schema migrations and database exports. Keep both values server-side.

On Windows, create a consistent, DPAPI-encrypted snapshot of the current source database:

```powershell
.\scripts\backup-db.ps1
```

The encrypted snapshot is stored under `%LOCALAPPDATA%\SaatvikCars\migration-backups` and can only be decrypted by the same Windows account. The importer accepts decrypted snapshot JSON on standard input, requires `NEON_TARGET_DATABASE_URL` to be a direct Neon connection, and refuses to write to a non-empty database:

```powershell
$backupFile = Get-ChildItem "$env:LOCALAPPDATA\SaatvikCars\migration-backups\saatvik-cars-supabase-*.json.dpapi" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1
$secure = ConvertTo-SecureString (Get-Content $backupFile.FullName -Raw).Trim()
$snapshot = [System.Net.NetworkCredential]::new('', $secure).Password
$env:NEON_TARGET_DATABASE_URL = (npx neon connection-string YOUR_TARGET_BRANCH --project-id YOUR_PROJECT_ID --output table | Out-String).Trim()
$snapshot | bun run db:import-snapshot
Remove-Item Env:NEON_TARGET_DATABASE_URL
```

The importer preserves row IDs and timestamps, hashes imported admin passwords, invalidates old sessions, and verifies row counts and row contents inside one transaction. Supabase Storage remains separate; database migration preserves stored image references but does not copy image files.

## Useful Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the development server |
| `bun run build` | Build the standalone production app |
| `bun run start` | Start the standalone production server |
| `bun run lint` | Run lint checks |
| `bun run db:reset` | Reset the local Prisma database |
| `bun run db:import-snapshot` | Import a verified snapshot into an empty PostgreSQL database |

## Main API Areas

- `/api/auth/*` for admin login and session checks
- `/api/cars` and `/api/cars/[id]` for inventory
- `/api/leads` for customer leads
- `/api/sell-inquiry` and `/api/service-inquiry`
- `/api/testimonials`
- `/api/blog`
- `/api/stats`

## Author

Built by [Ratnesh Singh](https://github.com/rs9313399-dot).
