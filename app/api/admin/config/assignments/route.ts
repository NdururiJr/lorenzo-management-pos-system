/**
 * Admin Config API - Model Assignments
 *
 * GET /api/admin/config/assignments - Get all model assignments
 * POST /api/admin/config/assignments - Create new assignment
 * PATCH /api/admin/config/assignments - Update existing assignment
 *
 * @module app/api/admin/config/assignments/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllModelAssignments, setModelAssignment, updateModelAssignment } from '@/lib/db/config';
import { invalidateConfigCache } from '@/lib/config';
import type { LLMAgentType, AgentFunction, LLMProvider } from '@/lib/db/schema';

export async function GET() {
  try {
    const assignments = await getAllModelAssignments();
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.agentType || !data.agentFunction || !data.provider || !data.model) {
      return NextResponse.json(
        { error: 'Missing required fields: agentType, agentFunction, provider, model' },
        { status: 400 }
      );
    }

    // TODO: Get actual user ID from session
    const updatedBy = 'admin';

    const assignmentId = await setModelAssignment(
      {
        agentType: data.agentType as LLMAgentType | '*',
        agentFunction: data.agentFunction as AgentFunction | '*',
        provider: data.provider as LLMProvider,
        model: data.model,
        priority: data.priority ?? 50,
        enabled: data.enabled ?? true,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        updatedBy,
      },
      updatedBy
    );

    invalidateConfigCache();

    return NextResponse.json({ success: true, assignmentId });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    // TODO: Get actual user ID from session
    const updatedBy = 'admin';

    // Remove non-updatable fields
    const { assignmentId, ...updates } = data;

    await updateModelAssignment(assignmentId, updates, updatedBy);
    invalidateConfigCache();

    const assignments = await getAllModelAssignments();
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}
