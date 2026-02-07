# Lorenzo Dry Cleaners - Marketing Website

A standalone marketing website extracted from the Lorenzo Dry Cleaners Management System.

## Overview

This is a separate Next.js website containing only the public-facing marketing pages:
- Homepage with hero, features, testimonials
- About page
- Services page with pricing
- Contact page with functional form
- Blog pages
- FAQ, Privacy, Terms, Help pages

## Tech Stack

- **Framework:** Next.js 15
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Email:** Resend (for contact form)

## Getting Started

### 1. Install Dependencies

```bash
cd website
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file:

```bash
# Required for contact form
RESEND_API_KEY=your_resend_api_key

# Optional: App URL for metadata
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3. Run Development Server

```bash
npm run dev
```

The website will be available at [http://localhost:3000](http://localhost:3000).

**Note:** If the main POS project is running on port 3000, this will auto-select a different port (3001).

### 4. Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
website/
├── app/
│   ├── page.tsx          # Homepage
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   ├── about/            # About page
│   ├── services/         # Services page
│   ├── contact/          # Contact page
│   ├── blog/             # Blog pages
│   ├── faq/              # FAQ page
│   ├── privacy/          # Privacy policy
│   ├── terms/            # Terms of service
│   ├── help/             # Help center
│   └── api/
│       └── contact/      # Contact form API
├── components/
│   ├── marketing/        # Marketing components (24)
│   ├── ui/               # UI components
│   └── providers/        # React Query provider
├── lib/
│   └── utils.ts          # Utility functions
├── public/
│   ├── images/           # Marketing images
│   ├── videos/           # Hero video
│   └── favicon.ico
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Homepage | `/` | Hero, features, testimonials, CTA |
| About | `/about` | Company story, values, stats |
| Services | `/services` | Service offerings with pricing |
| Contact | `/contact` | Contact form and information |
| Blog | `/blog` | Blog listing with categories |
| Blog Post | `/blog/[slug]` | Individual blog posts |
| FAQ | `/faq` | Frequently asked questions |
| Privacy | `/privacy` | Privacy policy |
| Terms | `/terms` | Terms of service |
| Help | `/help` | Help center |

## Features

- **Responsive Design** - Mobile-first, works on all devices
- **Animations** - Smooth scroll animations with Framer Motion
- **SEO Optimized** - Full metadata, Open Graph, Twitter cards
- **Accessible** - WCAG 2.1 Level AA compliant
- **Fast** - Optimized images, code splitting
- **Contact Form** - Functional form with email delivery

## Contact Form Setup

The contact form uses Resend for email delivery. To enable:

1. Create an account at [resend.com](https://resend.com)
2. Verify your domain
3. Get your API key
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

## Deployment

This website can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Firebase Hosting**
- **Any Node.js hosting**

### Vercel Deployment

```bash
npm install -g vercel
vercel
```

## Customization

### Colors

Edit `tailwind.config.ts` to change the color theme:
- Lorenzo Dark Teal: `#0A2F2C`
- Lorenzo Teal: `#14524A`
- Lorenzo Accent Teal: `#2DD4BF`
- Lorenzo Gold: `#C9A962`
- Lorenzo Cream: `#F5F5F0`

### Content

Marketing content is in the components:
- `components/marketing/HeroVideo.tsx` - Hero section
- `components/marketing/FeaturesGrid.tsx` - Features
- `components/marketing/Testimonials.tsx` - Customer reviews
- `components/marketing/PricingSection.tsx` - Pricing

## Development Notes

- This is a **local-only** project (git-ignored in main repo)
- Independent of the POS management system
- Can be deployed separately
- No Firebase or authentication required

## License

Private - Lorenzo Dry Cleaners / AI Agents Plus
