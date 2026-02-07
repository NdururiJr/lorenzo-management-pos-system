# Plan: Multi-Agent AI System for Lorenzo

## Summary
Implement a **shared multi-agent AI system** in the POS core that serves multiple interfaces:
1. **Website Chatbot** - Customer-facing (public + logged-in customers)
2. **Staff Assistant** - Director, GM, and authorized staff queries

The agents live in the POS system as shared infrastructure, accessible via API from any interface.

---

## Multi-Agent Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           INTERFACES                                     │
│                                                                          │
│  ┌─────────────────────┐              ┌─────────────────────┐           │
│  │   WEBSITE CHATBOT   │              │   STAFF ASSISTANT   │           │
│  │   (Customer-facing) │              │  (Dashboard widget) │           │
│  │                     │              │                     │           │
│  │  • Public visitors  │              │  • Director         │           │
│  │  • Logged-in        │              │  • General Manager  │           │
│  │    customers        │              │  • Authorized staff │           │
│  └──────────┬──────────┘              └──────────┬──────────┘           │
│             │                                     │                      │
│             └──────────────┬──────────────────────┘                      │
│                            │                                             │
│                            ▼                                             │
│                   ┌────────────────┐                                     │
│                   │   AGENT API    │                                     │
│                   │  /api/agents   │                                     │
│                   └────────┬───────┘                                     │
└────────────────────────────┼────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    POS SYSTEM - AGENT CORE                               │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      AGENT ROUTER                                │    │
│  │         Routes requests based on intent + user role              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│         ┌──────────┬───────────────┼───────────────┬──────────┐         │
│         ▼          ▼               ▼               ▼          ▼         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ │
│  │  Order    │ │ Customer  │ │  Booking  │ │  Pricing  │ │  Support  │ │
│  │  Agent    │ │  Agent    │ │  Agent    │ │  Agent    │ │  Agent    │ │
│  ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤ │
│  │• Status   │ │• Profile  │ │• Schedule │ │• Quotes   │ │• Tickets  │ │
│  │• ETA      │ │• History  │ │• Pickup   │ │• Services │ │• Escalate │ │
│  │• Details  │ │• Spend    │ │• Delivery │ │• Promos   │ │• Handoff  │ │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘ │
│         │          │               │               │          │         │
│         └──────────┴───────────────┼───────────────┴──────────┘         │
│                                    ▼                                     │
│                            ┌─────────────┐                               │
│                            │  FIRESTORE  │                               │
│                            │  Database   │                               │
│                            └─────────────┘                               │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    ANALYTICS AGENT (Future)                      │    │
│  │   • Revenue insights  • Staff performance  • Trend analysis      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Two Interface Types

### 1. Website Chatbot (Customer Interface)
- **Location**: Floating widget on website
- **Users**: Public visitors + logged-in customers
- **Capabilities**: FAQs, order tracking, booking, support escalation
- **Auth**: Inherits from website session

### 2. Staff Assistant (Dashboard Interface)
- **Location**: Dashboard sidebar/modal
- **Users**: Director, GM, Store Managers (role-based access)
- **Capabilities**: Business insights, order summaries, performance queries
- **Auth**: Uses staff Firebase auth + role validation

---

## Requirements

### Customer Interface (Website)
- **Public visitors**: FAQs about services, pricing, locations
- **Logged-in customers**: Order tracking, booking, support
- **Order tracking**: Requires login first (Phone OTP)

### Staff Interface (Dashboard)
- **Director/GM**: Full access to all agents + analytics
- **Store Manager**: Branch-specific data only
- **Authorized Staff**: Limited queries (configurable)

### Shared Features
1. **Order Agent** - Track orders, status, ETA
2. **Customer Agent** - Profiles, history, spending
3. **Booking Agent** - Schedule pickups/deliveries
4. **Pricing Agent** - Quotes, services, promotions
5. **Support Agent** - Tickets, escalation, handoff

### Staff-Only Features (Future)
6. **Analytics Agent** - Revenue, performance, trends
7. **Inventory Agent** - Stock levels, reorder alerts
8. **Staff Agent** - Schedules, attendance, productivity

