import { SendDocumentVerificationEmailParams } from '@/services/email/email-service';
import { Inngest } from 'inngest';
import { EventSchemas } from 'inngest';

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
};

export const inngest = new Inngest({
    id: 'tengo-lugar',
    schemas: new EventSchemas().fromRecord<Events>(),
    baseUrl: process.env.NODE_ENV === 'development'
        ? 'http://localhost:8288'
        : process.env.INNGEST_BASE_URL
});