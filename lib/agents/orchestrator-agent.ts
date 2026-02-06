/**
 * Orchestrator Agent
 *
 * The main conversational agent that handles customer interactions.
 * Uses OpenAI for natural language understanding and human-like responses.
 * Routes specialized queries to specialist agents and synthesizes responses.
 *
 * @module lib/agents/orchestrator-agent
 */

import { BaseAgent } from './base-agent';
import type {
  AgentAuth,
  AgentResponse,
  AgentCapability,
  AgentName,
} from './types';
import { generateRequestId } from './types';
import {
  generateResponse,
  generateDataResponse,
  classifyIntent,
  getFallbackResponse,
  isOpenAIConfigured,
  type ConversationMessage,
} from './openai-service';
import { getAgentRouter } from './agent-router';

/**
 * Conversation history storage (in-memory for now)
 * In production, this would be stored in Firestore
 */
const conversationHistories: Map<string, ConversationMessage[]> = new Map();

/**
 * Orchestrator Agent - Main conversational interface
 */
export class OrchestratorAgent extends BaseAgent {
  readonly name = 'orchestrator-agent' as const;
  readonly description = 'Main conversational agent that provides human-like responses and routes to specialists';

  readonly capabilities: AgentCapability[] = [
    {
      action: 'chat',
      description: 'Process a chat message and generate a human-like response',
      requiredParams: ['message'],
      optionalParams: ['sessionId'],
      requiresAuth: false,
    },
    {
      action: 'clearHistory',
      description: 'Clear conversation history for a session',
      requiredParams: ['sessionId'],
      requiresAuth: false,
    },
  ];

  async handle(
    action: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    const requestId = generateRequestId();

    switch (action) {
      case 'chat':
        return this.handleChat(requestId, params, auth);
      case 'clearHistory':
        return this.handleClearHistory(requestId, params, auth);
      default:
        return this.errorResponse(requestId, 'not_found', `Unknown action: ${action}`);
    }
  }

