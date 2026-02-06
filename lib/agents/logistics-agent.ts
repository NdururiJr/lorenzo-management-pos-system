/**
 * Logistics Agent
 *
 * Handles pickup and delivery scheduling, driver assignment, and route management.
 * This agent manages:
 * - Pickup request scheduling
 * - Delivery scheduling
 * - Available time slots
 * - Driver assignment
 * - Status updates
 * - Route optimization
 *
 * @module lib/agents/logistics-agent
 */

import { BaseAgent } from './base-agent';
import type {
  AgentAuth,
  AgentCapability,
  AgentResponse,
  TimeSlot,
} from './types';
import {
  createPickupRequest,
  getPickupRequest,
  getPickupRequestsByCustomer,
  getPickupRequestsByDriver,
  getPendingPickupRequests,
  updatePickupRequestStatus,
  assignDriverToPickup,
  confirmPickupRequest,
  completePickup,
  markPickupAtFacility,
  convertPickupToOrder,
  cancelPickupRequest,
  getAvailableTimeSlots,
  getPickupRequestStats,
  type PickupAddress,
} from '@/lib/db/pickup-requests';
import { getCustomer } from '@/lib/db/customers';

/**
 * Logistics Agent - handles pickups, deliveries, and scheduling
 */
export class LogisticsAgent extends BaseAgent {
  readonly name = 'logistics-agent' as const;
  readonly description =
    'Handles pickup and delivery scheduling, driver assignment, and route management.';

