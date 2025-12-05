import {
  Section,
  Text,
  Heading,
} from '@react-email/components';

import { EmailButton } from '../components/EmailButton';
import { EmailFooter } from '../components/EmailFooter';
import { EmailHeader } from '../components/EmailHeader';
import { EmailLayout } from '../components/EmailLayout';

interface ReviewReceivedProps {
  userName: string;
  reviewerName: string;
  rating: number;
  profileUrl: string;
}

export default function ReviewReceived({
  userName = 'Usuario',
  reviewerName = 'Juan Pérez',
  rating = 5,
  profileUrl = 'https://tengolugar.store/profile/123',
}: ReviewReceivedProps) {
  // Generate star display
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = '⭐'.repeat(fullStars);
    return stars;
  };

  return (
    <EmailLayout preview={`${reviewerName} te ha dejado una calificación de ${rating} estrellas`}>
      <EmailHeader />

      {/* Icon Section */}
      <Section style={iconSection}>
        <div style={iconStyle}>🎉</div>
      </Section>

      {/* Main Content */}
      <Section style={contentSection}>
        <Heading style={heading}>
          ¡Recibiste una nueva calificación!
        </Heading>

        <Text style={subheading}>
          ¡Hola {userName}!
        </Text>

        <Text style={description}>
          <strong>{reviewerName}</strong> te ha calificado después de su viaje contigo.
        </Text>

        {/* Rating Display */}
        <Section style={ratingSection}>
          <Text style={ratingStars}>
            {renderStars(rating)}
          </Text>
          <Text style={ratingText}>
            {rating} de 5 estrellas
          </Text>
        </Section>

        <Text style={description}>
          Las calificaciones son importantes para construir confianza en la comunidad de Tengo Lugar.
          Sigue brindando un excelente servicio para mantener tu buena reputación.
        </Text>
      </Section>

      {/* CTA Section */}
      <Section style={ctaSection}>
        <EmailButton href={profileUrl}>
          Ver mi Perfil
        </EmailButton>
      </Section>

      {/* Additional Info */}
      <Section style={infoSection}>
        <Text style={infoText}>
          Tu calificación promedio se actualiza automáticamente y es visible para todos los usuarios.
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

const ratingSection = {
  textAlign: 'center' as const,
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  marginBottom: '24px',
};

const ratingStars = {
  fontSize: '32px',
  lineHeight: '1',
  marginBottom: '8px',
};

const ratingText = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#4a4a4a',
  marginTop: '8px',
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