  /**
   * Main chat handler
   */
  private async handleChat(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    const message = params.message as string;
    const sessionId = auth.sessionId;

    // Get or create conversation history
    let history = conversationHistories.get(sessionId) || [];

    try {
      // Check if OpenAI is configured
      if (!isOpenAIConfigured()) {
        // Fall back to pattern-based responses
        return this.handleWithoutAI(requestId, message, auth);
      }

      // Classify the user's intent
      const { intent, confidence, entities } = await classifyIntent(message);

      console.log(`[Orchestrator] Intent: ${intent} (${confidence}), Entities:`, entities);

      let response: string;
      let agentData: Record<string, unknown> | null = null;
      let requiresLogin = false;

      // Handle based on intent
      switch (intent) {
        case 'ORDER_TRACKING':
        case 'ORDER_HISTORY':
          if (auth.userType === 'guest') {
            requiresLogin = true;
            response = await generateResponse(
              message,
              history,
              `The user wants to ${intent === 'ORDER_TRACKING' ? 'track their order' : 'see order history'} but is not logged in.
Kindly let them know they need to log in to their customer portal to access their order information.
Be warm and helpful, and mention they can log in at the customer portal.`
            );
          } else {
            // Get order data from specialist
            const orderId = entities.orderId;
            if (orderId) {
              const orderResponse = await this.callSpecialist('order-agent', 'getOrderStatus', { orderId }, auth);
              if (orderResponse.status === 'success') {
                agentData = orderResponse.data as Record<string, unknown>;
                response = await generateDataResponse(message, agentData, 'order', history);
              } else {
                response = await generateResponse(
                  message,
                  history,
                  `Could not find the order. The error was: ${orderResponse.error}.
Help the customer by asking them to verify the order ID or check with our team.`
                );
              }
            } else {
              // Get latest order
              const latestResponse = await this.callSpecialist('order-agent', 'getLatestOrder', {}, auth);
              if (latestResponse.status === 'success' && latestResponse.data) {
                agentData = latestResponse.data as Record<string, unknown>;
                response = await generateDataResponse(message, agentData, 'order', history);
              } else {
                response = await generateResponse(
                  message,
                  history,
                  `The customer doesn't have any orders yet or we couldn't find their orders.
Be helpful and encourage them to place their first order.`
                );
              }
            }
          }
          break;

        case 'PRICING':
          const garmentType = entities.garmentType;
          if (garmentType) {
            const pricingResponse = await this.callSpecialist('pricing-agent', 'getGarmentPrice', { garmentType }, auth);
            if (pricingResponse.status === 'success') {
              agentData = pricingResponse.data as Record<string, unknown>;
              response = await generateDataResponse(message, agentData, 'pricing', history);
            } else {
              response = await generateResponse(
                message,
                history,
                `We don't have standard pricing for that specific item.
Offer to provide a custom quote if they contact us, and mention our general pricing ranges.`
              );
            }
          } else {
            const allPricingResponse = await this.callSpecialist('pricing-agent', 'getServicePricing', {}, auth);
            if (allPricingResponse.status === 'success') {
              agentData = allPricingResponse.data as Record<string, unknown>;
              response = await generateDataResponse(message, agentData, 'pricing', history);
            } else {
              response = await generateResponse(message, history);
            }
          }
          break;

        case 'SERVICES':
          const servicesResponse = await this.callSpecialist('pricing-agent', 'getServicePricing', {}, auth);
          if (servicesResponse.status === 'success') {
            agentData = servicesResponse.data as Record<string, unknown>;
            response = await generateDataResponse(
              message,
              agentData,
              'pricing',
              history
            );
          } else {
            response = await generateResponse(
              message,
              history,
              `Describe Lorenzo's main services: Dry Cleaning, Laundry/Wash, Ironing, and highlight FREE express (2hr) and FREE pickup/delivery.`
            );
          }
          break;

        case 'HOURS':
          response = await generateResponse(
            message,
            history,
            `Share our operating hours:
- Monday - Friday: 7:00 AM - 8:00 PM
- Saturday: 8:00 AM - 6:00 PM
- Sunday: 9:00 AM - 5:00 PM
Mention our 21+ branches and FREE express service.`
          );
          break;

        case 'LOCATIONS':
          response = await generateResponse(
            message,
            history,
            `We have 21+ branches across Nairobi and environs.
The customer can find their nearest branch on our website or call 0728 400 200.
Also mention FREE pickup & delivery.`
          );
          break;

        case 'CONTACT':
          const contactResponse = await this.callSpecialist('support-agent', 'getContactInfo', {}, auth);
          if (contactResponse.status === 'success') {
            agentData = contactResponse.data as Record<string, unknown>;
            response = await generateDataResponse(message, agentData, 'contact', history);
          } else {
            response = await generateResponse(
              message,
              history,
              `Share contact info: Phone 0728 400 200, WhatsApp +254728400200, Email hello@lorenzo.co.ke`
            );
          }
          break;

        case 'SUPPORT':
          // Create a support ticket and escalate
          const supportResponse = await this.callSpecialist(
            'support-agent',
            'escalateToHuman',
            { reason: message },
            auth
          );
          if (supportResponse.status === 'success') {
            agentData = supportResponse.data as Record<string, unknown>;
            response = await generateDataResponse(message, agentData, 'support', history);
          } else {
            response = await generateResponse(
              message,
              history,
              `The customer needs human support. Direct them to call 0728 400 200 or WhatsApp for immediate assistance.
Be empathetic and reassuring.`
            );
          }
          break;

        case 'GREETING':
          response = await generateResponse(
            message,
            history,
            `This is a greeting. Respond warmly and offer to help. Mention a few things you can assist with.`
          );
          break;

        case 'THANKS':
          response = await generateResponse(
            message,
            history,
            `The customer is thanking you. Respond graciously and offer further assistance.`
          );
          break;

        case 'GOODBYE':
          response = await generateResponse(
            message,
            history,
            `The customer is saying goodbye. Wish them well and thank them for choosing Lorenzo.`
          );
          break;

        case 'REGISTER':
          // Handle registration intent
          if (auth.userType !== 'guest') {
            response = await generateResponse(
              message,
              history,
              `The customer is already logged in. Let them know they already have an account and offer to help with their order or schedule a pickup.`
            );
          } else {
            response = await generateResponse(
              message,
              history,
              `The customer wants to register. Direct them to create an account on our website at lorenzo.co.ke/register.
They'll need:
- Their full name
- Phone number (for WhatsApp verification)
- Email address (for email verification)

Once registered, they can schedule pickups, track orders, and manage their profile.
Make it sound easy and welcoming!`
            );
          }
          break;

        case 'SCHEDULE_PICKUP':
          // Handle pickup scheduling intent
          if (auth.userType === 'guest') {
            requiresLogin = true;
            response = await generateResponse(
              message,
              history,
              `The customer wants to schedule a pickup but is not logged in.
Kindly let them know they need to create an account first to schedule a pickup.
Mention they can register at lorenzo.co.ke/register or log in if they already have an account.
Emphasize that pickup is FREE across Nairobi!`
            );
          } else {
            // Guide the customer through scheduling
            const slotsResponse = await this.callSpecialist(
              'logistics-agent',
              'get_available_slots',
              { date: entities.date || new Date().toISOString().split('T')[0] },
              auth
            );

            if (slotsResponse.status === 'success') {
              agentData = slotsResponse.data as Record<string, unknown>;
              response = await generateResponse(
                message,
                history,
                `The customer wants to schedule a pickup. Help them choose a time.

Available slots: ${JSON.stringify(agentData)}

Guide them to:
1. Choose a date (tomorrow onwards)
2. Select a time slot (Morning 8-12, Afternoon 12-4, Evening 4-7)
3. Confirm their pickup address
4. Describe the items they're sending

Emphasize pickup is FREE!`
              );
            } else {
              response = await generateResponse(
                message,
                history,
                `Help the customer schedule a pickup. Our slots are:
- Morning: 8:00 AM - 12:00 PM
- Afternoon: 12:00 PM - 4:00 PM
- Evening: 4:00 PM - 7:00 PM

Guide them to visit lorenzo.co.ke/request-pickup to complete their booking, or help them with the details needed.
Pickup is FREE!`
              );
            }
          }
          break;

        case 'PICKUP_STATUS':
          // Handle pickup status check
          if (auth.userType === 'guest') {
            requiresLogin = true;
            response = await generateResponse(
              message,
              history,
              `The customer wants to check their pickup status but is not logged in.
Ask them to log in to view their pickup requests, or provide the pickup request ID if they have it.`
            );
          } else {
            const requestId = entities.requestId;
            if (requestId) {
              const statusResponse = await this.callSpecialist(
                'logistics-agent',
                'get_pickup_status',
                { requestId },
                auth
              );
              if (statusResponse.status === 'success') {
                agentData = statusResponse.data as Record<string, unknown>;
                response = await generateDataResponse(message, agentData, 'support', history);
              } else {
                response = await generateResponse(
                  message,
                  history,
                  `Could not find the pickup request. Ask them to verify the request ID or check their customer portal.`
                );
              }
            } else {
              // Get all pickups for customer
              const pickupsResponse = await this.callSpecialist(
                'logistics-agent',
                'get_my_pickups',
                { limit: 5 },
                auth
              );
              if (pickupsResponse.status === 'success' && pickupsResponse.data) {
                agentData = pickupsResponse.data as Record<string, unknown>;
                response = await generateDataResponse(
                  message,
                  agentData,
                  'support',
                  history
                );
              } else {
                response = await generateResponse(
                  message,
                  history,
                  `The customer doesn't have any pickup requests. Offer to help them schedule one - pickup is FREE!`
                );
              }
            }
          }
          break;

        case 'CANCEL_PICKUP':
          // Handle pickup cancellation
          if (auth.userType === 'guest') {
            requiresLogin = true;
            response = await generateResponse(
              message,
              history,
              `The customer wants to cancel a pickup but is not logged in. Ask them to log in first.`
            );
          } else {
            const cancelRequestId = entities.requestId;
            if (cancelRequestId) {
              const cancelResponse = await this.callSpecialist(
                'logistics-agent',
                'cancel_pickup',
                { requestId: cancelRequestId },
                auth
              );
              if (cancelResponse.status === 'success') {
                response = await generateResponse(
                  message,
                  history,
                  `The pickup request ${cancelRequestId} has been cancelled successfully.
Be understanding and offer to help them reschedule if needed.`
                );
              } else {
                response = await generateResponse(
                  message,
                  history,
                  `Could not cancel the pickup: ${cancelResponse.error}
Help them understand why and offer alternatives.`
                );
              }
            } else {
              response = await generateResponse(
                message,
                history,
                `The customer wants to cancel a pickup but didn't provide the request ID.
Ask them for the pickup request ID (format: REQ-YYYYMMDD-XXXXX) or suggest they visit their customer portal.`
              );
            }
          }
          break;

        default:
          // Unknown intent - generate a helpful response
          response = await generateResponse(message, history);
      }

      // Update conversation history
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: response });

