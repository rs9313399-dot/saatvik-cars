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
| Database | Prisma, SQLite |
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
- SQLite-compatible Prisma database

### Installation

```bash
git clone https://github.com/rs9313399-dot/saatvik-cars.git
cd saatvik-cars
bun install
```

Create `.env`:

```env
DATABASE_URL="file:./dev.db"
```

Prepare the database:

```bash
bun run db:generate
bun run db:push
```

Run locally:

```bash
bun run dev
```

Open `http://localhost:3000`.

## Useful Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the development server |
| `bun run build` | Build the standalone production app |
| `bun run start` | Start the standalone production server |
| `bun run lint` | Run lint checks |
| `bun run db:reset` | Reset the local Prisma database |

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

