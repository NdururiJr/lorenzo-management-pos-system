/**
 * Admin Config API - Single Assignment
 *
 * DELETE /api/admin/config/assignments/[assignmentId] - Delete assignment
 *
 * @module app/api/admin/config/assignments/[assignmentId]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteModelAssignment } from '@/lib/db/config';
import { invalidateConfigCache } from '@/lib/config';

interface RouteParams {
  params: Promise<{
    assignmentId: string;
  }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { assignmentId } = await params;

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    await deleteModelAssignment(assignmentId);
    invalidateConfigCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    );
  }
}
