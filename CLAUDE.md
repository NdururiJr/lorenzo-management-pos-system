# Lorenzo Dry Cleaners Management System - Claude Development Guide

## 🔴 IMPORTANT: Read This First

- **always read PLANNING.md at the start of every new conversation**
- **check TASKS.md before starting your work**
- **mark completed tasks immediately**
- **add newly discovered tasks**

---

## Project Overview

**Client:** Lorenzo Dry Cleaners, Kilimani, Nairobi, Kenya  
**Company:** AI Agents Plus  
**Timeline:** 6 weeks (October 14 - December 19, 2025)  
**Budget:** $10,000  
**Launch Date:** December 19, 2025  

### What We're Building

A comprehensive, AI-powered dry cleaning management system that handles:
- Complete order lifecycle from reception to delivery
- Point of Sale (POS) operations
- Driver route optimization
- Financial management and billing
- Customer portal and tracking
- Employee productivity monitoring
- Multi-branch operations
- Real-time analytics with AI insights

---

## Core Technology Stack

### Frontend
- **Framework:** Next.js 15+ with TypeScript 5+
- **Styling:** Tailwind CSS 4+
- **Components:** shadcn/ui (customizable)
- **State:** React Context API + TanStack Query
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts or Chart.js
- **Maps:** Google Maps JavaScript API
- **Icons:** Lucide React
- **PDF:** jsPDF or react-pdf

### Backend
- **Database:** Firebase Firestore (NoSQL)
- **Auth:** Firebase Authentication (Email/Password, Phone OTP)
- **Functions:** Firebase Cloud Functions (Node.js)
- **Storage:** Firebase Storage
- **Hosting:** Firebase Hosting or Vercel

### Integrations
- **WhatsApp:** Wati.io REST API
- **Payments:** Pesapal API v3
- **Maps:** Google Maps API (Directions, Geocoding, Distance Matrix)
- **Email:** Resend
- **AI:** OpenAI API (GPT-4)

### Development Tools
- **Version Control:** GitHub
- **CI/CD:** GitHub Actions (relaxed - no mandatory automated tests before merge)
- **Testing:** Jest, React Testing Library, Playwright
- **Monitoring:** Firebase Performance Monitoring, Sentry

---

## Design System Guidelines

### Color Palette (Black & White Theme)
- **Background:** `#FFFFFF` (90%+ of UI)
- **Text Primary:** `#000000` or `#1F2937`
- **Text Secondary:** `#6B7280`
- **Borders/Dividers:** `#E5E7EB`
- **Light Gray Backgrounds:** `#F9FAFB` (cards, hover states)

### Accent Colors (Use Sparingly)
- **Success:** `#10B981` (green)
- **Warning:** `#F59E0B` (amber)
- **Error:** `#EF4444` (red)
- **Info:** `#3B82F6` (blue)

### Typography
- **Font:** Inter (sans-serif)
- **Base Size:** 16px (1rem)
- **Scale:** 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px, 48px

### Key Principles
- **Minimalistic:** Clean layouts, generous whitespace
- **High Contrast:** Always maintain 4.5:1 contrast ratio (WCAG AA)
- **Mobile-First:** Design for mobile, enhance for desktop
- **Accessible:** WCAG 2.1 Level AA compliance

---

## Key Features & Priorities

### Phase 1: Foundation (Weeks 1-2) ✅
- Project setup (Next.js, Firebase, GitHub)
- CI/CD pipeline
- Design system and UI components
- Database schema
- Authentication system
- User roles and permissions

### Phase 2: Core Modules (Weeks 3-4) 🔄
- **POS System** (Priority: P0)
  - Order creation with customer management
  - Payment processing (Cash, M-Pesa, Pesapal)
  - Pricing management
  
- **Order Pipeline** (Priority: P0)
  - Visual pipeline board (Kanban-style)
  - Manual status updates by staff
  - Real-time pipeline statistics
  
- **Customer Portal** (Priority: P1)
  - Customer registration and login (Phone OTP)
  - Order tracking
  - Profile management