### Authentication & Authorization
- Customers: Firebase Auth (Phone OTP) via customer portal
- Staff: Firebase Auth (Email/Password) via staff login
- Role-based access control on each agent action

---

## Agent Definitions

All agents live in **POS System** at `lib/agents/` and are accessible via `/api/agents`.

### 1. Orchestrator Agents (Interface-Specific)

#### Customer Orchestrator
**Location**: `lib/agents/orchestrators/customer-orchestrator.ts`
**Used by**: Website chatbot
**Role**: Handle customer conversations, route to specialist agents
**Access**: Public FAQs, authenticated customer data

#### Staff Orchestrator
**Location**: `lib/agents/orchestrators/staff-orchestrator.ts`
**Used by**: Dashboard assistant
**Role**: Handle staff queries, provide business insights
**Access**: Role-based (Director > GM > Manager > Staff)

### 2. Order Agent
**Location**: `lib/agents/specialists/order-agent.ts`
**Role**: Order information specialist

| Action | Customer Access | Staff Access |
|--------|-----------------|--------------|
| `getOrderStatus` | Own orders only | All orders (branch-filtered for managers) |
| `getOrderETA` | Own orders only | All orders |
| `getOrderHistory` | Own history | Any customer's history |
| `getOrderDetails` | Own orders only | All orders |
| `getOrdersByStatus` | ❌ | ✅ (e.g., "How many orders are in washing?") |
| `getTodaysSummary` | ❌ | ✅ (Director/GM only) |

### 3. Customer Agent
**Location**: `lib/agents/specialists/customer-agent.ts`
**Role**: Customer data specialist

| Action | Customer Access | Staff Access |
|--------|-----------------|--------------|
| `getProfile` | Own profile | Any customer |
| `getOrderSummary` | Own summary | Any customer |
| `getSpendHistory` | Own spend | Any customer |
| `getTopCustomers` | ❌ | ✅ (Director/GM only) |
| `getCustomerInsights` | ❌ | ✅ |

### 4. Booking Agent
**Location**: `lib/agents/specialists/booking-agent.ts`
**Role**: Scheduling specialist

| Action | Customer Access | Staff Access |
|--------|-----------------|--------------|
| `getAvailableSlots` | ✅ | ✅ |
| `createPickupRequest` | ✅ (own) | ✅ (any customer) |
| `getDeliverySlots` | ✅ | ✅ |
| `getTodaysPickups` | ❌ | ✅ |
| `getDriverSchedule` | ❌ | ✅ |

### 5. Pricing Agent
**Location**: `lib/agents/specialists/pricing-agent.ts`
**Role**: Pricing and services specialist

| Action | Customer Access | Staff Access |
|--------|-----------------|--------------|
| `getServicePricing` | ✅ | ✅ |
| `getQuote` | ✅ | ✅ |
| `getPromotions` | ✅ | ✅ |
| `updatePricing` | ❌ | ✅ (Admin only) |

### 6. Support Agent
**Location**: `lib/agents/specialists/support-agent.ts`
**Role**: Escalation and support handler

| Action | Customer Access | Staff Access |
|--------|-----------------|--------------|
| `createTicket` | ✅ | ✅ |
| `escalateToHuman` | ✅ | ✅ |
| `getOpenTickets` | Own tickets | All tickets |
| `assignTicket` | ❌ | ✅ |
| `resolveTicket` | ❌ | ✅ |

### 7. Analytics Agent (Staff Only - Future)
**Location**: `lib/agents/specialists/analytics-agent.ts`
**Role**: Business intelligence

| Action | Access |
|--------|--------|
| `getDailyRevenue` | Director/GM |
| `getWeeklyTrends` | Director/GM |
| `getStaffPerformance` | Director/GM/Manager |
| `getBranchComparison` | Director/GM |

---

## Agent Communication Protocol

