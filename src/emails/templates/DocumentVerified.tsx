import {
  Section,
  Text,
  Heading,
  Row,
  Column,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeader } from '../components/EmailHeader';
import { EmailFooter } from '../components/EmailFooter';
import { EmailButton } from '../components/EmailButton';

interface DocumentVerifiedProps {
  documentType: string;
}

export default function DocumentVerified({ documentType }: DocumentVerifiedProps) {
  return (
    <EmailLayout preview={`¡Tu ${documentType} ha sido verificado con éxito!`}>
      <EmailHeader />
      
      {/* Success Icon */}
      <Section style={iconSection}>
        <div style={successIcon}>✓</div>
      </Section>
      
      {/* Main Content */}
      <Section style={contentSection}>
        <Heading style={heading}>¡Verificación exitosa!</Heading>
        <Text style={subheading}>
          Tu <strong>{documentType}</strong> ha sido verificado correctamente
        </Text>
        <Text style={description}>
          Excelente noticia. Tu documento ha pasado nuestro proceso de verificación y tu cuenta está lista para usar. 
          Ahora puedes acceder a todas las funciones de nuestra plataforma de carpooling.
        </Text>
      </Section>

      {/* Call to Action */}
      <Section style={ctaSection}>
        <Text style={ctaHeading}>¿Listo para comenzar?</Text>
        <Text style={ctaDescription}>
          Explora nuestra plataforma y comienza a disfrutar de viajes compartidos seguros y económicos.
        </Text>
        <div style={buttonContainer}>
          <EmailButton href="https://tengolugar.com/dashboard">
            Acceder a mi cuenta
          </EmailButton>
        </div>
      </Section>

      {/* Features */}
      <Section style={featuresSection}>
        <Text style={featuresHeading}>Qué puedes hacer ahora:</Text>
        <Row>
          <Column style={featureColumn}>
            <div style={featureIcon}>🚗</div>
            <Text style={featureTitle}>Publicar viajes</Text>
            <Text style={featureDesc}>Ofrece asientos en tu vehículo</Text>
          </Column>
          <Column style={featureColumn}>
            <div style={featureIcon}>🔍</div>
            <Text style={featureTitle}>Buscar viajes</Text>
            <Text style={featureDesc}>Encuentra tu viaje ideal</Text>
          </Column>
          <Column style={featureColumn}>
            <div style={featureIcon}>💬</div>
            <Text style={featureTitle}>Comunicarte</Text>
            <Text style={featureDesc}>Chatea con otros usuarios</Text>
          </Column>
        </Row>
      </Section>

      <EmailFooter />
    </EmailLayout>
  );
}

const iconSection = {
  backgroundColor: '#ffffff',
  padding: '40px 30px 20px 30px',
  textAlign: 'center' as const,
};

const successIcon = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: 'hsl(142, 76%, 36%)', // Green success color
  color: '#ffffff',
  fontSize: '48px',
  fontWeight: 'bold',
  lineHeight: '1',
  margin: '0 auto',
};

const contentSection = {
  backgroundColor: '#ffffff',
  padding: '20px 40px 40px 40px',
  textAlign: 'center' as const,
};

const heading = {
  margin: '0 0 16px 0',
  fontSize: '32px',
  lineHeight: '1.2',
  fontWeight: 'bold',
  color: 'hsl(252, 5%, 10%)', // --foreground
  letterSpacing: '-0.02em',
};

const subheading = {
  margin: '0 0 24px 0',
  fontSize: '20px',
  lineHeight: '1.3',
  color: 'hsl(252, 52%, 60%)', // --primary
  fontWeight: '500',
};

const description = {
  margin: '0 auto',
  fontSize: '16px',
  lineHeight: '1.5',
  color: 'hsl(252, 5%, 40%)', // --muted-foreground
  maxWidth: '480px',
};

const ctaSection = {
  backgroundColor: 'hsl(252, 21%, 90%)', // --card
  padding: '40px 30px',
  textAlign: 'center' as const,
};

const ctaHeading = {
  margin: '0 0 12px 0',
  fontSize: '24px',
  fontWeight: 'bold',
  color: 'hsl(252, 5%, 10%)', // --foreground
};

const ctaDescription = {
  margin: '0 0 32px 0',
  fontSize: '16px',
  lineHeight: '1.5',
  color: 'hsl(252, 5%, 40%)', // --muted-foreground
};

const buttonContainer = {
  textAlign: 'center' as const,
};

const featuresSection = {
  backgroundColor: '#ffffff',
  padding: '40px 30px',
};

const featuresHeading = {
  margin: '0 0 32px 0',
  fontSize: '20px',
  fontWeight: 'bold',
  color: 'hsl(252, 5%, 10%)', // --foreground
  textAlign: 'center' as const,
};

const featureColumn = {
  textAlign: 'center' as const,
  verticalAlign: 'top',
  width: '33.333%',
  padding: '0 15px',
};

const featureIcon = {
  fontSize: '32px',
  margin: '0 0 16px 0',
  display: 'block',
};

const featureTitle = {
  margin: '0 0 8px 0',
  fontSize: '16px',
  fontWeight: 'bold',
  color: 'hsl(252, 5%, 10%)', // --foreground
};

const featureDesc = {
  margin: '0',
  fontSize: '14px',
  lineHeight: '1.4',
  color: 'hsl(252, 5%, 40%)', // --muted-foreground
};