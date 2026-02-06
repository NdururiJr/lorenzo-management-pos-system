/**
 * Support Agent
 *
 * Specialist agent for handling support requests, complaints, and escalations.
 * Manages support tickets and human handoff when needed.
 *
 * @module lib/agents/support-agent
 */

import { BaseAgent } from './base-agent';
import type {
  AgentAuth,
  AgentResponse,
  AgentCapability,
  SupportTicket,
} from './types';
import { generateRequestId, LORENZO_INFO } from './types';

// Support ticket storage (in-memory for now, should be Firestore in production)
const supportTickets: Map<string, SupportTicket> = new Map();

/**
 * Support Agent - Handles support requests and escalations
 */
export class SupportAgent extends BaseAgent {
  readonly name = 'support-agent' as const;
  readonly description = 'Support and escalation specialist - handles complaints, requests, and human handoff';

  readonly capabilities: AgentCapability[] = [
    {
      action: 'createTicket',
      description: 'Create a support ticket',
      requiredParams: ['subject', 'description'],
      optionalParams: ['priority', 'orderId'],
      requiresAuth: false,
    },
    {
      action: 'getTicketStatus',
      description: 'Get status of a support ticket',
      requiredParams: ['ticketId'],
      requiresAuth: true,
    },
    {
      action: 'getMyTickets',
      description: 'Get all tickets for the current user',
      requiredParams: [],
      optionalParams: ['status'],
      requiresAuth: true,
    },
    {
      action: 'escalateToHuman',
      description: 'Request to speak with a human support agent',
      requiredParams: [],
      optionalParams: ['reason'],
      requiresAuth: false,
    },
    {
      action: 'getContactInfo',
      description: 'Get contact information for support',
      requiredParams: [],
      requiresAuth: false,
    },
    {
      action: 'getAllTickets',
      description: 'Get all support tickets (staff only)',
      requiredParams: [],
      optionalParams: ['status', 'limit'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
    },
    {
      action: 'updateTicket',
      description: 'Update a support ticket (staff only)',
      requiredParams: ['ticketId'],
      optionalParams: ['status', 'assignedTo', 'notes'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
    },
  ];

  async handle(
    action: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    const requestId = generateRequestId();

    switch (action) {
      case 'createTicket':
        return this.createTicket(requestId, params, auth);
      case 'getTicketStatus':
        return this.getTicketStatus(requestId, params, auth);
      case 'getMyTickets':
        return this.getMyTickets(requestId, params, auth);
      case 'escalateToHuman':
        return this.escalateToHuman(requestId, params, auth);
      case 'getContactInfo':
        return this.getContactInfo(requestId, params, auth);
      case 'getAllTickets':
        return this.getAllTickets(requestId, params, auth);
      case 'updateTicket':
        return this.updateTicket(requestId, params, auth);
      default:
        return this.errorResponse(requestId, 'not_found', `Unknown action: ${action}`);
    }
  }

  /**
   * Create a support ticket
   */
  private async createTicket(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const subject = params.subject as string;
      const description = params.description as string;
      const priority = (params.priority as SupportTicket['priority']) || 'medium';
      const _orderId = params.orderId as string | undefined;

      const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
      const customerId = auth.customerId || auth.sessionId;

      const ticket: SupportTicket = {
        ticketId,
        customerId,
        subject,
        description,
        status: 'open',
        priority,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      supportTickets.set(ticketId, ticket);

      // In production, this would:
      // 1. Save to Firestore
      // 2. Send WhatsApp notification via Wati.io
      // 3. Send email notification via Resend

      return this.successResponse(requestId, {
        ticketId,
        status: 'open',
        message: 'Your support ticket has been created.',
        expectedResponse: 'Our team will respond within 24 hours.',
        contact: {
          phone: LORENZO_INFO.phone,
          whatsapp: LORENZO_INFO.whatsapp,
          email: LORENZO_INFO.email,
        },
      }, `Support ticket ${ticketId} created successfully. We'll get back to you soon!`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to create support ticket.');
    }
  }

  /**
   * Get status of a support ticket
   */
  private async getTicketStatus(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const ticketId = params.ticketId as string;
      const ticket = supportTickets.get(ticketId);

      if (!ticket) {
        return this.errorResponse(requestId, 'not_found', 'Ticket not found.');
      }

      // Verify ownership for customers
      if (auth.userType === 'customer' && ticket.customerId !== auth.customerId) {
        return this.errorResponse(requestId, 'unauthorized', 'You do not have access to this ticket.');
      }

      return this.successResponse(requestId, {
        ticketId: ticket.ticketId,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        assignedTo: ticket.assignedTo,
      }, `Ticket ${ticketId} is currently: ${ticket.status}`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve ticket status.');
    }
  }

  /**
   * Get all tickets for the current user
   */
  private async getMyTickets(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const status = params.status as SupportTicket['status'] | undefined;
      const customerId = auth.customerId || auth.sessionId;

      const userTickets = Array.from(supportTickets.values())
        .filter((t) => t.customerId === customerId)
        .filter((t) => !status || t.status === status)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return this.successResponse(requestId, {
        tickets: userTickets.map((t) => ({
          ticketId: t.ticketId,
          subject: t.subject,
          status: t.status,
          priority: t.priority,
          createdAt: t.createdAt,
        })),
        count: userTickets.length,
      }, `You have ${userTickets.length} support ticket(s)`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve your tickets.');
    }
  }

  /**
   * Request to speak with a human agent
   */
  private async escalateToHuman(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    const reason = params.reason as string || 'Customer requested human support';

    // Create an escalation ticket
    const ticketId = `ESC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
    const customerId = auth.customerId || auth.sessionId;

    const ticket: SupportTicket = {
      ticketId,
      customerId,
      subject: 'Human Support Requested',
      description: reason,
      status: 'open',
      priority: 'high',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    supportTickets.set(ticketId, ticket);

    return this.successResponse(requestId, {
      escalated: true,
      ticketId,
      message: 'I\'ve escalated your request to our human support team.',
      contact: {
        phone: LORENZO_INFO.phone,
        whatsapp: LORENZO_INFO.whatsapp,
        email: LORENZO_INFO.email,
        hours: LORENZO_INFO.hours,
      },
      immediateHelp: `For immediate assistance, please call ${LORENZO_INFO.phone} or WhatsApp us.`,
    }, `I've connected you with our support team. Reference: ${ticketId}. For immediate help, call ${LORENZO_INFO.phone}`);
  }

  /**
   * Get contact information
   */
  private async getContactInfo(
    requestId: string,
    _params: Record<string, unknown>,
    _auth: AgentAuth
  ): Promise<AgentResponse> {
    return this.successResponse(requestId, {
      phone: LORENZO_INFO.phone,
      whatsapp: LORENZO_INFO.whatsapp,
      email: LORENZO_INFO.email,
      website: LORENZO_INFO.website,
      hours: LORENZO_INFO.hours,
      branches: LORENZO_INFO.branches,
      location: LORENZO_INFO.location,
    }, `Contact us at ${LORENZO_INFO.phone} or WhatsApp ${LORENZO_INFO.whatsapp}`);
  }

  /**
   * Get all tickets (staff only)
   */
  private async getAllTickets(
    requestId: string,
    params: Record<string, unknown>,
    _auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const status = params.status as SupportTicket['status'] | undefined;
      const limit = (params.limit as number) || 50;

      let tickets = Array.from(supportTickets.values())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      if (status) {
        tickets = tickets.filter((t) => t.status === status);
      }

      tickets = tickets.slice(0, limit);

      const openCount = Array.from(supportTickets.values()).filter((t) => t.status === 'open').length;
      const inProgressCount = Array.from(supportTickets.values()).filter((t) => t.status === 'in_progress').length;

      return this.successResponse(requestId, {
        tickets: tickets.map((t) => ({
          ticketId: t.ticketId,
          customerId: t.customerId,
          subject: t.subject,
          status: t.status,
          priority: t.priority,
          createdAt: t.createdAt,
          assignedTo: t.assignedTo,
        })),
        count: tickets.length,
        summary: {
          open: openCount,
          inProgress: inProgressCount,
          total: supportTickets.size,
        },
      }, `${tickets.length} support tickets found`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve tickets.');
    }
  }

  /**
   * Update a ticket (staff only)
   */
  private async updateTicket(
    requestId: string,
    params: Record<string, unknown>,
    _auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const ticketId = params.ticketId as string;
      const ticket = supportTickets.get(ticketId);

      if (!ticket) {
        return this.errorResponse(requestId, 'not_found', 'Ticket not found.');
      }

      // Update fields
      if (params.status) {
        ticket.status = params.status as SupportTicket['status'];
      }
      if (params.assignedTo) {
        ticket.assignedTo = params.assignedTo as string;
      }
      ticket.updatedAt = new Date();

      supportTickets.set(ticketId, ticket);

      return this.successResponse(requestId, {
        ticketId: ticket.ticketId,
        status: ticket.status,
        assignedTo: ticket.assignedTo,
        updatedAt: ticket.updatedAt,
      }, `Ticket ${ticketId} updated successfully`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to update ticket.');
    }
  }
}

/**
 * Create and export a singleton instance
 */
export const supportAgent = new SupportAgent();
