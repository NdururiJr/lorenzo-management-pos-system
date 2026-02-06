/**
 * OpenAI Service for Agent System
 *
 * Provides LLM integration for natural language understanding
 * and human-like response generation. Now supports multiple providers
 * configurable through admin UI.
 *
 * @module lib/agents/openai-service
 */

import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { getLLMClient, type ChatMessage } from '@/lib/llm';
import type { LLMAgentType, AgentFunction } from '@/lib/db/schema';

/**
 * Flag to use configurable LLM client vs legacy OpenAI direct
 * Set to true to use admin-configured models
 */
const USE_CONFIGURABLE_LLM = process.env.USE_CONFIGURABLE_LLM === 'true';

/**
 * Get OpenAI client instance (legacy mode)
 * Uses a separate API key for the chatbot (OPENAI_CHATBOT_API_KEY)
 * Falls back to general OPENAI_API_KEY if not set
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_CHATBOT_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Set OPENAI_CHATBOT_API_KEY in environment variables.');
  }

  return new OpenAI({
    apiKey,
  });
}

/**
 * Lorenzo company context for Melvin
 */
const LORENZO_CONTEXT = `
You are Melvin, the friendly assistant for Lorenzo Dry Cleaners - Kenya's premier dry cleaning service.

IMPORTANT: You are Melvin, NOT an AI. Never refer to yourself as an AI, AI assistant, or artificial intelligence.
You are simply "Melvin" or "your assistant for today at Lorenzo Dry Cleaners". When asked who you are, say "I'm Melvin, your assistant for today at Lorenzo Dry Cleaners."

## About Lorenzo Dry Cleaners
- Established in 2013
- 21+ branches across Nairobi and environs
- Known for premium fabric care and exceptional service

## Key Services & Pricing
- **Dry Cleaning**: Professional solvent cleaning for delicate fabrics
- **Laundry (Wash)**: Machine wash with premium detergents
- **Ironing/Pressing**: Professional steam pressing
- **Starch**: Available for shirts and formal wear
- **Express Service**: 2-hour turnaround - completely FREE!
- **Pickup & Delivery**: FREE across Nairobi

## Contact Information
- Phone: 0728 400 200
- WhatsApp: +254728400200
- Email: hello@lorenzo.co.ke

## Operating Hours
- Monday - Friday: 7:00 AM - 8:00 PM
- Saturday: 8:00 AM - 6:00 PM
- Sunday: 9:00 AM - 5:00 PM

## Your Personality
- Warm, friendly, and professional
- Helpful and solution-oriented
- Proud of Lorenzo's quality and service
- Use occasional Kenyan expressions naturally (Jambo, Karibu, Asante)
- Keep responses concise but helpful (2-4 sentences for simple queries)
- Be enthusiastic about helping customers
- Remember: You are Melvin, a person helping customers, not an AI
`;

/**
 * System prompt for the orchestrator
 */
const ORCHESTRATOR_SYSTEM_PROMPT = `${LORENZO_CONTEXT}

## Your Role
You are Melvin, the customer-facing assistant. Your job is to:
1. Understand what the customer needs
2. Provide helpful, friendly responses
3. Guide them to the right information or action

## Response Guidelines
- Be conversational and warm, like talking to a helpful friend
- Keep responses concise (2-4 sentences for simple queries, more for complex ones)
- Use markdown formatting for lists and emphasis when helpful
- Include relevant emojis sparingly to add warmth (1-2 per response max)
- Always offer next steps or ask if they need anything else
- If you can't help with something, kindly direct them to call 0728 400 200
- NEVER say you are an AI, chatbot, or artificial intelligence - you are simply Melvin

## When You Have Data
When I provide you with data from our systems, incorporate it naturally into your response.
Don't just list the data - explain it in a friendly, helpful way.

## Topics You Can Help With
- Order tracking and status updates
- Service pricing and quotes
- Branch locations and hours
- Pickup and delivery scheduling
- General questions about our services
- Support and complaints (escalate to human when needed)
`;

/**
 * Message history for conversation context
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Generate a human-like response using configured LLM provider
 *
 * @param userMessage - The user's message
 * @param conversationHistory - Previous messages in the conversation
 * @param systemContext - Additional context to include
 * @param agentType - The agent type for model selection (default: orchestrator)
 * @param agentFunction - The function type for model selection (default: chat_response)
 */