### Phase 3: Advanced Features (Week 5) 🔄
- **Driver Route Optimization** (Priority: P1)
  - Google Maps API integration
  - Optimized route planning
  - Driver mobile interface
  
- **WhatsApp Integration** (Priority: P1)
  - Automated notifications via Wati.io
  - Order status updates
  - Two-way communication
  
- **AI Features** (Priority: P1)
  - Order completion time estimation (OpenAI)
  - Analytics insights
  - Automated report summaries
  
- **Inventory Management** (Priority: P1)
  - Stock tracking
  - Low stock alerts
  - Usage analytics
  
- **Employee Tracking** (Priority: P1)
  - Attendance (clock-in/out)
  - Shift management
  - Productivity metrics

### Phase 4: Testing & Refinement (Week 6) 🔄
- Complete testing (unit, integration, E2E)
- Bug fixes and optimizations
- User acceptance testing (UAT)
- Documentation
- Training materials

---

## Database Schema (Firestore)

### Core Collections

#### `users`
```typescript
{
  uid: string;              // Firebase Auth UID
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'front_desk' | 'workstation' | 'driver' | 'customer';
  name: string;
  branchId: string;
  createdAt: timestamp;
  active: boolean;
}
```

#### `customers`
```typescript
{
  customerId: string;
  name: string;
  phone: string;            // Unique, Kenyan format (+254)
  email?: string;
  addresses: [
    {
      label: string;
      address: string;
      coordinates: { lat: number, lng: number }
    }
  ];
  preferences: {
    notifications: boolean;
    language: 'en' | 'sw';
  };
  createdAt: timestamp;
  orderCount: number;
  totalSpent: number;
}
```

#### `orders`
```typescript
{
  orderId: string;          // Format: ORD-[BRANCH]-[YYYYMMDD]-[####]
  customerId: string;
  branchId: string;
  status: 'received' | 'queued' | 'washing' | 'drying' | 'ironing' | 
          'quality_check' | 'packaging' | 'ready' | 'out_for_delivery' | 
          'delivered' | 'collected';
  garments: [
    {
      garmentId: string;    // Format: [ORDER-ID]-G[##]
      type: string;
      color: string;
      brand?: string;
      services: string[];
      price: number;
      status: string;
      specialInstructions?: string;
      photos?: string[];
    }
  ];
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod?: 'cash' | 'mpesa' | 'card' | 'credit';
  estimatedCompletion: timestamp;
  actualCompletion?: timestamp;
  createdAt: timestamp;
  createdBy: string;
  driverId?: string;
  deliveryAddress?: string;
  specialInstructions?: string;
}
```

#### `branches`
```typescript
{
  branchId: string;
  name: string;
  location: {
    address: string;
    coordinates: { lat: number, lng: number }
  };
  contactPhone: string;
  active: boolean;
  createdAt: timestamp;
}
```

#### `deliveries`
```typescript
{
  deliveryId: string;
  driverId: string;
  orders: string[];
  route: {
    optimized: boolean;
    stops: [
      {
        orderId: string;
        address: string;
        coordinates: { lat: number, lng: number };
        sequence: number;
        status: 'pending' | 'completed' | 'failed';
        timestamp?: timestamp;
      }
    ];
    distance: number;
    estimatedDuration: number;
  };
  status: 'pending' | 'in_progress' | 'completed';
  startTime?: timestamp;
  endTime?: timestamp;
}
```

#### `inventory`
```typescript
{
  itemId: string;
  branchId: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  costPerUnit: number;
  supplier?: string;
  lastRestocked: timestamp;
  expiryDate?: timestamp;
}
```

#### `transactions`
```typescript
{
  transactionId: string;
  orderId: string;
  customerId: string;
  amount: number;
  method: 'cash' | 'mpesa' | 'card' | 'credit';
  status: 'pending' | 'completed' | 'failed';
  pesapalRef?: string;
  timestamp: timestamp;
  processedBy: string;
}
```

