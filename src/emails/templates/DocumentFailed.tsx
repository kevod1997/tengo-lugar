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

interface DocumentFailedProps {
  documentType: string;
  failureReason?: string;
}

export default function DocumentFailed({ documentType, failureReason }: DocumentFailedProps) {
  return (
    <EmailLayout preview={`Verificación de ${documentType} requiere atención`}>
      <EmailHeader />
      
      {/* Warning Icon */}
      <Section style={iconSection}>
        <div style={warningIcon}>⚠</div>
      </Section>
      
      {/* Main Content */}
      <Section style={contentSection}>
        <Heading style={heading}>Verificación pendiente</Heading>
        <Text style={subheading}>
          Tu <strong>{documentType}</strong> requiere una nueva revisión
        </Text>
        <Text style={description}>
          Hemos revisado tu documento pero encontramos algunos aspectos que necesitan ser corregidos. 
          No te preocupes, esto es común y fácil de solucionar.
        </Text>
        
        {failureReason && (
          <div style={reasonBox}>
            <Text style={reasonTitle}>Motivo específico:</Text>
            <Text style={reasonText}>{failureReason}</Text>
          </div>
        )}
      </Section>

      {/* Call to Action */}
      <Section style={ctaSection}>
        <Text style={ctaHeading}>¿Cómo proceder?</Text>
        <Text style={ctaDescription}>
          Nuestro equipo de soporte está listo para ayudarte a resolver esto rápidamente.
        </Text>
        <div style={buttonContainer}>
          <EmailButton href="https://tengolugar.store/perfil">
            Subir nuevo documento
          </EmailButton>
          <EmailButton href="https://tengolugar.store/support" variant="secondary">
            Contactar soporte
          </EmailButton>
        </div>
      </Section>

      {/* Help Information */}
      <Section style={helpSection}>
        <Text style={helpHeading}>Consejos para una verificación exitosa:</Text>
        <Row>
          <Column style={tipColumn}>
            <div style={tipIcon}>📷</div>
            <Text style={tipTitle}>Imagen clara</Text>
            <Text style={tipDesc}>Asegúrate de que la foto sea nítida y legible</Text>
          </Column>
          <Column style={tipColumn}>
            <div style={tipIcon}>💡</div>
            <Text style={tipTitle}>Buena iluminación</Text>
            <Text style={tipDesc}>Evita sombras y reflejos en el documento</Text>
          </Column>
          <Column style={tipColumn}>
            <div style={tipIcon}>🔍</div>
            <Text style={tipTitle}>Documento completo</Text>
            <Text style={tipDesc}>Incluye todos los bordes y esquinas</Text>
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

const warningIcon = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: 'hsl(38, 92%, 50%)', // Warning orange color
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
  color: 'hsl(38, 92%, 50%)', // Warning color
  fontWeight: '500',
};

const description = {
  margin: '0 auto 24px auto',
  fontSize: '16px',
  lineHeight: '1.5',
  color: 'hsl(252, 5%, 40%)', // --muted-foreground
  maxWidth: '480px',
};

const reasonBox = {
  backgroundColor: 'hsl(252, 21%, 95%)', // --background  
  border: '1px solid hsl(252, 21%, 82%)', // --border
  borderRadius: 'calc(1rem - 4px)', // --radius sm
  padding: '20px',
  margin: '24px auto 0 auto',
  maxWidth: '400px',
  textAlign: 'left' as const,
};

const reasonTitle = {
  margin: '0 0 8px 0',
  fontSize: '14px',
  fontWeight: 'bold',
  color: 'hsl(252, 5%, 10%)', // --foreground
};

const reasonText = {
  margin: '0',
  fontSize: '14px',
  lineHeight: '1.4',
  color: 'hsl(252, 5%, 40%)', // --muted-foreground
  fontStyle: 'italic',
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
  display: 'flex',
  gap: '16px',
  justifyContent: 'center',
  flexWrap: 'wrap' as const,
};

const helpSection = {
  backgroundColor: '#ffffff',
  padding: '40px 30px',
};

const helpHeading = {
  margin: '0 0 32px 0',
  fontSize: '20px',
  fontWeight: 'bold',
  color: 'hsl(252, 5%, 10%)', // --foreground
  textAlign: 'center' as const,
};

const tipColumn = {
  textAlign: 'center' as const,
  verticalAlign: 'top',
  width: '33.333%',
  padding: '0 15px',
};

const tipIcon = {
  fontSize: '32px',
  margin: '0 0 16px 0',
  display: 'block',
};

const tipTitle = {
  margin: '0 0 8px 0',
  fontSize: '16px',
  fontWeight: 'bold',
  color: 'hsl(252, 5%, 10%)', // --foreground
};

const tipDesc = {
  margin: '0',
  fontSize: '14px',
  lineHeight: '1.4',
  color: 'hsl(252, 5%, 40%)', // --muted-foreground
};