      // Keep only last 20 messages
      if (history.length > 20) {
        history = history.slice(-20);
      }
      conversationHistories.set(sessionId, history);

      return this.successResponse(requestId, {
        message: response,
        intent,
        confidence,
        requiresLogin,
        agentData,
      }, response);

    } catch (error) {
      console.error('[Orchestrator] Error:', error);

      // Generate fallback response
      const fallback = getFallbackResponse();

      // Still update history
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: fallback });
      conversationHistories.set(sessionId, history);

      return this.successResponse(requestId, {
        message: fallback,
        intent: 'ERROR',
        confidence: 0,
        requiresLogin: false,
      }, fallback);
    }
  }

  /**
   * Handle chat without AI (fallback mode)
   */
  private async handleWithoutAI(
    requestId: string,
    message: string,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    const lowerMessage = message.toLowerCase();

    let response: string;

    // Simple pattern matching
    if (lowerMessage.match(/^(hi|hello|hey|jambo|habari)/i)) {
      response = `Jambo! 👋 Welcome to Lorenzo Dry Cleaners! I'm here to help you with:

• **Order tracking** - Check your order status
• **Pricing** - Get service prices
• **Our services** - Learn what we offer
• **Support** - Connect with our team

What can I help you with today?`;
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      response = `Great question! Our pricing varies by garment type. Here are some examples:

• **Shirts**: Wash KES 150, Dry Clean KES 250
• **Suits**: Wash KES 300, Dry Clean KES 500
• **Dresses**: Wash KES 200, Dry Clean KES 350

✨ **Express service (2hr)** - FREE!
🚗 **Pickup & Delivery** - FREE!

Want a specific quote? Just tell me what items you have!`;
    } else if (lowerMessage.includes('order') || lowerMessage.includes('track') || lowerMessage.includes('status')) {
      if (auth.userType === 'guest') {
        response = `To track your order, please log in to your customer account first.

You can log in at our customer portal, or if you have your order ID handy, our team can help you at **0728 400 200**.`;
      } else {
        response = `I'd be happy to help track your order! Could you provide your order ID? It looks like **ORD-MAIN-XXXXXXXX-XXXX**.

If you don't have it handy, I can look up your most recent order.`;
      }
    } else if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
      response = `We're open and ready to serve you! 🕐

• **Mon - Fri**: 7:00 AM - 8:00 PM
• **Saturday**: 8:00 AM - 6:00 PM
• **Sunday**: 9:00 AM - 5:00 PM

With **21+ branches** across Nairobi, there's always one near you!`;
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('call') || lowerMessage.includes('phone') || lowerMessage.includes('whatsapp')) {
      response = `Here's how to reach us:

📞 **Phone**: 0728 400 200
💬 **WhatsApp**: +254728400200
📧 **Email**: hello@lorenzo.co.ke

We're always happy to help! 😊`;
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('speak') || lowerMessage.includes('human')) {
      response = `I understand you'd like to speak with our team. No problem at all!

📞 Call us: **0728 400 200**
💬 WhatsApp: **+254728400200**

Our friendly staff are available during business hours and would love to help you!`;
    } else {
      response = `Thanks for your message! I'm here to help with:

• **Order tracking** - "Where is my order?"
• **Pricing** - "How much for a suit?"
• **Services** - "What services do you offer?"
• **Support** - "I need help"

Or call us directly at **0728 400 200** - we're always happy to chat! 😊`;
    }

    return this.successResponse(requestId, {
      message: response,
      intent: 'FALLBACK',
      confidence: 1,
      requiresLogin: false,
    }, response);
  }

  /**
   * Call a specialist agent
   */
  private async callSpecialist(
    agentName: AgentName,
    action: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    const router = getAgentRouter();
    return router.sendRequest(agentName, action, params, auth, 'website-chatbot');
  }

  /**
   * Clear conversation history
   */
  private async handleClearHistory(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    const sessionId = auth.sessionId;
    conversationHistories.delete(sessionId);

    return this.successResponse(requestId, {
      cleared: true,
    }, 'Conversation history cleared');
  }
}

/**
 * Create and export singleton instance
 */
export const orchestratorAgent = new OrchestratorAgent();