#### `notifications`
```typescript
{
  notificationId: string;
  type: 'order_confirmation' | 'order_ready' | 'driver_dispatched' | 
        'driver_nearby' | 'delivered' | 'payment_reminder';
  recipientId: string;
  recipientPhone: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  channel: 'whatsapp' | 'sms' | 'email';
  timestamp: timestamp;
  orderId?: string;
}
```

---

## API Endpoints (Cloud Functions)

**Base URL:** `https://us-central1-[project-id].cloudfunctions.net/api`

### Authentication
- `POST /auth/register` - Customer registration
- `POST /auth/login` - Login
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/logout` - Logout
- `POST /auth/refresh-token` - Refresh JWT

### Orders
- `POST /orders` - Create order
- `GET /orders/:orderId` - Get order details
- `PUT /orders/:orderId` - Update order
- `DELETE /orders/:orderId` - Cancel order
- `GET /orders` - List orders (with filters)
- `PUT /orders/:orderId/status` - Update status
- `POST /orders/:orderId/payment` - Process payment

### Customers
- `POST /customers` - Create customer
- `GET /customers/:customerId` - Get details
- `PUT /customers/:customerId` - Update customer
- `GET /customers` - List customers
- `GET /customers/:customerId/orders` - Order history

### Deliveries
- `POST /deliveries` - Create delivery
- `GET /deliveries/:deliveryId` - Get details
- `PUT /deliveries/:deliveryId/status` - Update status
- `GET /deliveries/driver/:driverId` - Driver's deliveries
- `POST /deliveries/:deliveryId/optimize-route` - Optimize route

### Inventory
- `GET /inventory` - List items
- `POST /inventory` - Add item
- `PUT /inventory/:itemId` - Update item
- `POST /inventory/:itemId/adjust` - Adjust stock

### Analytics
- `GET /analytics/dashboard` - Dashboard data
- `GET /analytics/reports/:reportType` - Generate report
- `GET /analytics/insights` - AI insights

### Notifications
- `POST /notifications/send` - Send notification
- `GET /notifications/:notificationId` - Get status

### Payments
- `POST /payments/initiate` - Initiate payment (Pesapal)
- `POST /payments/callback` - Pesapal callback
- `GET /payments/:transactionId` - Get status
- `POST /payments/refund` - Process refund

---

## User Roles & Permissions

### Admin
- Full system access
- User management
- Financial reports
- System configuration
- Branch management
- Pricing management
- Analytics access
- Audit logs

### Branch Manager
- Branch operations view
- Staff management (own branch)
- Financial reports (own branch)
- Analytics dashboard
- Inventory management
- Quality issue resolution
- Cannot modify system settings

### Front Desk
- Create/edit orders
- Customer management
- Process payments
- View order status
- Print receipts
- Cannot access financial reports
- Cannot modify pricing

### Workstation Staff
- View assigned orders
- Update order status
- Flag quality issues
- Cannot create orders
- Cannot access financials
- Limited customer info view

### Driver
- View assigned deliveries
- Update delivery status
- Access customer contact info
- Collect payments
- Cannot access other features

### Customer
- View own orders
- Track deliveries
- Update profile
- Download receipts
- No access to backend

---

## Development Workflow

### Git Branching Strategy
- `main` - Production-ready code
- `staging` - Pre-production testing
- `develop` - Active development
- Feature branches: `feature/[feature-name]`
- Bug fixes: `fix/[bug-description]`

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:** feat, fix, docs, style, refactor, test, chore

**Example:**
```
feat(pos): add order creation form

- Implement order entry interface
- Add customer search functionality
- Integrate with Firestore

