import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';

// Explicitly declare runtime as Node.js
export const runtime = 'nodejs';

// Webhook payload validation schema
const webhookPayloadSchema = z.object({
  event: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

// Idempotency cache (in production, use Redis)
const processedIds = new Set<string>();

/**
 * Check if a webhook has already been processed (idempotency)
 */
function isIdempotent(idempotencyKey: string): boolean {
  if (processedIds.has(idempotencyKey)) {
    return true;
  }
  processedIds.add(idempotencyKey);
  
  // Clean up old entries (keep only last 1000)
  if (processedIds.size > 1000) {
    const firstKey = processedIds.values().next().value;
    if (firstKey) {
      processedIds.delete(firstKey);
    }
  }
  
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Get idempotency key from header
    const idempotencyKey = req.headers.get('x-idempotency-key') || 
                           req.headers.get('x-webhook-delivery');
    
    // Check if already processed
    if (idempotencyKey && isIdempotent(idempotencyKey)) {
      return NextResponse.json({
        success: true,
        idempotent: true,
        message: 'Webhook already processed',
      });
    }
    
    const signature = req.headers.get('x-webhook-signature');
    const event = req.headers.get('x-webhook-event');
    const deliveryId = req.headers.get('x-webhook-delivery');
    
    // Validate request body
    const payload = await req.json();
    const validation = webhookPayloadSchema.safeParse(payload);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid payload',
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }
    
    // Verify signature if secret is configured
    const secret = process.env.WEBHOOK_SECRET;
    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }
    
    // Process webhook payload
    console.log('Webhook received:', {
      event,
      deliveryId,
      payload,
    });
    
    // Add your webhook processing logic here
    // For example: update database, trigger actions, etc.
    
    return NextResponse.json({
      success: true,
      received: true,
      event,
      deliveryId,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Matjenin Webhook Callback',
    domain: 'https://matjenin.space',
    status: 'active',
  });
}
