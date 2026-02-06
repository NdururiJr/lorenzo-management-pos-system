/**
 * Contact API Route
 *
 * Handles contact form submissions.
 * Validates data and processes the contact request.
 * Rate limited to prevent spam.
 *
 * @module app/api/contact/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/api/rate-limit';

// Validation schema (matches the frontend)
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^\+254\d{9}$/, 'Phone must be in format +254XXXXXXXXX')
    .optional()
    .or(z.literal('')),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  // Apply rate limiting (3 requests per hour to prevent spam)
  const rateLimitResponse = rateLimit(request, 'contact');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Parse request body
    const body = await request.json();

    // Validate data
    const validatedData = contactSchema.parse(body);

    // TODO: In production, you would:
    // 1. Store in Firestore database
    // 2. Send email notification to admin via Resend
    // 3. Send confirmation email to customer
    // 4. Add to WhatsApp notification queue via Wati.io

    // For now, log the submission
    console.log('Contact form submission:', {
      timestamp: new Date().toISOString(),
      data: validatedData,
    });

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Message received successfully. We will get back to you within 24 hours.',
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while processing your request. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}