  readonly capabilities: AgentCapability[] = [
    // Customer capabilities
    {
      action: 'schedule_pickup',
      description: 'Schedule a new pickup request',
      requiredParams: ['serviceTypes', 'itemDescription', 'pickupAddress', 'preferredDate', 'timeSlot'],
      optionalParams: ['expressService', 'specialInstructions'],
      requiresAuth: true,
      allowedUserTypes: ['customer'],
    },
    {
      action: 'get_available_slots',
      description: 'Get available pickup time slots for a date',
      requiredParams: ['date'],
      optionalParams: [],
      requiresAuth: false,
    },
    {
      action: 'get_my_pickups',
      description: 'Get customer pickup requests',
      requiredParams: [],
      optionalParams: ['limit'],
      requiresAuth: true,
      allowedUserTypes: ['customer'],
    },
    {
      action: 'get_pickup_status',
      description: 'Get status of a pickup request',
      requiredParams: ['requestId'],
      optionalParams: [],
      requiresAuth: true,
      allowedUserTypes: ['customer', 'staff'],
    },
    {
      action: 'cancel_pickup',
      description: 'Cancel a pickup request',
      requiredParams: ['requestId'],
      optionalParams: ['reason'],
      requiresAuth: true,
      allowedUserTypes: ['customer', 'staff'],
    },

    // Staff capabilities
    {
      action: 'get_pending_pickups',
      description: 'Get all pending pickup requests',
      requiredParams: [],
      optionalParams: ['limit'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ['admin', 'director', 'general_manager', 'store_manager', 'front_desk'],
    },
    {
      action: 'confirm_pickup',
      description: 'Confirm a pickup request',
      requiredParams: ['requestId'],
      optionalParams: ['confirmedTime'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ['admin', 'director', 'general_manager', 'store_manager', 'front_desk'],
    },
    {
      action: 'assign_driver',
      description: 'Assign a driver to a pickup',
      requiredParams: ['requestId', 'driverId', 'driverName'],
      optionalParams: ['confirmedTime'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ['admin', 'director', 'general_manager', 'store_manager'],
    },
    {
      action: 'update_pickup_status',
      description: 'Update pickup request status',
      requiredParams: ['requestId', 'status'],
      optionalParams: [],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ['admin', 'director', 'general_manager', 'store_manager', 'driver'],
    },
    {
      action: 'convert_to_order',
      description: 'Convert pickup request to order',
      requiredParams: ['requestId', 'orderId'],
      optionalParams: [],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ['admin', 'director', 'general_manager', 'store_manager', 'front_desk'],
    },

    // Driver capabilities
    {
      action: 'get_my_assigned_pickups',
      description: 'Get pickups assigned to current driver',
      requiredParams: [],
      optionalParams: ['date'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ['driver'],
    },
    {
      action: 'mark_picked_up',
      description: 'Mark a pickup as completed',
      requiredParams: ['requestId'],
      optionalParams: [],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ['driver'],
    },
    {
      action: 'mark_at_facility',
      description: 'Mark pickup as arrived at facility',
      requiredParams: ['requestId'],
      optionalParams: [],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ['driver', 'front_desk'],
    },

    // Analytics
    {
      action: 'get_pickup_stats',
      description: 'Get pickup request statistics',
      requiredParams: ['startDate', 'endDate'],
      optionalParams: [],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ['admin', 'director', 'general_manager', 'store_manager'],
    },
  ];

  /**
   * Handle incoming requests
   */
  async handle(
    action: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    const requestId = this.generateId();

    switch (action) {
      case 'schedule_pickup':
        return this.schedulePickup(requestId, auth, params);

      case 'get_available_slots':
        return this.getAvailableSlots(requestId, params.date as string);

      case 'get_my_pickups':
        return this.getMyPickups(requestId, auth, params.limit as number | undefined);

      case 'get_pickup_status':
        return this.getPickupStatus(requestId, params.requestId as string, auth);

      case 'cancel_pickup':
        return this.cancelPickup(
          requestId,
          params.requestId as string,
          params.reason as string | undefined,
          auth
        );

      case 'get_pending_pickups':
        return this.getPendingPickups(requestId, params.limit as number | undefined);

      case 'confirm_pickup':
        return this.confirmPickup(
          requestId,
          params.requestId as string,
          params.confirmedTime as string | undefined
        );

      case 'assign_driver':
        return this.assignDriver(
          requestId,
          params.requestId as string,
          params.driverId as string,
          params.driverName as string,
          params.confirmedTime as string | undefined
        );

      case 'update_pickup_status':
        return this.updateStatus(
          requestId,
          params.requestId as string,
          params.status as string
        );

      case 'convert_to_order':
        return this.convertToOrder(
          requestId,
          params.requestId as string,
          params.orderId as string
        );

      case 'get_my_assigned_pickups':
        return this.getDriverPickups(requestId, auth, params.date as string | undefined);

      case 'mark_picked_up':
        return this.markPickedUp(requestId, params.requestId as string);

      case 'mark_at_facility':
        return this.markAtFacility(requestId, params.requestId as string);

      case 'get_pickup_stats':
        return this.getStats(
          requestId,
          params.startDate as string,
          params.endDate as string
        );

      default:
        return this.errorResponse(requestId, 'not_found', `Unknown action: ${action}`);
    }
  }

  /**
   * Schedule a new pickup request
   */
  private async schedulePickup(
    requestId: string,
    auth: AgentAuth,
    params: Record<string, unknown>
  ): Promise<AgentResponse> {
    try {
      if (!auth.customerId) {
        return this.errorResponse(
          requestId,
          'unauthorized',
          'Please log in to schedule a pickup.'
        );
      }

      // Get customer info
      const customer = await getCustomer(auth.customerId);

      // Parse the date
      const preferredDate = new Date(params.preferredDate as string);
      if (isNaN(preferredDate.getTime())) {
        return this.errorResponse(requestId, 'error', 'Invalid date format.');
      }

      // Validate date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (preferredDate < today) {
        return this.errorResponse(requestId, 'error', 'Pickup date must be in the future.');
      }

      // Validate time slot
      const timeSlot = params.timeSlot as TimeSlot;
      if (!['morning', 'afternoon', 'evening'].includes(timeSlot)) {
        return this.errorResponse(requestId, 'error', 'Invalid time slot.');
      }

      // Check slot availability
      const availableSlots = await getAvailableTimeSlots(preferredDate);
      if (!availableSlots.includes(timeSlot)) {
        return this.errorResponse(
          requestId,
          'error',
          `The ${timeSlot} slot is fully booked for this date. Please choose another time.`
        );
      }

      // Create the pickup request
      const pickupRequestId = await createPickupRequest({
        customerId: auth.customerId,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        serviceTypes: params.serviceTypes as string[],
        itemDescription: params.itemDescription as string,
        expressService: params.expressService as boolean | undefined,
        specialInstructions: params.specialInstructions as string | undefined,
        pickupAddress: params.pickupAddress as PickupAddress,
        preferredDate,
        timeSlot,
        source: 'chatbot',
      });

      // TODO: Send confirmation WhatsApp message
      // await sendPickupConfirmationMessage(customer.phone, pickupRequestId, preferredDate, timeSlot);

      const timeSlotLabel = this.getTimeSlotLabel(timeSlot);

      return this.successResponse(
        requestId,
        {
          requestId: pickupRequestId,
          preferredDate: preferredDate.toISOString(),
          timeSlot,
          timeSlotLabel,
          status: 'pending',
        },
        `Pickup scheduled! Request ID: ${pickupRequestId}\n\n` +
          `Date: ${this.formatDate(preferredDate)}\n` +
          `Time: ${timeSlotLabel}\n` +
          `Address: ${(params.pickupAddress as PickupAddress).address}\n\n` +
          `We'll confirm your pickup shortly and assign a driver. You'll receive a WhatsApp notification when your driver is on the way.`
      );
    } catch (error) {
      console.error('[LogisticsAgent] Schedule pickup error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to schedule pickup. Please try again.'
      );
    }
  }

  /**
   * Get available time slots for a date
   */
  private async getAvailableSlots(
    requestId: string,
    dateStr: string
  ): Promise<AgentResponse> {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return this.errorResponse(requestId, 'error', 'Invalid date format.');
      }

      const availableSlots = await getAvailableTimeSlots(date);

      const slots = availableSlots.map((slot) => ({
        slot,
        label: this.getTimeSlotLabel(slot),
        available: true,
      }));

      return this.successResponse(
        requestId,
        { date: dateStr, slots },
        availableSlots.length > 0
          ? `Available slots for ${this.formatDate(date)}: ${availableSlots.map((s) => this.getTimeSlotLabel(s)).join(', ')}`
          : `No available slots for ${this.formatDate(date)}. Please try another date.`
      );
    } catch (error) {
      console.error('[LogisticsAgent] Get available slots error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to get available slots.'
      );
    }
  }

  /**
   * Get customer's pickup requests
   */
  private async getMyPickups(
    requestId: string,
    auth: AgentAuth,
    limitCount?: number
  ): Promise<AgentResponse> {
    try {
      if (!auth.customerId) {
        return this.errorResponse(
          requestId,
          'unauthorized',
          'Please log in to view your pickups.'
        );
      }

      const pickups = await getPickupRequestsByCustomer(auth.customerId, limitCount || 10);

      const formattedPickups = pickups.map((p) => ({
        requestId: p.requestId,
        date: p.preferredDate.toDate().toISOString(),
        timeSlot: p.timeSlot,
        timeSlotLabel: this.getTimeSlotLabel(p.timeSlot),
        status: p.status,
        statusLabel: this.getStatusLabel(p.status),
        serviceTypes: p.serviceTypes,
        driverName: p.assignedDriverName,
      }));

      return this.successResponse(
        requestId,
        { pickups: formattedPickups },
        pickups.length > 0
          ? `You have ${pickups.length} pickup request(s).`
          : "You don't have any pickup requests yet."
      );
    } catch (error) {
      console.error('[LogisticsAgent] Get my pickups error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to get pickup requests.'
      );
    }
  }

  /**
   * Get status of a pickup request
   */
  private async getPickupStatus(
    requestId: string,
    pickupRequestId: string,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const pickup = await getPickupRequest(pickupRequestId);

      // For customers, verify ownership
      if (auth.userType === 'customer' && pickup.customerId !== auth.customerId) {
        return this.errorResponse(
          requestId,
          'unauthorized',
          'You can only view your own pickup requests.'
        );
      }

      const response = {
        requestId: pickup.requestId,
        status: pickup.status,
        statusLabel: this.getStatusLabel(pickup.status),
        date: pickup.preferredDate.toDate().toISOString(),
        timeSlot: pickup.timeSlot,
        timeSlotLabel: this.getTimeSlotLabel(pickup.timeSlot),
        address: pickup.pickupAddress.address,
        serviceTypes: pickup.serviceTypes,
        itemDescription: pickup.itemDescription,
        driverName: pickup.assignedDriverName,
        convertedOrderId: pickup.convertedOrderId,
      };

      let message = `Pickup ${pickupRequestId}: ${this.getStatusLabel(pickup.status)}`;
      if (pickup.assignedDriverName && ['assigned', 'in_transit'].includes(pickup.status)) {
        message += `\nDriver: ${pickup.assignedDriverName}`;
      }
      if (pickup.convertedOrderId) {
        message += `\nOrder ID: ${pickup.convertedOrderId}`;
      }

      return this.successResponse(requestId, response, message);
    } catch (error) {
      console.error('[LogisticsAgent] Get pickup status error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to get pickup status.'
      );
    }
  }