### Request Format
```typescript
interface AgentRequest {
  requestId: string;
  fromAgent: 'website-agent';
  toAgent: 'order-agent' | 'customer-agent' | 'booking-agent' | 'pricing-agent' | 'support-agent';
  action: string;
  params: Record<string, unknown>;
  auth: {
    customerId?: string;
    sessionId: string;
  };
  timestamp: string;
}
```

### Response Format
```typescript
interface AgentResponse {
  requestId: string;
  fromAgent: string;
  status: 'success' | 'error' | 'unauthorized';
  data?: unknown;
  error?: string;
  timestamp: string;
}
```

### Example Flow: Order Tracking
```
User: "Where is my order?"

1. Website Agent receives message
2. Classifies intent: ORDER_TRACKING
3. Checks auth: User is logged in ✓
4. Sends to Order Agent:
   {
     toAgent: 'order-agent',
     action: 'getLatestOrder',
     params: { customerId: 'cust_123' }
   }
5. Order Agent queries Firestore, returns:
   {
     status: 'success',
     data: {
       orderId: 'ORD-001',
       status: 'ironing',
       eta: '2024-01-07 14:00'
     }
   }
6. Website Agent synthesizes response:
   "Your order ORD-001 is currently being ironed.
    It should be ready by tomorrow at 2 PM!"
```

---

## Implementation Architecture

### Frontend (Website)
```
website/
├── components/chat/
│   ├── ChatWidget.tsx          # Floating button + container
│   ├── ChatWindow.tsx          # Main chat UI
│   ├── ChatMessage.tsx         # Message bubbles
│   ├── ChatInput.tsx           # User input
│   ├── ChatHeader.tsx          # Header with controls
│   ├── ChatSuggestions.tsx     # Quick actions
│   └── ChatTypingIndicator.tsx # Loading state
├── services/agents/
│   └── website-agent.ts        # Orchestrator agent
├── hooks/
│   └── useChat.ts              # Chat state management
└── app/api/chat/
    ├── route.ts                # Chat endpoint
    └── agent/route.ts          # Agent communication endpoint
```

### Backend (POS System)
```
lib/agents/
├── agent-router.ts             # Routes requests to agents
├── order-agent.ts              # Order specialist
├── customer-agent.ts           # Customer specialist
├── booking-agent.ts            # Booking specialist
├── pricing-agent.ts            # Pricing specialist
└── support-agent.ts            # Support/escalation

app/api/agents/
└── route.ts                    # Agent API endpoint (internal)
```

---

## Database Schema (Firestore)

### Collection: `chatConversations`
```typescript
interface ChatConversation {
  id: string;
  customerId?: string;          // Firebase UID (required for order tracking)
  userType: 'guest' | 'customer';
  title: string;
  messages: ChatMessage[];
  agentInteractions: AgentInteraction[];  // Log of agent calls
  status: 'active' | 'closed' | 'escalated';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Timestamp;
  agentSource?: string;         // Which agent provided this info
}

interface AgentInteraction {
  requestId: string;
  agent: string;
  action: string;
  success: boolean;
  timestamp: Timestamp;
}
```

## Implementation Steps

### Phase 1: Core Infrastructure

#### 1.1 Install Dependencies
```bash
npm install openai react-markdown uuid
```

#### 1.2 Create Agent Base Classes
```typescript
// lib/agents/base-agent.ts
abstract class BaseAgent {
  abstract name: string;
  abstract description: string;
  abstract capabilities: string[];

  abstract handle(action: string, params: Record<string, unknown>): Promise<AgentResponse>;

  protected async callOpenAI(prompt: string, context: string): Promise<string>;
}
```

#### 1.3 Create Agent Router
```typescript
// lib/agents/agent-router.ts
class AgentRouter {
  private agents: Map<string, BaseAgent>;

  register(agent: BaseAgent): void;
  route(request: AgentRequest): Promise<AgentResponse>;
}
```

### Phase 2: POS Agents

#### 2.1 Order Agent
- Query orders collection
- Calculate ETA based on status
- Format order details for display

#### 2.2 Customer Agent
- Fetch customer profile
- Summarize order history
- Get preferences

#### 2.3 Booking Agent
- Check available slots
- Create pickup requests
- Integrate with existing delivery system

