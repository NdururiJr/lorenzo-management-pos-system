# Multi-Agent System: Cross-Origin Configuration Guide

This document provides detailed technical implementation instructions for setting up cross-origin communication between the Lorenzo Website and POS System for the multi-agent AI chatbot system.

---

## Architecture Overview

```
┌─────────────────────────────┐         HTTPS           ┌─────────────────────────────┐
│       WEBSITE               │ ───────────────────────► │       POS SYSTEM            │
│   (website.lorenzo.co.ke)   │                          │   (pos.lorenzo.co.ke)       │
│                             │  POST /api/agents        │                             │
│   • Chat UI Components      │ ◄─────────────────────── │   • Agent Router            │
│   • Website Orchestrator    │      JSON Response       │   • Specialist Agents       │
│   • useChat Hook            │                          │   • Firestore Access        │
└─────────────────────────────┘                          └─────────────────────────────┘
         │                                                         │
         │              Firebase Auth (Shared)                     │
         └─────────────────────┬───────────────────────────────────┘
                               │
                        ┌──────▼──────┐
                        │  FIRESTORE  │
                        │  (Shared)   │
                        └─────────────┘
```

---

## Step 1: Environment Variables Setup

### 1.1 POS System Environment Variables

Create or update `.env.local` in the POS root directory (`c:\POS\.env.local`):

```bash
# =============================================================================
# MULTI-AGENT SYSTEM CONFIGURATION
# =============================================================================

# Allowed Origins for CORS (comma-separated)
# Add all domains that need to access the Agent API
ALLOWED_ORIGINS=https://website.lorenzo.co.ke,https://www.lorenzo.co.ke,http://localhost:3001

# Agent API Configuration
AGENT_API_SECRET=your-secure-api-secret-key-here

# OpenAI Configuration (for AI agents)
OPENAI_API_KEY=sk-your-openai-api-key

# Rate Limiting
AGENT_API_RATE_LIMIT=100
AGENT_API_RATE_WINDOW_MS=60000

# =============================================================================
# EXISTING FIREBASE CONFIG (already present)
# =============================================================================
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... rest of Firebase config
```

### 1.2 Website Environment Variables

Create or update `.env.local` in the website directory (`c:\POS\website\.env.local`):

```bash
# =============================================================================
# POS AGENT API CONNECTION
# =============================================================================

# POS System API URL - Points to the deployed POS system
# Development: http://localhost:3000
# Production: https://pos.lorenzo.co.ke or your Vercel/Firebase URL
POS_API_URL=https://pos.lorenzo.co.ke

# Agent API Secret (must match POS system)
AGENT_API_SECRET=your-secure-api-secret-key-here

# =============================================================================
# EXISTING FIREBASE CONFIG (already present - same project)
# =============================================================================
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... rest of Firebase config
```

---

## Step 2: CORS Middleware Implementation

### 2.1 Create CORS Utility

Create file: `c:\POS\lib\api\cors.ts`

```typescript
/**
 * CORS Configuration for Multi-Agent API
 *
 * This module handles Cross-Origin Resource Sharing for the Agent API,
 * allowing the website to securely communicate with the POS system.
 *
 * @module lib/api/cors
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Allowed HTTP methods for the Agent API
 */
const ALLOWED_METHODS = ['GET', 'POST', 'OPTIONS'];

/**
 * Allowed headers for CORS requests
 */
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Agent-Request-Id',
  'X-Agent-Secret',
];

/**
 * Get allowed origins from environment variable
 * Falls back to localhost for development
 */
function getAllowedOrigins(): string[] {
  const origins = process.env.ALLOWED_ORIGINS || 'http://localhost:3001';
  return origins.split(',').map((origin) => origin.trim());
}

/**
 * Check if the request origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  const allowedOrigins = getAllowedOrigins();

  // Check exact match
  if (allowedOrigins.includes(origin)) return true;

  // Check wildcard subdomains (e.g., *.lorenzo.co.ke)
  for (const allowed of allowedOrigins) {
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      if (origin.endsWith(domain)) return true;
    }
  }

  return false;
}

/**
 * CORS headers configuration
 */
export interface CorsConfig {
  origin: string;
  methods: string;
  headers: string;
  credentials: boolean;
  maxAge: number;
}

/**
 * Get CORS headers for a given origin
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isOriginAllowed(origin) ? origin : '';

  return {
    'Access-Control-Allow-Origin': allowedOrigin || '',
    'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Handle CORS preflight (OPTIONS) request
 */
export function handleCorsPreflightRequest(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Return 204 No Content for preflight
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Add CORS headers to an existing response
 */
export function addCorsHeaders(
  response: NextResponse,
  origin: string | null
): NextResponse {
  const corsHeaders = getCorsHeaders(origin);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * CORS middleware wrapper for API routes
 *
 * Usage:
 * ```typescript
 * import { withCors } from '@/lib/api/cors';
 *
 * async function handler(request: NextRequest) {
 *   // Your handler logic
 * }
 *
 * export const POST = withCors(handler);
 * export const OPTIONS = withCors(handler);
 * ```
 */
export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const origin = request.headers.get('origin');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest(request);
    }

    // Check if origin is allowed
    if (origin && !isOriginAllowed(origin)) {
      return NextResponse.json(
        { error: 'Origin not allowed', code: 'CORS_ERROR' },
        { status: 403 }
      );
    }

    // Execute the handler
    const response = await handler(request);

    // Add CORS headers to response
    return addCorsHeaders(response, origin);
  };
}

/**
 * Validate the Agent API secret
 */
export function validateAgentSecret(request: NextRequest): boolean {
  const secret = request.headers.get('X-Agent-Secret');
  const expectedSecret = process.env.AGENT_API_SECRET;

  if (!expectedSecret) {
    console.warn('AGENT_API_SECRET not configured');
    return false;
  }

  return secret === expectedSecret;
}
```

