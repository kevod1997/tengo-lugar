import {
  Section,
  Text,
  Heading,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeader } from '../components/EmailHeader';
import { EmailFooter } from '../components/EmailFooter';
import { EmailButton } from '../components/EmailButton';

interface PaymentVerifiedDriverProps {
  driverName: string;
  passengerName: string;
  amount: number;
  tripOrigin: string;
  tripDestination: string;
  departureDate: string;
  departureTime: string;
  seatsReserved: number;
  tripUrl: string;
}

export default function PaymentVerifiedDriver({
  driverName = 'Conductor',
  passengerName = 'Juan Pérez',
  amount = 1500,
  tripOrigin = 'Buenos Aires',
  tripDestination = 'Mar del Plata',
  departureDate = '15 de noviembre de 2025',
  departureTime = '10:00',
  seatsReserved = 1,
  tripUrl = 'https://tengolugar.store/conductor/viajes/123',
}: PaymentVerifiedDriverProps) {
  return (
    <EmailLayout preview={`${passengerName} confirmó su pago de $${amount.toFixed(2)}`}>
      <EmailHeader />

      {/* Icon Section */}
      <Section style={iconSection}>
        <div style={iconStyle}>💰</div>
      </Section>

      {/* Main Content */}
      <Section style={contentSection}>
        <Heading style={heading}>
          ¡Hola {driverName}!
        </Heading>

        <Text style={subheading}>
          Nuevo pasajero confirmado
        </Text>

        <Text style={description}>
          <strong>{passengerName}</strong> confirmó su pago de <strong>${amount.toFixed(2)}</strong>{' '}
          para tu viaje de <strong>{tripOrigin}</strong> a <strong>{tripDestination}</strong>.
        </Text>

        <Text style={successText}>
          ✅ El pago fue verificado automáticamente
        </Text>
      </Section>

      {/* Trip Details */}
      <Section style={detailsSection}>
        <Heading style={detailsHeading}>Detalles de la reserva</Heading>

        <div style={detailRow}>
          <Text style={detailLabel}>👤 Pasajero:</Text>
          <Text style={detailValue}>{passengerName}</Text>
        </div>

        <div style={detailRow}>
          <Text style={detailLabel}>📍 Ruta:</Text>
          <Text style={detailValue}>
            {tripOrigin} → {tripDestination}
          </Text>
        </div>

        <div style={detailRow}>
          <Text style={detailLabel}>📅 Fecha:</Text>
          <Text style={detailValue}>{departureDate}</Text>
        </div>

        <div style={detailRow}>
          <Text style={detailLabel}>🕐 Hora:</Text>
          <Text style={detailValue}>{departureTime}</Text>
        </div>

        <div style={detailRow}>
          <Text style={detailLabel}>💺 Asientos reservados:</Text>
          <Text style={detailValue}>
            {seatsReserved} {seatsReserved === 1 ? 'asiento' : 'asientos'}
          </Text>
        </div>

        <div style={detailRow}>
          <Text style={detailLabel}>💵 Monto:</Text>
          <Text style={detailValue}>${amount.toFixed(2)}</Text>
        </div>
      </Section>

      {/* CTA Section */}
      <Section style={ctaSection}>
        <EmailButton href={tripUrl}>
          Ver Detalles del Viaje
        </EmailButton>
      </Section>

      {/* Additional Info */}
      <Section style={infoSection}>
        <Text style={infoText}>
          <strong>Recordatorios importantes:</strong>
        </Text>
        <Text style={infoText}>
          • El pasajero ya está confirmado oficialmente en tu viaje
        </Text>
        <Text style={infoText}>
          • Te recomendamos coordinar el punto de encuentro con anticipación
        </Text>
        <Text style={infoText}>
          • Puedes comunicarte con el pasajero a través del chat del viaje
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
  color: '#3b82f6',
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

const successText = {
  fontSize: '18px',
  lineHeight: '26px',
  color: '#10b981',
  fontWeight: '600',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const detailsSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  margin: '0 40px 30px',
};

const detailsHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a1a1a',
  marginBottom: '16px',
  textAlign: 'center' as const,
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '12px',
};

const detailLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
  fontWeight: '500',
};

const detailValue = {
  fontSize: '14px',
  color: '#1a1a1a',
  margin: '0',
  fontWeight: '600',
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
  color: '#666666',
  marginBottom: '8px',
};
