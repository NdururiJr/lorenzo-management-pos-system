# Lorenzo Dry Cleaners Management System

A comprehensive, AI-powered dry cleaning management system built with Next.js 15, Firebase, and TypeScript.

## 🎯 Project Overview

**Client:** Lorenzo Dry Cleaners, Kilimani, Nairobi, Kenya
**Company:** AI Agents Plus
**Timeline:** 6 weeks (October 14 - December 19, 2025)
**Launch Date:** December 19, 2025

### What We're Building

A complete dry cleaning management system featuring:
- Point of Sale (POS) operations
- Order pipeline management (Kanban-style)
- Driver route optimization with Google Maps
- Customer portal with order tracking
- WhatsApp notifications via Wati.io
- M-Pesa and card payments via Pesapal
- AI-powered analytics with OpenAI
- Real-time inventory management
- Employee tracking and productivity metrics

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 15.5.4 (App Router)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS 4 (Black & White Theme)
- **Components:** shadcn/ui + Custom Components
- **State:** React Context + TanStack Query v5
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

### Backend
- **Database:** Firebase Firestore (NoSQL)
- **Authentication:** Firebase Authentication (Email/Phone OTP)
- **Storage:** Firebase Storage
- **Functions:** Firebase Cloud Functions
- **Hosting:** Vercel or Firebase Hosting

### Integrations
- **WhatsApp:** Wati.io REST API
- **Payments:** Pesapal API v3 (M-Pesa, Cards)
- **Maps:** Google Maps Platform
- **AI:** OpenAI GPT-4
- **Email:** Resend

## 📦 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Firebase account
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd lorenzo-dry-cleaners

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Firebase credentials
# See FIREBASE_SETUP.md for detailed instructions

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 🚀 Dev Login (Quick Access)

For rapid development, set up a development user:

1. **One-Time Setup**: Visit `http://localhost:3000/setup-dev`
2. **Quick Login**: Click the "🚀 Dev Quick Login" button on the login page

See **[DEV_LOGIN_SETUP.md](./DEV_LOGIN_SETUP.md)** for detailed instructions.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
npm test             # Run tests
```

## 📖 Documentation

### Setup Guides
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Complete Firebase setup (14,000+ words)
- **[FIREBASE_QUICKSTART.md](./FIREBASE_QUICKSTART.md)** - Quick Firebase reference
- **[AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)** - Authentication testing guide
- **[QUICK_START_AUTH.md](./QUICK_START_AUTH.md)** - Auth quick start
- **[DEV_LOGIN_SETUP.md](./DEV_LOGIN_SETUP.md)** - Dev quick login guide

### Development Guides
- **[CLAUDE.md](./CLAUDE.md)** - Complete project guide for Claude Code
- **[PLANNING.md](./PLANNING.md)** - Detailed project planning
- **[TASKS.md](./TASKS.md)** - Task tracking
- **[MILESTONE_1_COMPLETE.md](./MILESTONE_1_COMPLETE.md)** - Milestone 1 summary

### CI/CD Documentation
- **[.github/DEPLOYMENT.md](./.github/DEPLOYMENT.md)** - Deployment procedures
- **[.github/SETUP_INSTRUCTIONS.md](./.github/SETUP_INSTRUCTIONS.md)** - CI/CD setup
- **[.github/WORKFLOWS_SUMMARY.md](./.github/WORKFLOWS_SUMMARY.md)** - Workflow details
- **[.github/QUICK_REFERENCE.md](./.github/QUICK_REFERENCE.md)** - Quick reference

## 🎨 Design System

### Theme: Black & White Minimalistic

**Colors:**
- Background: `#FFFFFF`
- Text Primary: `#000000`
- Text Secondary: `#6B7280`
- Borders: `#E5E7EB`

**Accent Colors (Use Sparingly):**
- Success: `#10B981` (green)
- Warning: `#F59E0B` (amber)
- Error: `#EF4444` (red)
- Info: `#3B82F6` (blue)