---

## Step 3: Agent API Route Implementation

### 3.1 Create Agent API Endpoint

Create file: `c:\POS\app\api\agents\route.ts`

```typescript
/**
 * Agent API Endpoint
 *
 * This endpoint receives requests from the website chatbot and staff assistant,
 * routes them to the appropriate specialist agents, and returns responses.
 *
 * Security:
 * - CORS restricted to allowed origins
 * - API secret validation
 * - Firebase Auth token verification
 * - Rate limiting
 *
 * @module app/api/agents/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCors, validateAgentSecret } from '@/lib/api/cors';
import { verifyFirebaseToken } from '@/lib/firebase/admin';
import { agentRouter } from '@/lib/agents/agent-router';
import { AgentRequest, AgentResponse } from '@/lib/agents/types';

/**
 * Rate limiting store (in production, use Redis)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit for a given identifier
 */
function checkRateLimit(identifier: string): boolean {
  const limit = parseInt(process.env.AGENT_API_RATE_LIMIT || '100');
  const windowMs = parseInt(process.env.AGENT_API_RATE_WINDOW_MS || '60000');
  const now = Date.now();

  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * POST /api/agents
 *
 * Process agent requests from website or staff dashboard
 */
async function handleAgentRequest(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // 1. Validate API secret
    if (!validateAgentSecret(request)) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Invalid API secret',
          code: 'UNAUTHORIZED'
        } as AgentResponse,
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json() as AgentRequest;

    // 3. Validate required fields
    if (!body.requestId || !body.toAgent || !body.action) {
      return NextResponse.json(
        {
          requestId: body.requestId || 'unknown',
          status: 'error',
          error: 'Missing required fields: requestId, toAgent, action',
          code: 'INVALID_REQUEST'
        } as AgentResponse,
        { status: 400 }
      );
    }

    // 4. Rate limiting (by session or IP)
    const rateLimitKey = body.auth?.sessionId ||
                         request.headers.get('x-forwarded-for') ||
                         'anonymous';

    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        {
          requestId: body.requestId,
          status: 'error',
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        } as AgentResponse,
        { status: 429 }
      );
    }

    // 5. Verify Firebase Auth token (if provided)
    let verifiedUser = null;
    const authHeader = request.headers.get('Authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        verifiedUser = await verifyFirebaseToken(token);
      } catch (authError) {
        console.warn('Token verification failed:', authError);
        // Continue without verified user - some requests don't need auth
      }
    }

    // 6. Enhance request with verified user info
    const enhancedRequest: AgentRequest = {
      ...body,
      auth: {
        ...body.auth,
        verifiedUserId: verifiedUser?.uid,
        verifiedUserRole: verifiedUser?.role,
      },
      timestamp: new Date().toISOString(),
    };

    // 7. Route to appropriate agent
    const response = await agentRouter.route(enhancedRequest);

    // 8. Add processing time
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      ...response,
      processingTime,
    });

  } catch (error) {
    console.error('Agent API error:', error);

    return NextResponse.json(
      {
        requestId: 'error',
        status: 'error',
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      } as AgentResponse,
      { status: 500 }
    );
  }
}

// Export with CORS wrapper
export const POST = withCors(handleAgentRequest);
export const OPTIONS = withCors(async () => NextResponse.json({}));
```

