import {
  Section,
  Text,
  Heading,
  Row,
  Column,
} from '@react-email/components';

import { EmailButton } from '../components/EmailButton';
import { EmailFooter } from '../components/EmailFooter';
import { EmailHeader } from '../components/EmailHeader';
import { EmailLayout } from '../components/EmailLayout';

interface EmailVerificationProps {
  verificationUrl: string;
  userName?: string;
}

export default function EmailVerification({ verificationUrl, userName }: EmailVerificationProps) {
  return (
    <EmailLayout preview="¡Bienvenido a Tengo Lugar! Verifica tu email">
      <EmailHeader />
      
      {/* Welcome Icon */}
      <Section style={iconSection}>
        <div style={welcomeIcon}>👋</div>
      </Section>
      
      {/* Main Content */}
      <Section style={contentSection}>
        <Heading style={heading}>¡Bienvenido a Tengo Lugar!</Heading>
        <Text style={greeting}>
          {userName ? `Hola ${userName}` : 'Hola'}
        </Text>
        <Text style={description}>
          Gracias por unirte a nuestra comunidad de carpooling. Estamos emocionados de tenerte a bordo. 
          Para comenzar a usar la plataforma, solo necesitas verificar tu email.
        </Text>
        
        <div style={buttonContainer}>
          <EmailButton href={verificationUrl}>
            Verificar mi email
          </EmailButton>
        </div>
      </Section>

      {/* What's Next Section */}
      <Section style={nextStepsSection}>
        <Text style={nextStepsHeading}>¿Qué puedes hacer después de verificar?</Text>
        <Row>
          <Column style={stepColumn}>
            <div style={stepIcon}>🚗</div>
            <Text style={stepTitle}>Publica viajes</Text>
            <Text style={stepDesc}>Comparte tu auto y gana dinero</Text>
          </Column>
          <Column style={stepColumn}>
            <div style={stepIcon}>🔍</div>
            <Text style={stepTitle}>Busca viajes</Text>
            <Text style={stepDesc}>Encuentra tu ruta ideal</Text>
          </Column>
          <Column style={stepColumn}>
            <div style={stepIcon}>👥</div>
            <Text style={stepTitle}>Conecta</Text>
            <Text style={stepDesc}>Conoce otros viajeros</Text>
          </Column>
        </Row>
      </Section>

      {/* Benefits Section */}
      <Section style={benefitsSection}>
        <Text style={benefitsHeading}>Beneficios de Tengo Lugar</Text>
        <div style={benefitsList}>
          <div style={benefitItem}>
            <span style={benefitIcon}>💰</span>
            <Text style={benefitText}>Ahorra dinero en combustible</Text>
          </div>
          <div style={benefitItem}>
            <span style={benefitIcon}>🌱</span>
            <Text style={benefitText}>Contribuye al medio ambiente</Text>
          </div>
          <div style={benefitItem}>
            <span style={benefitIcon}>🤝</span>
            <Text style={benefitText}>Conoce personas increíbles</Text>
          </div>
          <div style={benefitItem}>
            <span style={benefitIcon}>🛡️</span>
            <Text style={benefitText}>Viaja de forma segura</Text>
          </div>
        </div>
      </Section>

      {/* Help Section */}
      <Section style={helpSection}>
        <Text style={helpText}>
          Si tienes problemas para verificar tu email o no recibiste este mensaje en tu bandeja de entrada, 
          revisa tu carpeta de spam o contacta a nuestro soporte.
        </Text>
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

const welcomeIcon = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: 'hsl(252, 52%, 60%)', // --primary
  color: '#ffffff',
  fontSize: '36px',
  lineHeight: '1',
  margin: '0 auto',
};

const contentSection = {
  backgroundColor: '#ffffff',
  padding: '20px 40px 40px 40px',
  textAlign: 'center' as const,
};

const heading = {
  margin: '0 0 20px 0',
  fontSize: '32px',
  lineHeight: '1.2',
  fontWeight: 'bold',
  color: 'hsl(252, 5%, 10%)', // --foreground
  letterSpacing: '-0.02em',
};

const greeting = {
  margin: '0 0 24px 0',
  fontSize: '20px',
  lineHeight: '1.3',
  color: 'hsl(252, 52%, 60%)', // --primary
  fontWeight: '500',
};

const description = {
  margin: '0 auto 32px auto',
  fontSize: '16px',
  lineHeight: '1.5',
  color: 'hsl(252, 5%, 40%)', // --muted-foreground
  maxWidth: '480px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '0 0 20px 0',
};

const nextStepsSection = {
  backgroundColor: 'hsl(252, 21%, 90%)', // --card
  padding: '40px 30px',
};

const nextStepsHeading = {
  margin: '0 0 32px 0',
  fontSize: '24px',
  fontWeight: 'bold',
  color: 'hsl(252, 5%, 10%)', // --foreground
  textAlign: 'center' as const,
};

const stepColumn = {
  textAlign: 'center' as const,
  verticalAlign: 'top',
  width: '33.333%',
  padding: '0 15px',
};

const stepIcon = {
  fontSize: '32px',
  margin: '0 0 16px 0',
  display: 'block',
};

const stepTitle = {
  margin: '0 0 8px 0',
  fontSize: '16px',
  fontWeight: 'bold',
  color: 'hsl(252, 5%, 10%)', // --foreground
};

const stepDesc = {
  margin: '0',
  fontSize: '14px',
  lineHeight: '1.4',
  color: 'hsl(252, 5%, 40%)', // --muted-foreground
};

const benefitsSection = {
  backgroundColor: '#ffffff',
  padding: '40px 30px',
};

const benefitsHeading = {
  margin: '0 0 32px 0',
  fontSize: '20px',
  fontWeight: 'bold',
  color: 'hsl(252, 5%, 10%)', // --foreground
  textAlign: 'center' as const,
};

const benefitsList = {
  maxWidth: '400px',
  margin: '0 auto',
};

const benefitItem = {
  display: 'flex',
  alignItems: 'center',
  margin: '0 0 16px 0',
  padding: '12px',
  backgroundColor: 'hsl(252, 21%, 95%)', // --background
  borderRadius: 'calc(1rem - 4px)', // --radius sm
};

const benefitIcon = {
  fontSize: '20px',
  marginRight: '12px',
  flexShrink: 0,
};

const benefitText = {
  margin: '0',
  fontSize: '14px',
  color: 'hsl(252, 5%, 10%)', // --foreground
  fontWeight: '500',
};

const helpSection = {
  backgroundColor: 'hsl(252, 21%, 90%)', // --card
  padding: '30px',
  textAlign: 'center' as const,
};

const helpText = {
  margin: '0 auto',
  fontSize: '14px',
  lineHeight: '1.5',
  color: 'hsl(252, 5%, 40%)', // --muted-foreground
  maxWidth: '400px',
};