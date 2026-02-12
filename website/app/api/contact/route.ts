/**
 * Contact API Route
 *
 * Handles contact form submissions.
 * Validates data and processes the contact request.
 *
 * @module app/api/contact/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { getFirestoreInstance } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Lazy initialization of Resend (only when API key is available)
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

// Wati.io configuration
const watiConfig = {
  apiEndpoint: process.env.WATI_API_ENDPOINT || 'https://live-server-123456.wati.io',
  accessToken: process.env.WATI_ACCESS_TOKEN,
};

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
  try {
    // Parse request body
    const body = await request.json();

    // Validate data
    const validatedData = contactSchema.parse(body);

    // 1. Store in Firestore database (critical - must succeed)
    const db = getFirestoreInstance();
    if (!db) {
      throw new Error('Firebase Firestore is not initialized');
    }

    const contactDoc = await addDoc(collection(db, 'contacts'), {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone || null,
      subject: validatedData.subject,
      message: validatedData.message,
      status: 'new',
      createdAt: serverTimestamp(),
      processedAt: null,
    });

    console.log('Contact saved to Firestore:', contactDoc.id);

    // 2. Send emails via Resend (important but not critical)
    const resend = getResendClient();
    if (resend) {
      try {
        // Admin notification email
        await resend.emails.send({
        from: 'noreply@lorenzodrycleaners.co.ke',
        to: 'info@lorenzodrycleaners.co.ke', // Update with actual admin email
        subject: `New Contact Form: ${validatedData.subject}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #0A2F2C; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; margin: 0; }
                .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 4px; }
                .label { font-weight: bold; color: #0A2F2C; display: block; margin-bottom: 5px; }
                .value { color: #555; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>🔔 New Contact Form Submission</h2>
                </div>
                <div class="content">
                  <div class="field">
                    <span class="label">Name:</span>
                    <span class="value">${validatedData.name}</span>
                  </div>
                  <div class="field">
                    <span class="label">Email:</span>
                    <span class="value">${validatedData.email}</span>
                  </div>
                  <div class="field">
                    <span class="label">Phone:</span>
                    <span class="value">${validatedData.phone || 'Not provided'}</span>
                  </div>
                  <div class="field">
                    <span class="label">Subject:</span>
                    <span class="value">${validatedData.subject}</span>
                  </div>
                  <div class="field">
                    <span class="label">Message:</span>
                    <div class="value" style="white-space: pre-wrap;">${validatedData.message}</div>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      });

        console.log('Admin email sent successfully');

        // Customer confirmation email
        await resend.emails.send({
        from: 'noreply@lorenzodrycleaners.co.ke',
        to: validatedData.email,
        subject: 'Thank you for contacting Lorenzo Dry Cleaners',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #0A2F2C; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; }
                .message-box { background: white; padding: 15px; border-left: 4px solid #2DD4BF; margin: 15px 0; border-radius: 4px; }
                .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>✅ We received your message!</h2>
                </div>
                <div class="content">
                  <p>Hi ${validatedData.name},</p>
                  <p>Thank you for reaching out to Lorenzo Dry Cleaners. Our team will respond to your inquiry within 24 hours.</p>
                  <p><strong>Your message:</strong></p>
                  <div class="message-box">
                    <div style="white-space: pre-wrap;">${validatedData.message}</div>
                  </div>
                  <p>If you have any urgent questions, please feel free to call us at <strong>+254 728 400200</strong>.</p>
                </div>
                <div class="footer">
                  <p><strong>Lorenzo Dry Cleaners</strong></p>
                  <p>Kilimani, Nairobi, Kenya</p>
                  <p>Phone: +254 728 400200 | Email: info@lorenzodrycleaners.co.ke</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

        console.log('Customer confirmation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send emails:', emailError);
        // Don't fail the entire request if emails fail
        // Contact is already saved to Firestore
      }
    } else {
      console.log('Resend email service not configured (RESEND_API_KEY missing)');
    }

    // 3. Send WhatsApp notification via Wati.io (optional enhancement)
    if (watiConfig.accessToken) {
      try {
        const whatsappResponse = await fetch(
          `${watiConfig.apiEndpoint}/api/v1/sendSessionMessage`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${watiConfig.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              whatsappNumber: '+254728400200', // Admin phone number
              message: `🔔 *New Contact Form Submission*\n\n*Name:* ${validatedData.name}\n*Email:* ${validatedData.email}\n*Phone:* ${validatedData.phone || 'Not provided'}\n*Subject:* ${validatedData.subject}\n\n*Message:*\n${validatedData.message}`,
            }),
          }
        );

        if (whatsappResponse.ok) {
          console.log('WhatsApp notification sent successfully');
        } else {
          console.error('WhatsApp API error:', await whatsappResponse.text());
        }
      } catch (whatsappError) {
        console.error('Failed to send WhatsApp notification:', whatsappError);
        // Don't fail the request if WhatsApp fails
      }
    } else {
      console.log('WhatsApp integration not configured (WATI_ACCESS_TOKEN missing)');
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Message received successfully. We will get back to you within 24 hours.',
        id: contactDoc.id,
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
