/**
 * Delivery Notes Database Operations
 *
 * V2.0: Delivery notes for tailor transfers and inter-store transfers.
 * Tracks items sent for external processing or between branches.
 *
 * @module lib/db/delivery-notes
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  DatabaseError,
} from './index';

/**
 * Delivery note type
 */
export type DeliveryNoteType = 'tailor_transfer' | 'inter_store_transfer' | 'external_service';

/**
 * Delivery note status
 */
export type DeliveryNoteStatus = 'draft' | 'sent' | 'in_transit' | 'received' | 'returned' | 'cancelled';

/**
 * Item included in a delivery note
 */
export interface DeliveryNoteItem {
  /** Reference to order */
  orderId: string;
  /** Order display ID */
  orderDisplayId?: string;
  /** Reference to garment */
  garmentId: string;
  /** Garment type (denormalized) */
  garmentType: string;
  /** Garment color */
  garmentColor: string;
  /** Customer name (denormalized) */
  customerName?: string;
  /** Service requested (e.g., "Alteration", "Special Clean") */
  serviceRequested: string;
  /** Special instructions */
  specialInstructions?: string;
  /** Whether item was received back */
  isReturned?: boolean;
  /** Notes on returned condition */
  returnNotes?: string;
  /** Timestamp when returned */
  returnedAt?: Timestamp;
}

/**
 * Delivery note audit entry
 */
export interface DeliveryNoteAuditEntry {
  /** Status at this point */
  status: DeliveryNoteStatus;
  /** When this status was set */
  timestamp: Timestamp;
  /** User who made the change */
  userId: string;
  /** User name */
  userName: string;
  /** Notes */
  notes?: string;
}

/**
 * Delivery note document structure
 */
export interface DeliveryNote {
  /** Unique note ID */
  noteId: string;
  /** Note number (human-readable) */
  noteNumber: string;
  /** Type of delivery note */
  noteType: DeliveryNoteType;
  /** Source location (branch ID or special location) */
  fromLocation: string;
  /** Source location name (denormalized) */
  fromLocationName: string;
  /** Destination location (tailor name, branch ID, etc.) */
  toLocation: string;
  /** Destination location name/address */
  toLocationName: string;
  /** Destination contact phone */
  toContactPhone?: string;
  /** Items included in this delivery */
  items: DeliveryNoteItem[];
  /** Total number of items */
  itemCount: number;
  /** Current status */
  status: DeliveryNoteStatus;
  /** Date items were sent */
  dateSent?: Timestamp;
  /** Expected return date (for tailor transfers) */
  expectedReturnDate?: Timestamp;
  /** Actual return date */
  actualReturnDate?: Timestamp;
  /** User who authorized the transfer */
  authorizedBy: string;
  /** Authorizer name */
  authorizedByName: string;
  /** User who dispatched the items */
  dispatchedBy?: string;
  /** Dispatcher name */
  dispatchedByName?: string;
  /** User who received at destination */
  receivedBy?: string;
  /** Receiver name */
  receivedByName?: string;
  /** Notes for the delivery */
  notes?: string;
  /** Driver assigned (if applicable) */
  driverId?: string;
  /** Driver name */
  driverName?: string;
  /** Audit trail */
  auditTrail: DeliveryNoteAuditEntry[];
  /** Created timestamp */
  createdAt: Timestamp;
  /** Updated timestamp */
  updatedAt: Timestamp;
}

/**
 * Generate note ID
 */