  /**
   * Cancel a pickup request
   */
  private async cancelPickup(
    requestId: string,
    pickupRequestId: string,
    reason: string | undefined,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const pickup = await getPickupRequest(pickupRequestId);

      // For customers, verify ownership
      if (auth.userType === 'customer' && pickup.customerId !== auth.customerId) {
        return this.errorResponse(
          requestId,
          'unauthorized',
          'You can only cancel your own pickup requests.'
        );
      }

      // Check if pickup can be cancelled
      if (['picked_up', 'at_facility', 'converted', 'cancelled'].includes(pickup.status)) {
        return this.errorResponse(
          requestId,
          'error',
          `Cannot cancel a pickup that is ${this.getStatusLabel(pickup.status).toLowerCase()}.`
        );
      }

      await cancelPickupRequest(pickupRequestId, reason);

      // TODO: Send cancellation WhatsApp message
      // await sendPickupCancellationMessage(pickup.customerPhone, pickupRequestId);

      return this.successResponse(
        requestId,
        { requestId: pickupRequestId, status: 'cancelled' },
        'Pickup request has been cancelled.'
      );
    } catch (error) {
      console.error('[LogisticsAgent] Cancel pickup error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to cancel pickup.'
      );
    }
  }

  /**
   * Get pending pickup requests (staff)
   */
  private async getPendingPickups(
    requestId: string,
    limitCount?: number
  ): Promise<AgentResponse> {
    try {
      const pickups = await getPendingPickupRequests(limitCount || 50);

      const formattedPickups = pickups.map((p) => ({
        requestId: p.requestId,
        customerName: p.customerName,
        customerPhone: p.customerPhone,
        date: p.preferredDate.toDate().toISOString(),
        timeSlot: p.timeSlot,
        timeSlotLabel: this.getTimeSlotLabel(p.timeSlot),
        status: p.status,
        statusLabel: this.getStatusLabel(p.status),
        serviceTypes: p.serviceTypes,
        address: p.pickupAddress.address,
        expressService: p.expressService,
      }));

      return this.successResponse(
        requestId,
        { pickups: formattedPickups },
        `${pickups.length} pending pickup request(s).`
      );
    } catch (error) {
      console.error('[LogisticsAgent] Get pending pickups error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to get pending pickups.'
      );
    }
  }

  /**
   * Confirm a pickup request
   */
  private async confirmPickup(
    requestId: string,
    pickupRequestId: string,
    confirmedTimeStr?: string
  ): Promise<AgentResponse> {
    try {
      const confirmedTime = confirmedTimeStr ? new Date(confirmedTimeStr) : undefined;

      await confirmPickupRequest(pickupRequestId, confirmedTime);

      // TODO: Send confirmation WhatsApp message to customer
      // const pickup = await getPickupRequest(pickupRequestId);
      // await sendPickupConfirmedMessage(pickup.customerPhone, pickupRequestId);

      return this.successResponse(
        requestId,
        { requestId: pickupRequestId, status: 'confirmed' },
        'Pickup request confirmed.'
      );
    } catch (error) {
      console.error('[LogisticsAgent] Confirm pickup error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to confirm pickup.'
      );
    }
  }

  /**
   * Assign a driver to a pickup
   */
  private async assignDriver(
    requestId: string,
    pickupRequestId: string,
    driverId: string,
    driverName: string,
    confirmedTimeStr?: string
  ): Promise<AgentResponse> {
    try {
      const confirmedTime = confirmedTimeStr ? new Date(confirmedTimeStr) : undefined;

      await assignDriverToPickup(pickupRequestId, driverId, driverName, confirmedTime);

      // TODO: Send WhatsApp notification to customer about driver assignment
      // const pickup = await getPickupRequest(pickupRequestId);
      // await sendDriverAssignedMessage(pickup.customerPhone, driverName);

      return this.successResponse(
        requestId,
        {
          requestId: pickupRequestId,
          status: 'assigned',
          driverId,
          driverName,
        },
        `Driver ${driverName} assigned to pickup ${pickupRequestId}.`
      );
    } catch (error) {
      console.error('[LogisticsAgent] Assign driver error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to assign driver.'
      );
    }
  }

  /**
   * Update pickup status
   */
  private async updateStatus(
    requestId: string,
    pickupRequestId: string,
    status: string
  ): Promise<AgentResponse> {
    try {
      const validStatuses = [
        'pending',
        'confirmed',
        'assigned',
        'in_transit',
        'picked_up',
        'at_facility',
        'converted',
        'cancelled',
      ];

      if (!validStatuses.includes(status)) {
        return this.errorResponse(requestId, 'error', 'Invalid status.');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updatePickupRequestStatus(pickupRequestId, status as any);

      return this.successResponse(
        requestId,
        { requestId: pickupRequestId, status },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `Pickup status updated to: ${this.getStatusLabel(status as any)}`
      );
    } catch (error) {
      console.error('[LogisticsAgent] Update status error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to update status.'
      );
    }
  }

  /**
   * Convert pickup to order
   */
  private async convertToOrder(
    requestId: string,
    pickupRequestId: string,
    orderId: string
  ): Promise<AgentResponse> {
    try {
      await convertPickupToOrder(pickupRequestId, orderId);

      return this.successResponse(
        requestId,
        {
          requestId: pickupRequestId,
          orderId,
          status: 'converted',
        },
        `Pickup ${pickupRequestId} converted to order ${orderId}.`
      );
    } catch (error) {
      console.error('[LogisticsAgent] Convert to order error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to convert to order.'
      );
    }
  }

  /**
   * Get driver's assigned pickups
   */
  private async getDriverPickups(
    requestId: string,
    auth: AgentAuth,
    dateStr?: string
  ): Promise<AgentResponse> {
    try {
      if (!auth.staffId) {
        return this.errorResponse(requestId, 'unauthorized', 'Driver ID not found.');
      }

      const date = dateStr ? new Date(dateStr) : undefined;
      const pickups = await getPickupRequestsByDriver(auth.staffId, date);

      const formattedPickups = pickups.map((p) => ({
        requestId: p.requestId,
        customerName: p.customerName,
        customerPhone: p.customerPhone,
        date: p.preferredDate.toDate().toISOString(),
        timeSlot: p.timeSlot,
        timeSlotLabel: this.getTimeSlotLabel(p.timeSlot),
        status: p.status,
        statusLabel: this.getStatusLabel(p.status),
        address: p.pickupAddress.address,
        coordinates: p.pickupAddress.coordinates,
        serviceTypes: p.serviceTypes,
        itemDescription: p.itemDescription,
        expressService: p.expressService,
      }));

      return this.successResponse(
        requestId,
        { pickups: formattedPickups },
        `You have ${pickups.length} assigned pickup(s)${date ? ` for ${this.formatDate(date)}` : ''}.`
      );
    } catch (error) {
      console.error('[LogisticsAgent] Get driver pickups error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to get assigned pickups.'
      );
    }
  }

  /**
   * Mark pickup as completed
   */
  private async markPickedUp(
    requestId: string,
    pickupRequestId: string
  ): Promise<AgentResponse> {
    try {
      await completePickup(pickupRequestId);

      // TODO: Send WhatsApp notification to customer
      // const pickup = await getPickupRequest(pickupRequestId);
      // await sendPickupCompleteMessage(pickup.customerPhone, pickupRequestId);

      return this.successResponse(
        requestId,
        { requestId: pickupRequestId, status: 'picked_up' },
        'Pickup marked as completed.'
      );
    } catch (error) {
      console.error('[LogisticsAgent] Mark picked up error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to update pickup status.'
      );
    }
  }

  /**
   * Mark pickup as arrived at facility
   */
  private async markAtFacility(
    requestId: string,
    pickupRequestId: string
  ): Promise<AgentResponse> {
    try {
      await markPickupAtFacility(pickupRequestId);

      return this.successResponse(
        requestId,
        { requestId: pickupRequestId, status: 'at_facility' },
        'Items have arrived at the facility.'
      );
    } catch (error) {
      console.error('[LogisticsAgent] Mark at facility error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to update status.'
      );
    }
  }

  /**
   * Get pickup request statistics
   */
  private async getStats(
    requestId: string,
    startDateStr: string,
    endDateStr: string
  ): Promise<AgentResponse> {
    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return this.errorResponse(requestId, 'error', 'Invalid date format.');
      }

      const stats = await getPickupRequestStats(startDate, endDate);

      return this.successResponse(
        requestId,
        stats,
        `Pickup statistics from ${this.formatDate(startDate)} to ${this.formatDate(endDate)}:\n` +
          `Total: ${stats.total}, Pending: ${stats.pending}, Completed: ${stats.completed}, Converted: ${stats.converted}`
      );
    } catch (error) {
      console.error('[LogisticsAgent] Get stats error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to get statistics.'
      );
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get time slot label
   */
  private getTimeSlotLabel(slot: TimeSlot): string {
    const labels: Record<TimeSlot, string> = {
      morning: 'Morning (8:00 AM - 12:00 PM)',
      afternoon: 'Afternoon (12:00 PM - 4:00 PM)',
      evening: 'Evening (4:00 PM - 7:00 PM)',
    };
    return labels[slot] || slot;
  }

  /**
   * Get status label
   */
  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pending Confirmation',
      confirmed: 'Confirmed',
      assigned: 'Driver Assigned',
      in_transit: 'Driver En Route',
      picked_up: 'Picked Up',
      at_facility: 'At Facility',
      converted: 'Order Created',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  }
}

// Export singleton instance
export const logisticsAgent = new LogisticsAgent();