#### 2.4 Pricing Agent
- Fetch current pricing from `lib/db/pricing.ts`
- Generate quotes based on garment list
- Return active promotions

#### 2.5 Support Agent
- Create support tickets in Firestore
- Send WhatsApp notification via Wati.io
- Send email notification via Resend

### Phase 3: Website Agent

#### 3.1 Intent Classifier
```typescript
type Intent =
  | 'FAQ_SERVICES'
  | 'FAQ_PRICING'
  | 'FAQ_LOCATIONS'
  | 'ORDER_TRACKING'
  | 'ORDER_HISTORY'
  | 'BOOKING_PICKUP'
  | 'BOOKING_DELIVERY'
  | 'SUPPORT_REQUEST'
  | 'GENERAL_CHAT';
```

#### 3.2 Orchestration Logic
- Parse user message
- Classify intent
- Check auth requirements
- Route to appropriate agent(s)
- Synthesize response

### Phase 4: Chat UI Components

#### 4.1 Component List
| Component | Description |
|-----------|-------------|
| `ChatWidget.tsx` | Floating button + container |
| `ChatWindow.tsx` | Main chat window |
| `ChatMessage.tsx` | Message bubble with markdown |
| `ChatInput.tsx` | Text input + send button |
| `ChatHeader.tsx` | Title, minimize, close |
| `ChatSuggestions.tsx` | Quick action chips |
| `ChatTypingIndicator.tsx` | "Lorenzo is typing..." |
| `ChatLoginPrompt.tsx` | Prompt to login for protected features |

### Phase 5: API Routes

#### 5.1 Chat Endpoint
```
POST /api/chat
Body: { message, conversationId?, customerId? }
Response: { response, conversationId, agentSources[] }
```

#### 5.2 Agent Communication Endpoint
```
POST /api/agents
Body: AgentRequest
Response: AgentResponse
(Internal use only - secured)
```

#### 5.3 Conversation History
```
GET /api/chat/conversations
GET /api/chat/conversations/[id]
```

### Phase 6: Integration & Polish

- Add ChatWidget to layouts
- Implement conversation persistence
- Add quick actions
- Mobile responsiveness
- Error handling
- Loading states

---

## Files to Create

### Website (`website/`)
| File | Purpose |
|------|---------|
| `components/chat/ChatWidget.tsx` | Floating widget container |
| `components/chat/ChatWindow.tsx` | Main chat UI |
| `components/chat/ChatMessage.tsx` | Message bubbles |
| `components/chat/ChatInput.tsx` | User input |
| `components/chat/ChatHeader.tsx` | Window header |
| `components/chat/ChatSuggestions.tsx` | Quick actions |
| `components/chat/ChatTypingIndicator.tsx` | Loading indicator |
| `components/chat/ChatLoginPrompt.tsx` | Auth prompt |
| `components/chat/index.ts` | Barrel export |
| `services/agents/website-agent.ts` | Orchestrator agent |
| `hooks/useChat.ts` | Chat state hook |
| `app/api/chat/route.ts` | Chat API |
| `app/api/chat/conversations/route.ts` | History API |

### POS System (`lib/`)
| File | Purpose |
|------|---------|
| `lib/agents/base-agent.ts` | Abstract agent class |
| `lib/agents/agent-router.ts` | Request router |
| `lib/agents/order-agent.ts` | Order specialist |
| `lib/agents/customer-agent.ts` | Customer specialist |
| `lib/agents/booking-agent.ts` | Booking specialist |
| `lib/agents/pricing-agent.ts` | Pricing specialist |
| `lib/agents/support-agent.ts` | Support/escalation |
| `lib/db/chat.ts` | Chat Firestore ops |
| `app/api/agents/route.ts` | Internal agent API |

### Files to Modify
| File | Change |
|------|--------|
| `app/layout.tsx` | Add ChatWidget |
| `app/(customer)/layout.tsx` | Add ChatWidget |
| `package.json` | Add dependencies |

---

## Website Agent System Prompt