---

## Step 4: Firebase Auth Token Verification

### 4.1 Create Firebase Admin Verification

Create file: `c:\POS\lib\firebase\admin.ts`

```typescript
/**
 * Firebase Admin SDK Configuration
 *
 * Used for server-side token verification and admin operations.
 * The same Firebase project is shared between Website and POS.
 *
 * @module lib/firebase/admin
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment
 */
function getAdminApp(): App {
  const apps = getApps();

  if (apps.length > 0) {
    return apps[0];
  }

  // Check for service account JSON
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccount) {
    try {
      const credentials = JSON.parse(serviceAccount);
      return initializeApp({
        credential: cert(credentials),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } catch (error) {
      console.error('Failed to parse service account:', error);
    }
  }

  // Fallback: Use application default credentials (for Cloud environments)
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

/**
 * Verified user information from Firebase token
 */
export interface VerifiedUser {
  uid: string;
  email?: string;
  phone?: string;
  role?: string;
  branchId?: string;
  customerId?: string;
}

/**
 * Verify a Firebase ID token and extract user information
 *
 * @param token - Firebase ID token from client
 * @returns Verified user information or null if invalid
 */
export async function verifyFirebaseToken(
  token: string
): Promise<VerifiedUser | null> {
  try {
    const app = getAdminApp();
    const auth = getAuth(app);

    // Verify the token
    const decodedToken: DecodedIdToken = await auth.verifyIdToken(token);

    // Extract user information
    const user: VerifiedUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      phone: decodedToken.phone_number,
    };

    // Get custom claims (role, branchId, etc.)
    if (decodedToken.role) {
      user.role = decodedToken.role as string;
    }

    if (decodedToken.branchId) {
      user.branchId = decodedToken.branchId as string;
    }

    if (decodedToken.customerId) {
      user.customerId = decodedToken.customerId as string;
    }

    return user;

  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Check if a user has a specific role
 */
export function hasRole(
  user: VerifiedUser | null,
  allowedRoles: string[]
): boolean {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Check if a user is a staff member (non-customer)
 */
export function isStaff(user: VerifiedUser | null): boolean {
  const staffRoles = [
    'admin',
    'director',
    'general_manager',
    'store_manager',
    'workstation_manager',
    'workstation_staff',
    'satellite_staff',
    'front_desk',
    'driver',
  ];
  return hasRole(user, staffRoles);
}

/**
 * Check if a user is a customer
 */
export function isCustomer(user: VerifiedUser | null): boolean {
  return hasRole(user, ['customer']);
}
```

---

## Step 5: Agent Types Definition

### 5.1 Create Agent Types

Create file: `c:\POS\lib\agents\types.ts`