Closes #123
```

### Code Quality Standards
- **TypeScript:** Strict mode enabled
- **Linting:** ESLint + Prettier configured
- **Testing:** Aim for 80%+ code coverage (not mandatory for CI/CD)
- **Code Reviews:** All PRs reviewed before merge (no automated test gates)

### CI/CD Pipeline (Relaxed)
1. Developer pushes code to GitHub
2. Build Next.js app for production
3. Deploy to Staging (Firebase Hosting)
4. Run smoke tests on staging
5. Manual approval by product manager
6. Deploy to Production
7. Run smoke tests on production
8. Monitor for errors

**Note:** No mandatory automated tests before merge. Tests are recommended but not blocking.

---

## Integration Guidelines

### Wati.io (WhatsApp)
**Authentication:** Bearer token (API Key)  
**Rate Limit:** 100 messages/second  
**Message Templates Required:**
- order_confirmation
- order_ready
- driver_dispatched
- driver_nearby
- order_delivered
- payment_reminder

**Error Handling:**
- Retry failed messages 3 times
- Fallback to SMS if WhatsApp fails
- Log all message attempts

### Pesapal (Payments)
**Authentication:** OAuth 2.0  
**Environments:** Sandbox (dev), Production (live)  
**Supported Methods:** Card, M-Pesa, Bank Transfer  

**Payment Flow:**
1. Initiate payment → Get redirect URL
2. Customer completes payment
3. Pesapal sends IPN callback
4. Verify signature
5. Update order status

**Security:**
- Store credentials in environment variables
- Verify all callbacks with signature
- Test in sandbox before production

### Google Maps API
**APIs Used:**
- Directions API (route optimization)
- Distance Matrix API (distance calculations)
- Geocoding API (address validation)
- Places API (address autocomplete)

**Optimization:**
- Cache geocoded addresses
- Batch requests where possible
- Use waypoint optimization (max 25 waypoints)
- Implement offline fallback

### OpenAI API (AI Features)
**Model:** GPT-4  
**Use Cases:**
- Order completion time estimation
- Labor cost prediction
- Customer churn prediction
- Route optimization
- Analytics insights generation
- Automated report summaries
- Customer engagement recommendations

**Best Practices:**
- Cache AI responses where appropriate
- Use streaming for real-time responses
- Implement fallback for API failures
- Monitor API usage and costs

---

## Testing Strategy

### Unit Testing (Jest)
- Test utility functions
- Test business logic
- Test React components (isolated)
- Target: 80%+ coverage (recommended, not enforced)

### Integration Testing
- Test API endpoints
- Test database operations
- Mock third-party integrations

### E2E Testing (Playwright)
- Test critical user flows
- Test across browsers (Chrome, Safari, Firefox)
- Test mobile responsive

### Performance Testing
- Load testing (500 concurrent users)
- Page load times (< 2 seconds)
- API response times (< 500ms)

**Note:** Testing is recommended but not mandatory for CI/CD pipeline. Focus on quality over strict automation.

---

## Security Requirements

### Authentication & Authorization
- Firebase Authentication with JWT tokens
- Role-based access control (RBAC)
- Session timeout: 30 minutes
- Account lockout: 5 failed attempts
- MFA for admin (optional)

### Data Protection
- **In Transit:** TLS 1.3
- **At Rest:** AES-256 (Firebase default)
- **Backups:** Daily automated, encrypted

### API Security
- Rate limiting
- CORS configuration
- API key rotation
- Request validation
- SQL injection prevention (use parameterized queries)
- XSS protection

### Compliance
- GDPR awareness
- PCI DSS (via Pesapal)
- Kenya Data Protection Act
- Data retention policies

---

## Performance Benchmarks

### Target Metrics
- **Page Load Time:** < 2 seconds (P90)
- **API Response Time:** < 500ms (P95)
- **Database Queries:** < 100ms (simple), < 1s (complex)
- **Concurrent Users:** 100+ per branch
- **Uptime:** 99.9% (< 43 minutes downtime/month)
- **Error Rate:** < 0.1%

### Optimization Strategies
- Implement caching (React Query)
- Optimize database queries (indexing)
- Use CDN for static assets
- Lazy load components
- Image optimization
- Code splitting

---

## Deployment Checklist

### Pre-Deployment
- [ ] All critical bugs fixed
- [ ] UAT completed
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Backup strategy verified

### Deployment Day
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Get manual approval
- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Monitor for 2 hours
- [ ] Notify team

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify integrations working
- [ ] Collect user feedback
- [ ] Document any issues

---

## Common Tasks Reference

### Adding a New Feature
1. Read PLANNING.md for context
2. Check TASKS.md for related tasks
3. Create feature branch: `git checkout -b feature/[name]`
4. Implement feature with tests
5. Update documentation
6. Create PR with clear description
7. Get code review
8. Merge to develop
9. Mark task complete in TASKS.md

### Fixing a Bug
1. Check TASKS.md for bug report
2. Reproduce the bug
3. Create fix branch: `git checkout -b fix/[description]`
4. Fix bug and add test
5. Verify fix works
6. Create PR with bug details
7. Get code review
8. Merge and mark task complete

### Adding a New API Endpoint
1. Define route in Cloud Functions
2. Implement handler with validation
3. Add authentication/authorization
4. Add error handling
5. Write tests (recommended)
6. Update API documentation
7. Test with Postman/Thunder Client

### Adding a New UI Component
1. Check design system guidelines
2. Create component in `/components`
3. Follow black & white theme
4. Make it responsive (mobile-first)
5. Add to Storybook (if applicable)
6. Use TypeScript with proper types
7. Test accessibility (WCAG AA)

### Integrating Third-Party API
1. Read API documentation thoroughly
2. Store credentials in environment variables
3. Create service file (e.g., `services/wati.ts`)
4. Implement error handling
5. Add retry logic
6. Mock for tests
7. Test in sandbox/dev environment
8. Document usage

---

## Troubleshooting Guide

### Firebase Connection Issues
- Check environment variables (`.env.local`)
- Verify Firebase project configuration
- Check security rules
- Ensure API keys are valid

### Payment Integration Failures
- Verify Pesapal credentials
- Check callback URL is accessible
- Validate signature verification
- Check payment status via API

### WhatsApp Messages Not Sending
- Verify Wati.io API key
- Check message template approval
- Ensure phone number format (+254...)
- Check rate limits

### Route Optimization Not Working
- Verify Google Maps API key
- Check API quotas
- Ensure coordinates are valid
- Test with fewer waypoints

### Performance Issues
- Check database indexes
- Review slow queries
- Optimize images
- Check for memory leaks
- Enable caching

---

## Team Communication

### Development Team
- **Gachengoh Marugu** (Lead Developer) - hello@ai-agentsplus.com, +254 725 462 859
- **Arthur Tutu** (Backend Developer) - arthur@ai-agentsplus.com
- **Jerry Nduriri** (POS & Product Manager) - jerry@ai-agentsplus.com, +254 725 462 859

### Daily Standup Format
- What did I accomplish yesterday?
- What will I work on today?
- Any blockers?

### Weekly Demo (End of Sprint)
- Demo completed features
- Discuss challenges
- Plan next sprint
- Update PLANNING.md and TASKS.md

---

## Documentation Standards

### Code Comments
- Explain **why**, not **what**
- Use JSDoc for functions
- Document complex logic
- Keep comments up-to-date

### API Documentation
- Use clear endpoint names
- Document request/response formats
- Include example requests
- Document error codes

### Component Documentation
- Props interface with descriptions
- Usage examples
- Accessibility notes
- Responsive behavior

---

## Quick Reference

### Environment Variables
```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Wati.io
WATI_API_KEY=
WATI_API_URL=

