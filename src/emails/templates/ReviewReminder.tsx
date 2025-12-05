import {
  Section,
  Text,
  Heading,
} from '@react-email/components';

import { EmailButton } from '../components/EmailButton';
import { EmailFooter } from '../components/EmailFooter';
import { EmailHeader } from '../components/EmailHeader';
import { EmailLayout } from '../components/EmailLayout';

interface ReviewReminderProps {
  userName: string;
  reviewUrl: string;
  tripOrigin: string;
  tripDestination: string;
  departureDate: string;
  reviewType: 'driver' | 'passenger';
}

export default function ReviewReminder({
  userName = 'Usuario',
  reviewUrl = 'https://tengolugar.store/trips/123',
  tripOrigin = 'Buenos Aires',
  tripDestination = 'Mar del Plata',
  departureDate = '15 de noviembre',
  reviewType = 'driver',
}: ReviewReminderProps) {
  const isDriverReview = reviewType === 'driver';

  return (
    <EmailLayout preview={`¡Califica tu viaje de ${tripOrigin} a ${tripDestination}!`}>
      <EmailHeader />

      {/* Icon Section */}
      <Section style={iconSection}>
        <div style={iconStyle}>⭐</div>
      </Section>

      {/* Main Content */}
      <Section style={contentSection}>
        <Heading style={heading}>
          ¡Hola {userName}!
        </Heading>

        <Text style={subheading}>
          {isDriverReview
            ? '¿Cómo fue tu experiencia con el conductor?'
            : '¿Cómo fue tu experiencia con los pasajeros?'}
        </Text>

        <Text style={description}>
          Tu viaje de <strong>{tripOrigin}</strong> a <strong>{tripDestination}</strong> del{' '}
          {departureDate} ha finalizado.
        </Text>

        <Text style={description}>
          Tu opinión es muy importante para nosotros y para la comunidad de Tengo Lugar.{' '}
          {isDriverReview
            ? 'Ayuda a otros pasajeros compartiendo tu experiencia con el conductor.'
            : 'Ayuda a otros conductores compartiendo tu experiencia con los pasajeros.'}
        </Text>

        <Text style={description}>
          Tienes <strong>10 días</strong> para dejar tu calificación.
        </Text>
      </Section>

      {/* CTA Section */}
      <Section style={ctaSection}>
        <EmailButton href={reviewUrl}>
          Calificar Ahora
        </EmailButton>
      </Section>

      {/* Additional Info */}
      <Section style={infoSection}>
        <Text style={infoText}>
          Tu calificación es pública y ayuda a construir confianza en la plataforma.
        </Text>
      </Section>

      <EmailFooter />
    </EmailLayout>
  );
}

// Styles
const iconSection = {
  textAlign: 'center' as const,
  padding: '40px 20px 20px',
};

const iconStyle = {
  display: 'inline-block',
  fontSize: '64px',
  lineHeight: '1',
};

const contentSection = {
  padding: '0 40px 30px',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  marginBottom: '16px',
  textAlign: 'center' as const,
};

const subheading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#4a4a4a',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const description = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#666666',
  marginBottom: '16px',
  textAlign: 'center' as const,
};

const ctaSection = {
  textAlign: 'center' as const,
  padding: '0 40px 30px',
};

const infoSection = {
  padding: '0 40px 40px',
  borderTop: '1px solid #e5e5e5',
  marginTop: '20px',
};

const infoText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#999999',
  textAlign: 'center' as const,
  marginTop: '20px',
};