```typescript
/**
 * Multi-Agent System Type Definitions
 *
 * Shared types for agent communication protocol between
 * Website, POS System, and all specialist agents.
 *
 * @module lib/agents/types
 */

/**
 * Available specialist agents
 */
export type AgentName =
  | 'order-agent'
  | 'customer-agent'
  | 'booking-agent'
  | 'pricing-agent'
  | 'support-agent'
  | 'analytics-agent';

/**
 * Source of the agent request
 */
export type AgentSource =
  | 'website-chatbot'
  | 'staff-assistant'
  | 'system';

/**
 * User type making the request
 */
export type UserType =
  | 'guest'           // Public website visitor
  | 'customer'        // Logged-in customer
  | 'staff'           // Any staff member
  | 'manager'         // Store manager or above
  | 'admin';          // Director or admin

/**
 * Authentication context for agent requests
 */
export interface AgentAuth {
  /** Session ID for tracking */
  sessionId: string;

  /** Customer ID (if logged in) */
  customerId?: string;

  /** Staff user ID (if staff) */
  staffId?: string;

  /** User type */
  userType: UserType;

  /** User role (from Firebase) */
  role?: string;

  /** Branch ID (for staff) */
  branchId?: string;

  /** Verified user ID from token */
  verifiedUserId?: string;

  /** Verified role from token */
  verifiedUserRole?: string;
}

/**
 * Request from orchestrator to specialist agent
 */
export interface AgentRequest {
  /** Unique request identifier for tracking */
  requestId: string;

  /** Source of the request */
  fromAgent: AgentSource;

  /** Target specialist agent */
  toAgent: AgentName;

  /** Action to perform */
  action: string;

  /** Action parameters */
  params: Record<string, unknown>;

  /** Authentication context */
  auth: AgentAuth;

  /** ISO timestamp */
  timestamp: string;

  /** Conversation context (for multi-turn) */
  context?: {
    conversationId?: string;
    previousMessages?: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
  };
}

/**
 * Response from specialist agent
 */
export interface AgentResponse {
  /** Request ID (echo back) */
  requestId: string;

  /** Agent that processed the request */
  fromAgent: AgentName;

  /** Response status */
  status: 'success' | 'error' | 'unauthorized' | 'not_found';

  /** Response data */
  data?: unknown;

  /** Error message (if status is error) */
  error?: string;

  /** Error code */
  code?: string;

  /** ISO timestamp */
  timestamp: string;

  /** Processing time in ms */
  processingTime?: number;

  /** Suggested follow-up actions */
  suggestions?: string[];
}

/**
 * Agent capability definition
 */
export interface AgentCapability {
  /** Action name */
  action: string;

  /** Description */
  description: string;

  /** Required parameters */
  requiredParams: string[];

  /** Optional parameters */
  optionalParams?: string[];

  /** Minimum user type required */
  minUserType: UserType;

  /** Specific roles allowed (optional) */
  allowedRoles?: string[];
}

/**
 * Base agent interface
 */
export interface BaseAgentInterface {
  /** Agent name */
  name: AgentName;

  /** Agent description */
  description: string;

  /** Available capabilities */
  capabilities: AgentCapability[];

  /** Handle a request */
  handle(request: AgentRequest): Promise<AgentResponse>;
}
```

---

## Step 6: Website API Client

### 6.1 Create Agent API Client for Website

Create file: `c:\POS\website\services\agents\api-client.ts`

```typescript
/**
 * Agent API Client
 *
 * Client for communicating with the POS Agent API from the website.
 * Handles authentication, error handling, and retry logic.
 *
 * @module services/agents/api-client
 */

import { auth } from '@/lib/firebase';

/**
 * Agent API configuration
 */
const API_CONFIG = {
  baseUrl: process.env.POS_API_URL || 'http://localhost:3000',
  secret: process.env.AGENT_API_SECRET || '',
  timeout: 30000, // 30 seconds
  retries: 2,
};

/**
 * Agent request interface (matches POS types)
 */
export interface AgentRequest {
  requestId: string;
  fromAgent: 'website-chatbot' | 'staff-assistant';
  toAgent: string;
  action: string;
  params: Record<string, unknown>;
  auth: {
    sessionId: string;
    customerId?: string;
    userType: 'guest' | 'customer' | 'staff';
  };
  timestamp: string;
  context?: {
    conversationId?: string;
    previousMessages?: Array<{ role: string; content: string }>;
  };
}

/**
 * Agent response interface
 */
export interface AgentResponse {
  requestId: string;
  fromAgent: string;
  status: 'success' | 'error' | 'unauthorized' | 'not_found';
  data?: unknown;
  error?: string;
  code?: string;
  timestamp: string;
  processingTime?: number;
  suggestions?: string[];
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') {
    return `server_${Date.now()}`;
  }

  let sessionId = sessionStorage.getItem('agent_session_id');

  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('agent_session_id', sessionId);
  }

  return sessionId;
}

/**
 * Get current user's Firebase ID token
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
  } catch (error) {
    console.warn('Failed to get auth token:', error);
  }
  return null;
}

/**
 * Send request to Agent API with retry logic
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number
): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status < 500) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}`);

    } catch (error) {
      lastError = error as Error;

      if (i < retries) {
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  }

  throw lastError || new Error('Request failed');
}

/**
 * Agent API Client class
 */
export class AgentAPIClient {
  private sessionId: string;

  constructor() {
    this.sessionId = getSessionId();
  }