export async function generateResponse(
  userMessage: string,
  conversationHistory: ConversationMessage[] = [],
  systemContext?: string,
  agentType: LLMAgentType = 'orchestrator',
  agentFunction: AgentFunction = 'chat_response'
): Promise<string> {
  // Use configurable LLM client if enabled
  if (USE_CONFIGURABLE_LLM) {
    return generateResponseWithLLM(userMessage, conversationHistory, systemContext, agentType, agentFunction);
  }

  // Legacy OpenAI direct mode
  const openai = getOpenAIClient();

  // Build messages array
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemContext
        ? `${ORCHESTRATOR_SYSTEM_PROMPT}\n\n## Additional Context\n${systemContext}`
        : ORCHESTRATOR_SYSTEM_PROMPT,
    },
  ];

  // Add conversation history (last 10 messages for context)
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    });
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7, // Balanced creativity
      max_tokens: 500,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again or call us at 0728 400 200.';
  } catch (error) {
    console.error('[OpenAI Service] Error generating response:', error);
    throw error;
  }
}

/**
 * Generate response using configurable LLM client
 */
async function generateResponseWithLLM(
  userMessage: string,
  conversationHistory: ConversationMessage[],
  systemContext: string | undefined,
  agentType: LLMAgentType,
  agentFunction: AgentFunction
): Promise<string> {
  const llmClient = getLLMClient();

  // Build messages array
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: systemContext
        ? `${ORCHESTRATOR_SYSTEM_PROMPT}\n\n## Additional Context\n${systemContext}`
        : ORCHESTRATOR_SYSTEM_PROMPT,
    },
  ];

  // Add conversation history (last 10 messages for context)
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    if (msg.role !== 'system') {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage,
  });

  try {
    const response = await llmClient.chatCompletion(agentType, agentFunction, messages, {
      maxTokens: 500,
      presencePenalty: 0.1,
      frequencyPenalty: 0.1,
    });

    return response.content || 'I apologize, but I couldn\'t generate a response. Please try again or call us at 0728 400 200.';
  } catch (error) {
    console.error('[LLM Service] Error generating response:', error);
    throw error;
  }
}

/**
 * Intent classification system prompt
 */
const INTENT_CLASSIFIER_PROMPT = `You are an intent classifier for Lorenzo Dry Cleaners customer service.
Analyze the user's message and return a JSON object with:
- intent: One of [ORDER_TRACKING, ORDER_HISTORY, PRICING, SERVICES, HOURS, LOCATIONS, CONTACT, SUPPORT, GREETING, THANKS, GOODBYE, REGISTER, SCHEDULE_PICKUP, PICKUP_STATUS, CANCEL_PICKUP, UNKNOWN]
- confidence: A number between 0 and 1
- entities: Any extracted entities like orderId, garmentType, requestId, phone, email, name, date, timeSlot, etc.

Examples:
- "Where is my order ORD-MAIN-20250106-0001?" -> {"intent": "ORDER_TRACKING", "confidence": 0.95, "entities": {"orderId": "ORD-MAIN-20250106-0001"}}
- "How much for a suit?" -> {"intent": "PRICING", "confidence": 0.9, "entities": {"garmentType": "Suit"}}
- "Hi there!" -> {"intent": "GREETING", "confidence": 0.95, "entities": {}}
- "I want to create an account" -> {"intent": "REGISTER", "confidence": 0.95, "entities": {}}
- "I need to sign up" -> {"intent": "REGISTER", "confidence": 0.9, "entities": {}}
- "Schedule a pickup for tomorrow" -> {"intent": "SCHEDULE_PICKUP", "confidence": 0.95, "entities": {"date": "tomorrow"}}
- "I need someone to pick up my clothes" -> {"intent": "SCHEDULE_PICKUP", "confidence": 0.9, "entities": {}}
- "Cancel my pickup request REQ-20250107-ABC123" -> {"intent": "CANCEL_PICKUP", "confidence": 0.95, "entities": {"requestId": "REQ-20250107-ABC123"}}
- "What's the status of my pickup?" -> {"intent": "PICKUP_STATUS", "confidence": 0.9, "entities": {}}

Return ONLY valid JSON, no other text.`;

