# Lorenzo POS - Existing Technology Stack

This document provides a comprehensive overview of the current technology stack used in the Lorenzo Dry Cleaners POS system.

## Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.4 | React framework with App Router |
| **React** | 19.1.0 | UI library |
| **TypeScript** | ^5 | Type-safe JavaScript |
| **Node.js** | 20+ | Runtime environment |

## Frontend Technologies

### UI Framework & Styling

| Package | Version | Purpose |
|---------|---------|---------|
| **Tailwind CSS** | ^4 | Utility-first CSS framework |
| **tailwindcss-animate** | ^1.0.7 | Animation utilities for Tailwind |
| **class-variance-authority** | ^0.7.1 | Component variant management |
| **clsx** | ^2.1.1 | Conditional className utility |
| **tailwind-merge** | ^3.3.1 | Merge Tailwind classes safely |

### UI Components (shadcn/ui based)

| Package | Version | Purpose |
|---------|---------|---------|
| **@radix-ui/react-dialog** | ^1.1.15 | Modal dialogs |
| **@radix-ui/react-dropdown-menu** | ^2.1.16 | Dropdown menus |
| **@radix-ui/react-select** | ^2.2.6 | Select components |
| **@radix-ui/react-tabs** | ^1.1.13 | Tab navigation |
| **@radix-ui/react-checkbox** | ^1.3.3 | Checkbox inputs |
| **@radix-ui/react-radio-group** | ^1.3.8 | Radio button groups |
| **@radix-ui/react-popover** | ^1.1.15 | Popover components |
| **@radix-ui/react-scroll-area** | ^1.2.10 | Custom scroll areas |
| **@radix-ui/react-separator** | ^1.1.7 | Visual separators |
| **@radix-ui/react-switch** | ^1.2.6 | Toggle switches |
| **@radix-ui/react-avatar** | ^1.1.10 | Avatar components |
| **@radix-ui/react-label** | ^2.1.7 | Form labels |
| **@radix-ui/react-alert-dialog** | ^1.1.15 | Alert dialogs |
| **@radix-ui/react-slot** | ^1.2.3 | Slot component pattern |
| **@radix-ui/react-icons** | ^1.3.2 | Icon set |

### Icons & Animations

| Package | Version | Purpose |
|---------|---------|---------|
| **lucide-react** | ^0.545.0 | Icon library (primary) |
| **framer-motion** | ^12.23.24 | Animation library |

### Data Fetching & State

| Package | Version | Purpose |
|---------|---------|---------|
| **@tanstack/react-query** | ^5.90.2 | Server state management |
| **js-cookie** | ^3.0.5 | Cookie management |

### Forms & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| **react-hook-form** | ^7.65.0 | Form state management |
| **@hookform/resolvers** | ^5.2.2 | Validation resolvers |
| **zod** | ^3.25.76 | Schema validation |

### Charts & Data Visualization

| Package | Version | Purpose |
|---------|---------|---------|
| **recharts** | ^3.3.0 | Chart library |

### Date Handling

| Package | Version | Purpose |
|---------|---------|---------|
| **date-fns** | ^4.1.0 | Date utility library |
| **react-day-picker** | ^9.11.1 | Date picker component |

### PDF Generation

| Package | Version | Purpose |
|---------|---------|---------|
| **jspdf** | ^3.0.3 | PDF generation |

### Notifications

| Package | Version | Purpose |
|---------|---------|---------|
| **sonner** | ^2.0.7 | Toast notifications |

### Theme Management

| Package | Version | Purpose |
|---------|---------|---------|
| **next-themes** | ^0.4.6 | Theme (dark/light) switching |

### Intersection Observer

| Package | Version | Purpose |
|---------|---------|---------|
| **react-intersection-observer** | ^9.16.0 | Scroll-based visibility detection |

## Backend Technologies

### Database & Authentication

| Package | Version | Purpose |
|---------|---------|---------|
| **firebase** | ^12.4.0 | Client SDK (Auth, Firestore, Storage) |
| **firebase-admin** | ^13.5.0 | Server SDK (Admin operations) |

### API & HTTP

| Package | Version | Purpose |
|---------|---------|---------|
| **axios** | ^1.12.2 | HTTP client |

### Email

| Package | Version | Purpose |
|---------|---------|---------|
| **resend** | ^6.2.0 | Email service |

### AI/LLM

| Package | Version | Purpose |
|---------|---------|---------|
| **openai** | ^6.15.0 | OpenAI API client |

### Maps & Location

| Package | Version | Purpose |
|---------|---------|---------|
| **@googlemaps/google-maps-services-js** | ^3.4.2 | Server-side Google Maps |
| **@react-google-maps/api** | ^2.20.7 | React Google Maps components |
| **@types/google.maps** | ^3.58.1 | TypeScript types for Google Maps |

### Server-only Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| **server-only** | ^0.0.1 | Ensure server-only code |

## Development Tools

### Testing

| Package | Version | Purpose |
|---------|---------|---------|
| **jest** | ^30.2.0 | Unit testing framework |
| **jest-environment-jsdom** | ^30.2.0 | DOM environment for Jest |
| **@testing-library/react** | ^16.3.0 | React component testing |
| **@testing-library/jest-dom** | ^6.9.1 | DOM matchers for Jest |
| **@testing-library/user-event** | ^14.6.1 | User event simulation |
| **@playwright/test** | ^1.56.0 | E2E testing |
| **axe-playwright** | ^2.2.2 | Accessibility testing |