**Typography:**
- Font: Inter
- Base Size: 16px
- High Contrast: 4.5:1 (WCAG AA)

### Components

30+ reusable components including:
- UI Components (shadcn/ui based)
- Custom Loading States
- Error & Empty States
- Layout Components
- Data Display Components
- Form Components

## 🔐 Authentication

### Staff Authentication
- Email/Password login
- Role-based access control (Admin, Manager, Front Desk, Workstation, Driver)
- Session management (7-30 days)
- Password reset

### Customer Authentication
- Phone OTP login (Kenya format: +254...)
- Order tracking
- Profile management

### Security Features
- Role-Based Access Control (RBAC)
- Firestore security rules
- Input validation with Zod
- Session timeout
- Rate limiting

## 🗄️ Database Schema

### Collections

1. **users** - System users (staff)
2. **customers** - Customer profiles
3. **orders** - Order records with garments
4. **branches** - Branch locations
5. **deliveries** - Delivery batches with routes
6. **inventory** - Stock management
7. **transactions** - Payment records
8. **notifications** - Message queue

### Security

- Role-based security rules
- Field-level permissions
- 17 composite indexes for performance

## 🚀 Deployment

### CI/CD Pipelines

Automated workflows for:
- **CI:** Lint, type check, build, test
- **Staging:** Deploy to staging environment
- **Production:** Deploy with approval gates
- **Security:** Daily security scans
- **Dependencies:** Weekly updates

### Deployment Options

**Option 1: Vercel (Recommended)**
- Optimized for Next.js
- Automatic previews
- Edge network

**Option 2: Firebase Hosting**
- Integrated with Firebase services
- CDN included
- Custom domains

See [.github/SETUP_INSTRUCTIONS.md](./.github/SETUP_INSTRUCTIONS.md) for setup.

## 📊 Project Status

### ✅ Milestone 1: Foundation (COMPLETED)

- ✅ Project infrastructure and dev tools
- ✅ Design system with black & white theme
- ✅ Firebase backend configuration
- ✅ Authentication system (Email + Phone OTP)
- ✅ CI/CD pipelines
- ✅ 30+ reusable UI components
- ✅ Comprehensive documentation

### 🔄 Milestone 2: Core Modules (Next)

- [ ] POS System (order creation, payments)
- [ ] Order Pipeline (Kanban board)
- [ ] Customer Portal (order tracking)

### ⏳ Milestone 3: Advanced Features (Scheduled)

- [ ] Driver route optimization
- [ ] WhatsApp integration
- [ ] AI analytics
- [ ] Inventory management
- [ ] Employee tracking

### ⏳ Milestone 4: Testing & Launch (Scheduled)

- [ ] Comprehensive testing
- [ ] User acceptance testing
- [ ] Production deployment
- [ ] Training and documentation

## 👥 Team

### Development Team
- **Gachengoh Marugu** - Lead Developer (hello@ai-agentsplus.com)
- **Arthur Tutu** - Backend Developer (arthur@ai-agentsplus.com)
- **Jerry Nduriri** - POS & Product Manager (jerry@ai-agentsplus.com)

### Client
- **Lorenzo Dry Cleaners** - Kilimani, Nairobi, Kenya

## 📝 License

Private - All Rights Reserved

## 🤝 Contributing

This is a private project for Lorenzo Dry Cleaners. For team members:

1. Read [CLAUDE.md](./CLAUDE.md) and [PLANNING.md](./PLANNING.md)
2. Check [TASKS.md](./TASKS.md) before starting work
3. Follow the established code style (Prettier + ESLint)
4. Write TypeScript with strict mode
5. Ensure accessibility (WCAG AA)
6. Test on mobile devices
7. Update documentation as you go

## 📧 Support

For questions or issues:
- Email: hello@ai-agentsplus.com
- Phone: +254 725 462 859

---

**Built with ❤️ by AI Agents Plus**

**Last Updated:** October 10, 2025