export function generateNoteId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `DN-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate note number
 */
export function generateNoteNumber(noteType: DeliveryNoteType): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  const prefix = noteType === 'tailor_transfer' ? 'TLR' :
    noteType === 'inter_store_transfer' ? 'IST' : 'EXT';

  return `${prefix}-${dateStr}-${random}`;
}

/**
 * Create a new delivery note
 */
export async function createDeliveryNote(data: {
  noteType: DeliveryNoteType;
  fromLocation: string;
  fromLocationName: string;
  toLocation: string;
  toLocationName: string;
  toContactPhone?: string;
  items: DeliveryNoteItem[];
  authorizedBy: string;
  authorizedByName: string;
  expectedReturnDate?: Date;
  notes?: string;
}): Promise<{ noteId: string; noteNumber: string }> {
  try {
    const noteId = generateNoteId();
    const noteNumber = generateNoteNumber(data.noteType);

    const auditEntry: DeliveryNoteAuditEntry = {
      status: 'draft',
      timestamp: Timestamp.now(),
      userId: data.authorizedBy,
      userName: data.authorizedByName,
      notes: 'Delivery note created',
    };

    const note: DeliveryNote = {
      noteId,
      noteNumber,
      noteType: data.noteType,
      fromLocation: data.fromLocation,
      fromLocationName: data.fromLocationName,
      toLocation: data.toLocation,
      toLocationName: data.toLocationName,
      toContactPhone: data.toContactPhone,
      items: data.items,
      itemCount: data.items.length,
      status: 'draft',
      expectedReturnDate: data.expectedReturnDate
        ? Timestamp.fromDate(data.expectedReturnDate)
        : undefined,
      authorizedBy: data.authorizedBy,
      authorizedByName: data.authorizedByName,
      notes: data.notes,
      auditTrail: [auditEntry],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDocument('deliveryNotes', noteId, note);

    return { noteId, noteNumber };
  } catch (error) {
    throw new DatabaseError('Failed to create delivery note', error);
  }
}

/**
 * Dispatch items (mark as sent)
 */
export async function dispatchDeliveryNote(
  noteId: string,
  dispatchedBy: string,
  dispatchedByName: string,
  driverId?: string,
  driverName?: string,
  notes?: string
): Promise<void> {
  try {
    const note = await getDocument<DeliveryNote>('deliveryNotes', noteId);
    if (!note) {
      throw new Error('Delivery note not found');
    }

    if (note.status !== 'draft') {
      throw new Error('Delivery note must be in draft status to dispatch');
    }

    const auditEntry: DeliveryNoteAuditEntry = {
      status: 'sent',
      timestamp: Timestamp.now(),
      userId: dispatchedBy,
      userName: dispatchedByName,
      notes: notes || 'Items dispatched',
    };

    await updateDocument('deliveryNotes', noteId, {
      status: 'sent' as DeliveryNoteStatus,
      dateSent: Timestamp.now(),
      dispatchedBy,
      dispatchedByName,
      driverId,
      driverName,
      auditTrail: [...note.auditTrail, auditEntry],
      updatedAt: Timestamp.now(),
    });

    // Update related orders/garments status
    for (const item of note.items) {
      await updateDocument('orders', item.orderId, {
        [`garments.${item.garmentId}.externalTransferStatus`]: 'sent',
        [`garments.${item.garmentId}.externalTransferNoteId`]: noteId,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    throw new DatabaseError('Failed to dispatch delivery note', error);
  }
}

/**
 * Mark items as in transit
 */
export async function markInTransit(
  noteId: string,
  userId: string,
  userName: string,
  notes?: string
): Promise<void> {
  try {
    const note = await getDocument<DeliveryNote>('deliveryNotes', noteId);
    if (!note) {
      throw new Error('Delivery note not found');
    }

    if (note.status !== 'sent') {
      throw new Error('Delivery note must be in sent status');
    }

    const auditEntry: DeliveryNoteAuditEntry = {
      status: 'in_transit',
      timestamp: Timestamp.now(),
      userId,
      userName,
      notes: notes || 'Items in transit',
    };

    await updateDocument('deliveryNotes', noteId, {
      status: 'in_transit' as DeliveryNoteStatus,
      auditTrail: [...note.auditTrail, auditEntry],
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new DatabaseError('Failed to mark delivery note as in transit', error);
  }
}

/**
 * Mark items as received at destination
 */
export async function receiveDeliveryNote(
  noteId: string,
  receivedBy: string,
  receivedByName: string,
  notes?: string
): Promise<void> {
  try {
    const note = await getDocument<DeliveryNote>('deliveryNotes', noteId);
    if (!note) {
      throw new Error('Delivery note not found');
    }

    if (!['sent', 'in_transit'].includes(note.status)) {
      throw new Error('Delivery note must be in sent or in_transit status');
    }

    const auditEntry: DeliveryNoteAuditEntry = {
      status: 'received',
      timestamp: Timestamp.now(),
      userId: receivedBy,
      userName: receivedByName,
      notes: notes || 'Items received at destination',
    };

    await updateDocument('deliveryNotes', noteId, {
      status: 'received' as DeliveryNoteStatus,
      receivedBy,
      receivedByName,
      auditTrail: [...note.auditTrail, auditEntry],
      updatedAt: Timestamp.now(),
    });

    // Update related orders/garments status
    for (const item of note.items) {
      await updateDocument('orders', item.orderId, {
        [`garments.${item.garmentId}.externalTransferStatus`]: 'received',
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    throw new DatabaseError('Failed to receive delivery note', error);
  }
}

/**
 * Mark item as returned (for tailor transfers)
 */
export async function returnDeliveryNoteItem(
  noteId: string,
  garmentId: string,
  returnedBy: string,
  returnedByName: string,
  returnNotes?: string
): Promise<void> {
  try {
    const note = await getDocument<DeliveryNote>('deliveryNotes', noteId);
    if (!note) {
      throw new Error('Delivery note not found');
    }

    if (note.status !== 'received') {
      throw new Error('Delivery note must be in received status');
    }

    // Update the specific item
    const updatedItems = note.items.map(item => {
      if (item.garmentId === garmentId) {
        return {
          ...item,
          isReturned: true,
          returnNotes,
          returnedAt: Timestamp.now(),
        };
      }
      return item;
    });

    // Check if all items are returned
    const allReturned = updatedItems.every(item => item.isReturned);

    const auditEntry: DeliveryNoteAuditEntry = {
      status: allReturned ? 'returned' : 'received',
      timestamp: Timestamp.now(),
      userId: returnedBy,
      userName: returnedByName,
      notes: `Item ${garmentId} returned${returnNotes ? `: ${returnNotes}` : ''}`,
    };

    const updateData: Partial<DeliveryNote> = {
      items: updatedItems,
      auditTrail: [...note.auditTrail, auditEntry],
      updatedAt: Timestamp.now(),
    };

    if (allReturned) {
      updateData.status = 'returned';
      updateData.actualReturnDate = Timestamp.now();
    }

    await updateDocument('deliveryNotes', noteId, updateData);

    // Update order/garment status
    const item = note.items.find(i => i.garmentId === garmentId);
    if (item) {
      await updateDocument('orders', item.orderId, {
        [`garments.${garmentId}.externalTransferStatus`]: 'returned',
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    throw new DatabaseError('Failed to return delivery note item', error);
  }
}

/**
 * Mark all items as returned
 */
export async function returnDeliveryNote(
  noteId: string,
  returnedBy: string,
  returnedByName: string,
  notes?: string
): Promise<void> {
  try {
    const note = await getDocument<DeliveryNote>('deliveryNotes', noteId);
    if (!note) {
      throw new Error('Delivery note not found');
    }

    if (note.status !== 'received') {
      throw new Error('Delivery note must be in received status');
    }

    // Mark all items as returned
    const updatedItems = note.items.map(item => ({
      ...item,
      isReturned: true,
      returnedAt: Timestamp.now(),
    }));

    const auditEntry: DeliveryNoteAuditEntry = {
      status: 'returned',
      timestamp: Timestamp.now(),
      userId: returnedBy,
      userName: returnedByName,
      notes: notes || 'All items returned',
    };

    await updateDocument('deliveryNotes', noteId, {
      status: 'returned' as DeliveryNoteStatus,
      actualReturnDate: Timestamp.now(),
      items: updatedItems,
      auditTrail: [...note.auditTrail, auditEntry],
      updatedAt: Timestamp.now(),
    });

    // Update related orders/garments status
    for (const item of note.items) {
      await updateDocument('orders', item.orderId, {
        [`garments.${item.garmentId}.externalTransferStatus`]: 'returned',
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    throw new DatabaseError('Failed to return delivery note', error);
  }
}

/**
 * Cancel delivery note
 */
export async function cancelDeliveryNote(
  noteId: string,
  cancelledBy: string,
  cancelledByName: string,
  reason: string
): Promise<void> {
  try {
    const note = await getDocument<DeliveryNote>('deliveryNotes', noteId);
    if (!note) {
      throw new Error('Delivery note not found');
    }

    if (!['draft', 'sent'].includes(note.status)) {
      throw new Error('Can only cancel draft or sent delivery notes');
    }

    const auditEntry: DeliveryNoteAuditEntry = {
      status: 'cancelled',
      timestamp: Timestamp.now(),
      userId: cancelledBy,
      userName: cancelledByName,
      notes: reason,
    };

    await updateDocument('deliveryNotes', noteId, {
      status: 'cancelled' as DeliveryNoteStatus,
      auditTrail: [...note.auditTrail, auditEntry],
      updatedAt: Timestamp.now(),
    });

    // Clear external transfer status on orders
    for (const item of note.items) {
      await updateDocument('orders', item.orderId, {
        [`garments.${item.garmentId}.externalTransferStatus`]: null,
        [`garments.${item.garmentId}.externalTransferNoteId`]: null,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    throw new DatabaseError('Failed to cancel delivery note', error);
  }
}

/**
 * Get delivery note by ID
 */
export async function getDeliveryNoteById(noteId: string): Promise<DeliveryNote | null> {
  try {
    return await getDocument<DeliveryNote>('deliveryNotes', noteId);
  } catch (error) {
    throw new DatabaseError('Failed to get delivery note', error);
  }
}

/**
 * Get delivery note by number
 */
export async function getDeliveryNoteByNumber(noteNumber: string): Promise<DeliveryNote | null> {
  try {
    const notes = await getDocuments<DeliveryNote>(
      'deliveryNotes',
      where('noteNumber', '==', noteNumber),
      limit(1)
    );
    return notes.length > 0 ? notes[0] : null;
  } catch (error) {
    throw new DatabaseError('Failed to get delivery note by number', error);
  }
}

/**
 * Get delivery notes for a branch
 */
export async function getBranchDeliveryNotes(
  branchId: string,
  options?: {
    direction?: 'outgoing' | 'incoming' | 'both';
    noteType?: DeliveryNoteType;
    status?: DeliveryNoteStatus;
    maxResults?: number;
  }
): Promise<DeliveryNote[]> {
  try {
    const direction = options?.direction || 'both';

    if (direction === 'both') {
      // Query both directions
      const [outgoing, incoming] = await Promise.all([
        getDocuments<DeliveryNote>(
          'deliveryNotes',
          where('fromLocation', '==', branchId),
          ...(options?.noteType ? [where('noteType', '==', options.noteType)] : []),
          ...(options?.status ? [where('status', '==', options.status)] : []),
          orderBy('createdAt', 'desc'),
          limit(options?.maxResults || 50)
        ),
        getDocuments<DeliveryNote>(
          'deliveryNotes',
          where('toLocation', '==', branchId),
          ...(options?.noteType ? [where('noteType', '==', options.noteType)] : []),
          ...(options?.status ? [where('status', '==', options.status)] : []),
          orderBy('createdAt', 'desc'),
          limit(options?.maxResults || 50)
        ),
      ]);

      // Merge and sort
      const combined = [...outgoing, ...incoming];
      combined.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      return combined.slice(0, options?.maxResults || 100);
    }

    const locationField = direction === 'outgoing' ? 'fromLocation' : 'toLocation';

    return getDocuments<DeliveryNote>(
      'deliveryNotes',
      where(locationField, '==', branchId),
      ...(options?.noteType ? [where('noteType', '==', options.noteType)] : []),
      ...(options?.status ? [where('status', '==', options.status)] : []),
      orderBy('createdAt', 'desc'),
      limit(options?.maxResults || 50)
    );
  } catch (error) {
    throw new DatabaseError('Failed to get branch delivery notes', error);
  }
}

/**
 * Get pending returns (overdue tailor transfers)
 */
export async function getPendingReturns(branchId?: string): Promise<DeliveryNote[]> {
  try {
    const now = Timestamp.now();

    const constraints = [
      where('noteType', '==', 'tailor_transfer'),
      where('status', '==', 'received'),
      where('expectedReturnDate', '<', now),
      orderBy('expectedReturnDate', 'asc'),
    ];

    if (branchId) {
      constraints.push(where('fromLocation', '==', branchId));
    }

    return getDocuments<DeliveryNote>('deliveryNotes', ...constraints);
  } catch (error) {
    throw new DatabaseError('Failed to get pending returns', error);
  }
}

/**
 * Get delivery notes for an order
 */
export async function getOrderDeliveryNotes(orderId: string): Promise<DeliveryNote[]> {
  try {
    // We need to find delivery notes that contain items with this orderId
    // This requires reading all notes and filtering (or using array-contains)
    const allNotes = await getDocuments<DeliveryNote>(
      'deliveryNotes',
      orderBy('createdAt', 'desc'),
      limit(500)
    );

    return allNotes.filter(note =>
      note.items.some(item => item.orderId === orderId)
    );
  } catch (error) {
    throw new DatabaseError('Failed to get order delivery notes', error);
  }
}

/**
 * Get delivery note statistics
 */
export async function getDeliveryNoteStats(
  branchId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  total: number;
  byType: Record<DeliveryNoteType, number>;
  byStatus: Record<DeliveryNoteStatus, number>;
  overdueReturns: number;
  avgReturnTime: number;
}> {
  try {
    const constraints = [];

    if (branchId) {
      constraints.push(where('fromLocation', '==', branchId));
    }

    if (startDate) {
      constraints.push(where('createdAt', '>=', Timestamp.fromDate(startDate)));
    }

    if (endDate) {
      constraints.push(where('createdAt', '<=', Timestamp.fromDate(endDate)));
    }

    const notes = await getDocuments<DeliveryNote>('deliveryNotes', ...constraints);

    const stats = {
      total: notes.length,
      byType: {
        tailor_transfer: 0,
        inter_store_transfer: 0,
        external_service: 0,
      } as Record<DeliveryNoteType, number>,
      byStatus: {
        draft: 0,
        sent: 0,
        in_transit: 0,
        received: 0,
        returned: 0,
        cancelled: 0,
      } as Record<DeliveryNoteStatus, number>,
      overdueReturns: 0,
      avgReturnTime: 0,
    };

    const now = new Date();
    let totalReturnTime = 0;
    let returnedCount = 0;

    for (const note of notes) {
      stats.byType[note.noteType]++;
      stats.byStatus[note.status]++;

      // Check overdue
      if (
        note.noteType === 'tailor_transfer' &&
        note.status === 'received' &&
        note.expectedReturnDate &&
        note.expectedReturnDate.toDate() < now
      ) {
        stats.overdueReturns++;
      }

      // Calculate return time
      if (note.status === 'returned' && note.dateSent && note.actualReturnDate) {
        const returnTime = note.actualReturnDate.toDate().getTime() - note.dateSent.toDate().getTime();
        totalReturnTime += returnTime;
        returnedCount++;
      }
    }

    // Calculate average return time in days
    if (returnedCount > 0) {
      stats.avgReturnTime = Math.round(totalReturnTime / returnedCount / (1000 * 60 * 60 * 24));
    }

    return stats;
  } catch (error) {
    throw new DatabaseError('Failed to get delivery note stats', error);
  }
}