# Pesapal
PESAPAL_CONSUMER_KEY=
PESAPAL_CONSUMER_SECRET=
PESAPAL_API_URL=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# OpenAI
OPENAI_API_KEY=

# Resend
RESEND_API_KEY=
```

### Useful Commands
```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run linter
npm run format          # Format code

# Testing
npm run test            # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:coverage   # Generate coverage report

# Firebase
firebase deploy         # Deploy everything
firebase deploy --only hosting  # Deploy hosting only
firebase deploy --only functions  # Deploy functions only
firebase emulators:start  # Start local emulators

# Database
npm run db:seed         # Seed database (if script exists)
npm run db:migrate      # Run migrations (if applicable)
```

### Common Patterns

**Creating a New Page:**
```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-semibold text-black">Dashboard</h1>
      {/* Content */}
    </div>
  );
}
```

**Creating a Form:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^\+254\d{9}$/, 'Invalid phone number'),
});

type FormData = z.infer<typeof schema>;

export function OrderForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields */}
    </form>
  );
}
```

**Fetching Data:**
```typescript
import { useQuery } from '@tanstack/react-query';

export function OrderList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data.orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

**Firestore Operations:**
```typescript
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Create
const createOrder = async (orderData) => {
  const docRef = await addDoc(collection(db, 'orders'), orderData);
  return docRef.id;
};

