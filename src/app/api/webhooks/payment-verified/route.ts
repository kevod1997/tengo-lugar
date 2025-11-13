import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest';
import { z } from 'zod';

const paymentVerifiedWebhookSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID es requerido'),
  amount: z.number().positive('El monto debe ser positivo'),
  senderName: z.string().min(1, 'Nombre del remitente es requerido'),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Validate webhook secret for security
    const webhookSecret = request.headers.get('X-Webhook-Secret');

    if (!webhookSecret || webhookSecret !== process.env.PAYMENT_WEBHOOK_SECRET) {
      console.error('[Webhook] Unauthorized attempt to access payment-verified webhook');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validatedData = paymentVerifiedWebhookSchema.parse(body);

    console.log('[Webhook] Payment verified webhook received:', {
      paymentId: validatedData.paymentId,
      amount: validatedData.amount,
      senderName: validatedData.senderName,
    });

    // 3. Trigger Inngest background job for notifications
    await inngest.send({
      name: 'payment-verified-notification',
      data: {
        paymentId: validatedData.paymentId,
        amount: validatedData.amount,
        senderName: validatedData.senderName,
      }
    });

    console.log('[Webhook] Payment verification notification job queued successfully');

    // 4. Return quick response (don't block the external server)
    return NextResponse.json({
      success: true,
      message: 'Notification job queued successfully',
      paymentId: validatedData.paymentId,
    });

  } catch (error) {
    console.error('[Webhook] Error processing payment-verified webhook:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