### Linting & Formatting

| Package | Version | Purpose |
|---------|---------|---------|
| **eslint** | ^9 | Code linting |
| **eslint-config-next** | 15.5.4 | Next.js ESLint config |
| **prettier** | ^3.6.2 | Code formatting |
| **husky** | ^9.1.7 | Git hooks |
| **lint-staged** | ^16.2.3 | Staged file linting |

### TypeScript Tooling

| Package | Version | Purpose |
|---------|---------|---------|
| **typescript** | ^5 | TypeScript compiler |
| **ts-node** | ^10.9.2 | TypeScript execution |
| **tsx** | ^4.20.6 | TypeScript execution (faster) |

### Build & Development

| Package | Version | Purpose |
|---------|---------|---------|
| **@tailwindcss/postcss** | ^4 | PostCSS plugin for Tailwind |
| **dotenv** | ^17.2.3 | Environment variable loading |
| **firebase-tools** | ^14.19.1 | Firebase CLI |

## Design System

### Color Palette

The application uses a **Teal & Gold** theme defined in `globals.css`:

**Teal Colors (Primary):**
- `--lorenzo-dark-teal`: #0A2F2C (Darkest)
- `--lorenzo-deep-teal`: #0F3D38
- `--lorenzo-teal`: #145751 (Primary)
- `--lorenzo-light-teal`: #1A6B64
- `--lorenzo-accent-teal`: #2DD4BF (Accent)

**Gold Colors (Secondary):**
- `--lorenzo-gold`: #C9A962 (Primary Gold)
- `--lorenzo-gold-dark`: #A68B4B
- `--lorenzo-gold-light`: #D4BC7E

### Typography

- **Primary Font:** Inter (variable font)
- **Font Scale:** 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px, 48px, 60px, 72px

### Shadows

- `shadow-glass`: Glassmorphism effect
- `shadow-card`: Card elevation
- `shadow-lift`: Hover lift effect
- `shadow-glow-teal`: Teal glow
- `shadow-glow-gold`: Gold glow

### Animations

- `fade-in`, `fade-in-up`, `fade-in-down`: Fade animations
- `scale-in`: Scale animations
- `slide-in-right`: Slide animations
- `float`: Floating animation

## Project Configuration

### Next.js Config (`next.config.ts`)

- **Output:** Standalone (for Docker deployment)
- **Image Optimization:** AVIF + WebP formats
- **Security Headers:** X-Frame-Options, HSTS, CSP, etc.
- **Package Optimization:** Lucide, Radix UI components
- **Strict Mode:** TypeScript and ESLint errors fail builds

### Tailwind Config (`tailwind.config.ts`)

- **Dark Mode:** Class-based (`darkMode: "class"`)
- **Container:** Centered with 2rem padding, max 1400px
- **Custom Colors:** Lorenzo teal/gold theme + shadcn/ui compatible
- **Plugins:** tailwindcss-animate

### TypeScript Config (`tsconfig.json`)

- **Strict Mode:** Enabled
- **Target:** ES2017+
- **Module:** ESNext with bundler resolution
- **Path Aliases:** `@/*` maps to project root

## NPM Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Production build
npm run start            # Start production server

# Testing
npm run test             # Run Jest tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # Playwright E2E tests
npm run test:all         # All tests

# Code Quality
npm run lint             # ESLint
npm run format           # Prettier (write)
npm run format:check     # Prettier (check)
npm run type-check       # TypeScript type check

# Database Seeding
npm run seed:dev         # Dev user
npm run seed:driver      # Test driver
npm run seed:milestone2  # Orders, customers, etc.
npm run seed:test-orders # Test orders
npm run seed:branches    # Branch data
npm run seed:test-accounts # Test accounts

# Utilities
npm run test:wati        # Test WhatsApp
npm run test:email       # Test email
npm run test:maps        # Test Google Maps
npm run analyze:bundle   # Bundle analysis
```

## File Structure Overview

```
c:\POS\
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (customer)/        # Customer portal
│   ├── (dashboard)/       # Staff dashboard
│   ├── api/               # API routes
│   └── globals.css        # Global styles + theme
├── components/
│   ├── features/          # Feature-specific components
│   ├── modern/            # Modern UI components
│   ├── ui/                # shadcn/ui base components
│   └── layout/            # Layout components
├── lib/
│   ├── db/                # Firestore operations
│   ├── validations/       # Zod schemas
│   ├── payments/          # Pesapal integration
│   ├── maps/              # Google Maps utilities
│   ├── email/             # Email service
│   └── utils/             # Utility functions
├── scripts/               # Database seeding scripts
├── tests/                 # Test files
└── docs/                  # Documentation
```

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Pesapal Payments
PESAPAL_CONSUMER_KEY=
PESAPAL_CONSUMER_SECRET=
PESAPAL_API_URL=

# WhatsApp (Wati.io)
WATI_ACCESS_TOKEN=
WATI_API_ENDPOINT=

# Email (Resend)
RESEND_API_KEY=

# OpenAI
OPENAI_API_KEY=
```

---

**Last Updated:** January 2026
**Document Version:** 1.0