```typescript
const WEBSITE_AGENT_PROMPT = `
You are Lorenzo, the AI assistant for Lorenzo Dry Cleaners.

## Your Role
You are the orchestrator agent. You handle customer conversations and coordinate with specialized agents to get information.

## Available Agents
1. ORDER_AGENT - Order status, tracking, history
2. CUSTOMER_AGENT - Customer profiles, preferences
3. BOOKING_AGENT - Schedule pickups/deliveries
4. PRICING_AGENT - Service prices, quotes
5. SUPPORT_AGENT - Escalate to human support

## Intent Classification
Classify user messages into:
- FAQ_SERVICES: Questions about services
- FAQ_PRICING: Questions about prices
- FAQ_LOCATIONS: Questions about branches
- ORDER_TRACKING: Check order status
- BOOKING_PICKUP: Schedule pickup
- SUPPORT_REQUEST: Need human help
- GENERAL_CHAT: Greetings, thanks, etc.

## Response Guidelines
- Be friendly and professional
- Keep responses under 150 words
- For order tracking: Require login, then call ORDER_AGENT
- For booking: Require login, then call BOOKING_AGENT
- For pricing: Call PRICING_AGENT for accurate info
- For complex issues: Call SUPPORT_AGENT to escalate

## Lorenzo Info (for FAQs)
- Established 2013
- 21+ branches in Nairobi
- Express service: 2 hours, FREE
- Free pickup & delivery
- Phone: 0728 400 200
`;
```

---

## UI Design

### Color Theme (Lorenzo brand)
- **Widget button**: `bg-lorenzo-accent-teal` (#2DD4BF)
- **Header**: `bg-lorenzo-dark` (#0A2F2C) with gold accent
- **User messages**: `bg-lorenzo-accent-teal` (teal)
- **AI messages**: `bg-white` border
- **Login prompt**: `bg-lorenzo-gold/10` warning style

### Mobile Behavior
- Bottom-right bubble on desktop
- Full-screen modal on mobile
- Swipe down to minimize

---

## Security Considerations

### Agent API Security
- Internal API only (not exposed to public)
- Validate customerId matches session
- Rate limiting on chat endpoint
- Input sanitization

### Data Access
- Order Agent: Only returns orders for authenticated customer
- Customer Agent: Only returns own profile
- Booking Agent: Validates customer owns the booking
- No PII in logs

---

## Cost Considerations

### OpenAI API
- Model: `gpt-4o-mini` ($0.15/1M input, $0.60/1M output)
- Estimated: ~$0.002 per conversation turn
- Monthly estimate: ~$50-100 for 1000 daily conversations

### Firestore
- Reads/writes for conversations
- TTL: 90 days for conversations
- Index on customerId, status

---

## Testing Plan

1. **Unit Tests**
   - Each agent's handle() method
   - Intent classification
   - Agent router

2. **Integration Tests**
   - Chat API with mocked agents
   - Agent communication flow
   - Auth validation

3. **E2E Tests (Playwright)**
   - Guest FAQ flow
   - Login prompt for order tracking
   - Full order tracking flow
   - Support escalation

---

## Rollout Plan

1. **Alpha** - Internal team testing
2. **Beta** - 10% of logged-in customers
3. **GA** - All users with feature flag
4. **Monitor** - Track:
   - Response times
   - Error rates
   - Escalation rates
   - User satisfaction

---

## Future Enhancements

- Voice input (Web Speech API)
- Image upload for garment identification
- Proactive notifications ("Your order is ready!")
- Multi-language support (English/Swahili)
- Analytics dashboard for conversations

---

## Related Documentation

- [Cross-Origin Setup Guide](../../docs/MULTI_AGENT_CROSS_ORIGIN_SETUP.md) - CORS, authentication, and API configuration

---

## Revert Instructions
```bash
# Remove multi-agent system
git checkout -- app/layout.tsx app/(customer)/layout.tsx
rm -rf components/chat services/agents lib/agents lib/db/chat.ts app/api/chat app/api/agents hooks/useChat.ts
npm uninstall openai react-markdown uuid
```