/**
 * Classify user intent using configured LLM provider
 *
 * @param userMessage - The user's message to classify
 * @param agentType - The agent type for model selection (default: orchestrator)
 */
export async function classifyIntent(
  userMessage: string,
  agentType: LLMAgentType = 'orchestrator'
): Promise<{
  intent: string;
  confidence: number;
  entities: Record<string, string>;
}> {
  // Use configurable LLM client if enabled
  if (USE_CONFIGURABLE_LLM) {
    return classifyIntentWithLLM(userMessage, agentType);
  }

  // Legacy OpenAI direct mode
  const openai = getOpenAIClient();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: INTENT_CLASSIFIER_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.1, // Low temperature for consistent classification
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content || '{}';

    // Parse JSON response
    try {
      const parsed = JSON.parse(response);
      return {
        intent: parsed.intent || 'UNKNOWN',
        confidence: parsed.confidence || 0.5,
        entities: parsed.entities || {},
      };
    } catch {
      return { intent: 'UNKNOWN', confidence: 0.5, entities: {} };
    }
  } catch (error) {
    console.error('[OpenAI Service] Error classifying intent:', error);
    return { intent: 'UNKNOWN', confidence: 0, entities: {} };
  }
}

/**
 * Classify intent using configurable LLM client
 */
async function classifyIntentWithLLM(
  userMessage: string,
  agentType: LLMAgentType
): Promise<{
  intent: string;
  confidence: number;
  entities: Record<string, string>;
}> {
  const llmClient = getLLMClient();

  const messages: ChatMessage[] = [
    { role: 'system', content: INTENT_CLASSIFIER_PROMPT },
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await llmClient.chatCompletion(agentType, 'intent_classification', messages, {
      temperature: 0.1,
      maxTokens: 200,
    });

    // Parse JSON response
    try {
      const parsed = JSON.parse(response.content);
      return {
        intent: parsed.intent || 'UNKNOWN',
        confidence: parsed.confidence || 0.5,
        entities: parsed.entities || {},
      };
    } catch {
      return { intent: 'UNKNOWN', confidence: 0.5, entities: {} };
    }
  } catch (error) {
    console.error('[LLM Service] Error classifying intent:', error);
    return { intent: 'UNKNOWN', confidence: 0, entities: {} };
  }
}

/**
 * Generate a response that incorporates data from specialist agents
 */
export async function generateDataResponse(
  userMessage: string,
  agentData: Record<string, unknown>,
  dataType: 'order' | 'pricing' | 'customer' | 'support' | 'contact',
  conversationHistory: ConversationMessage[] = []
): Promise<string> {
  let dataContext = '';

  switch (dataType) {
    case 'order':
      dataContext = `
## Order Information Retrieved
${JSON.stringify(agentData, null, 2)}

Present this order information in a friendly, easy-to-understand way.
Explain the status clearly and what happens next.
`;
      break;

    case 'pricing':
      dataContext = `
## Pricing Information Retrieved
${JSON.stringify(agentData, null, 2)}

Present the pricing in a clear, helpful way.
Highlight that express service and pickup/delivery are FREE.
`;
      break;

    case 'customer':
      dataContext = `
## Customer Information Retrieved
${JSON.stringify(agentData, null, 2)}

Acknowledge the customer warmly using their information.
`;
      break;

    case 'support':
      dataContext = `
## Support Ticket Created
${JSON.stringify(agentData, null, 2)}

Confirm the support request and reassure the customer.
Provide the ticket reference and expected response time.
`;
      break;

    case 'contact':
      dataContext = `
## Contact Information
${JSON.stringify(agentData, null, 2)}

Share the contact details in a friendly, helpful way.
`;
      break;
  }

  return generateResponse(userMessage, conversationHistory, dataContext);
}

/**
 * Generate a fallback response when something goes wrong
 */
export function getFallbackResponse(_error?: string): string {
  const fallbacks = [
    "I'm having a bit of trouble right now. 😅 Could you try again, or feel free to call us at **0728 400 200** - our team is always happy to help!",
    "Oops! Something went wrong on my end. Please try again, or reach out to us directly at **0728 400 200** or via WhatsApp.",
    "I apologize, but I couldn't process that request. Our friendly team at **0728 400 200** can definitely help you out!",
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!(process.env.OPENAI_CHATBOT_API_KEY || process.env.OPENAI_API_KEY);
}
