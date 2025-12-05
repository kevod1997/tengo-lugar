import { Inngest } from 'inngest';
import { EventSchemas } from 'inngest';

import type { SendDocumentVerificationEmailParams } from '@/services/email/email-service';

export type Events = {
    'document-verification-email': {
        data: SendDocumentVerificationEmailParams
    };
    'complete-expired-trips': {
        data: Record<string, never>
    };
    'reject-pending-reservations': {
        data: Record<string, never>
    };
    'send-review-reminder': {
        data: {
            userId: string;
            userName: string;
            userEmail: string;
            tripId: string;
            tripOrigin: string;
            tripDestination: string;
            departureDate: string;
            reviewType: 'DRIVER' | 'PASSENGER';
            revieweeId: string;
            revieweeName: string;
        }
    };
    'review-received-notification': {
        data: {
            userId: string;
            userName: string;
            userEmail: string;
            reviewerName: string;
            rating: number;
            tripId: string;
        }
    };
    'payment-verified-notification': {
        data: {
            paymentId: string;
            amount: number;
            senderName: string;
        }
    };
};

export const inngest = new Inngest({
    id: 'tengo-lugar',
    schemas: new EventSchemas().fromRecord<Events>(),
    baseUrl: process.env.NODE_ENV === 'development'
        ? 'http://localhost:8288'
        : process.env.INNGEST_BASE_URL
});