  /**
   * Send a request to a specialist agent
   */
  async sendRequest(
    toAgent: string,
    action: string,
    params: Record<string, unknown> = {},
    context?: AgentRequest['context']
  ): Promise<AgentResponse> {
    const authToken = await getAuthToken();
    const user = auth.currentUser;

    const request: AgentRequest = {
      requestId: generateRequestId(),
      fromAgent: 'website-chatbot',
      toAgent,
      action,
      params,
      auth: {
        sessionId: this.sessionId,
        customerId: user?.uid,
        userType: user ? 'customer' : 'guest',
      },
      timestamp: new Date().toISOString(),
      context,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Agent-Secret': API_CONFIG.secret,
      'X-Agent-Request-Id': request.requestId,
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.baseUrl}/api/agents`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(request),
          credentials: 'include',
        },
        API_CONFIG.retries
      );

      const data = await response.json();

      return data as AgentResponse;

    } catch (error) {
      console.error('Agent API request failed:', error);

      return {
        requestId: request.requestId,
        fromAgent: 'error',
        status: 'error',
        error: error instanceof Error ? error.message : 'Request failed',
        code: 'NETWORK_ERROR',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }
}

// Export singleton instance
export const agentClient = new AgentAPIClient();
```

---

## Step 7: Deployment Configuration

### 7.1 Vercel Configuration (if using Vercel)

For POS system, create `vercel.json` in POS root:

```json
{
  "headers": [
    {
      "source": "/api/agents",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://website.lorenzo.co.ke"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,POST,OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-Agent-Request-Id, X-Agent-Secret"
        }
      ]
    }
  ]
}
```

### 7.2 Firebase Hosting Configuration

For Firebase Hosting, update `firebase.json`:

```json
{
  "hosting": {
    "public": ".next",
    "headers": [
      {
        "source": "/api/agents",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "https://website.lorenzo.co.ke"
          },
          {
            "key": "Access-Control-Allow-Methods",
            "value": "GET, POST, OPTIONS"
          },
          {
            "key": "Access-Control-Allow-Headers",
            "value": "Content-Type, Authorization, X-Agent-Request-Id, X-Agent-Secret"
          },
          {
            "key": "Access-Control-Allow-Credentials",
            "value": "true"
          }
        ]
      }
    ]
  }
}
```

---

## Step 8: Testing the Configuration

### 8.1 Local Development Testing

1. Start POS system on port 3000:
```bash
cd c:\POS
npm run dev
```

2. Start Website on port 3001:
```bash
cd c:\POS\website
PORT=3001 npm run dev
```

3. Test CORS with curl:
```bash
curl -X OPTIONS http://localhost:3000/api/agents \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Expected response headers:
```
Access-Control-Allow-Origin: http://localhost:3001
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Agent-Request-Id, X-Agent-Secret
Access-Control-Allow-Credentials: true
```

### 8.2 Test Agent Request

```bash
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3001" \
  -H "X-Agent-Secret: your-secure-api-secret-key-here" \
  -d '{
    "requestId": "test_123",
    "fromAgent": "website-chatbot",
    "toAgent": "pricing-agent",
    "action": "getServicePricing",
    "params": {},
    "auth": {
      "sessionId": "test_session",
      "userType": "guest"
    },
    "timestamp": "2024-01-06T12:00:00Z"
  }'
```

---

## Step 9: Security Checklist

Before deploying to production, verify:

- [ ] `AGENT_API_SECRET` is set to a strong, unique value (32+ characters)
- [ ] `ALLOWED_ORIGINS` contains only your production domains
- [ ] Firebase service account key is properly secured
- [ ] Rate limiting is configured appropriately
- [ ] HTTPS is enforced in production
- [ ] API endpoints are not exposed in client-side code
- [ ] Sensitive data is not logged
- [ ] Token verification is working correctly

---

## Step 10: Troubleshooting

### Common Issues

**1. CORS Error: "Origin not allowed"**
- Check `ALLOWED_ORIGINS` includes the exact origin (including protocol)
- Verify no trailing slashes in origin URLs

**2. 401 Unauthorized**
- Check `X-Agent-Secret` header matches `AGENT_API_SECRET`
- Verify secret is set in both environments

**3. Firebase Token Verification Failed**
- Ensure Firebase service account is configured
- Check token hasn't expired
- Verify same Firebase project is used

**4. Network Timeout**
- Increase `timeout` in API config
- Check POS system is running and accessible
- Verify firewall/security groups allow traffic

---

## File Summary

| File Path | Purpose |
|-----------|---------|
| `c:\POS\.env.local` | POS environment variables |
| `c:\POS\website\.env.local` | Website environment variables |
| `c:\POS\lib\api\cors.ts` | CORS middleware utility |
| `c:\POS\app\api\agents\route.ts` | Agent API endpoint |
| `c:\POS\lib\firebase\admin.ts` | Firebase Admin SDK |
| `c:\POS\lib\agents\types.ts` | Agent type definitions |
| `c:\POS\website\services\agents\api-client.ts` | Website API client |

---

**Document Version:** 1.0
**Last Updated:** January 2024
**Author:** AI Agent (Claude)