// Read
const getOrders = async () => {
  const querySnapshot = await getDocs(collection(db, 'orders'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Update
const updateOrder = async (orderId, updates) => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, updates);
};
```

---

## Success Metrics

### Technical KPIs
- **Uptime:** 99.9%+
- **Response Time:** < 500ms (P95)
- **Error Rate:** < 0.1%
- **Test Coverage:** 80%+ (recommended)
- **Build Time:** < 5 minutes

### Business KPIs
- **Order Processing Time:** < 2 minutes
- **On-Time Delivery Rate:** 95%+
- **Customer Satisfaction:** 4.5/5 stars
- **System Adoption:** 100% staff usage within 1 week
- **Customer Portal Registration:** 60% within 3 months

---

## Resources & References

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Wati.io API Docs](https://docs.wati.io)
- [Pesapal API Docs](https://developer.pesapal.com)
- [Google Maps API Docs](https://developers.google.com/maps)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Resend Docs](https://resend.com/docs)

### Tutorials & Guides
- [Next.js + Firebase Tutorial](https://www.youtube.com/watch?v=...)
- [React Hook Form Guide](https://react-hook-form.com/get-started)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Route Optimization with Google Maps](https://developers.google.com/maps/documentation/routes/route_optimization)

### Design Resources
- [Figma Design File](https://figma.com/...) - *(to be added)*
- [Storybook](http://localhost:6006) - Component library
- [Tailwind UI](https://tailwindui.com/) - Premium components (if licensed)

---

## Project Files Structure

```
lorenzo-dry-cleaners/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── (public)/          # Public routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   └── features/         # Feature-specific components
├── lib/                   # Utility libraries
│   ├── firebase.ts       # Firebase config
│   ├── utils.ts          # Helper functions
│   └── validations.ts    # Zod schemas
├── services/             # External service integrations
│   ├── wati.ts          # WhatsApp integration
│   ├── pesapal.ts       # Payment integration
│   ├── maps.ts          # Google Maps integration
│   └── openai.ts        # OpenAI integration
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
├── functions/            # Firebase Cloud Functions
├── public/               # Static assets
├── tests/                # Test files
├── .env.local            # Environment variables (not committed)
├── .env.example          # Example environment variables
├── firebase.json         # Firebase configuration
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies
├── PLANNING.md           # Project planning (READ FIRST)
├── TASKS.md              # Current tasks (CHECK BEFORE WORK)
├── CLAUDE.md             # This file
└── PRD.md                # Product Requirements Document
```

---

## Final Notes

### For Every New Conversation:
1. ✅ Read PLANNING.md first
2. ✅ Check TASKS.md before starting
3. ✅ Mark tasks complete immediately
4. ✅ Add new tasks as discovered

### Development Principles:
- **Mobile-first design** - Always design for mobile, enhance for desktop
- **Minimalistic UI** - Keep it clean, black & white, generous whitespace
- **Accessibility** - WCAG 2.1 Level AA compliance mandatory
- **Performance** - Target < 2s page loads
- **Security** - Authentication on all sensitive endpoints
- **Error Handling** - Always provide clear, actionable error messages
- **Documentation** - Document as you go, not later

### When in Doubt:
- Refer to PRD.md for detailed requirements
- Check design system guidelines for UI decisions
- Ask team members via email/WhatsApp
- Prioritize user experience over technical complexity
- Keep it simple and functional

---

**Last Updated:** October 10, 2025  
**Next Review:** Weekly (Every Monday)

---

**Remember:** This is a living document. Update it as the project evolves. Always check PLANNING.md and TASKS.md at the start of each session.
