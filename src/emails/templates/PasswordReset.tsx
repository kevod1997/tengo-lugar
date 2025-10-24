import {
  Section,
  Text,
  Heading,
  Hr,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeader } from '../components/EmailHeader';
import { EmailFooter } from '../components/EmailFooter';
import { EmailButton } from '../components/EmailButton';

interface PasswordResetProps {
  resetUrl: string;
  userName?: string;
}

export default function PasswordReset({ resetUrl, userName }: PasswordResetProps) {
  return (
    <EmailLayout preview="Restablecer tu contraseña de Tengo Lugar">
      <EmailHeader />
      
      {/* Lock Icon */}
      <Section style={iconSection}>
        <div style={lockIcon}>🔒</div>
      </Section>
      
      {/* Main Content */}
      <Section style={contentSection}>
        <Heading style={heading}>Restablecer contraseña</Heading>
        <Text style={greeting}>
          {userName ? `Hola ${userName}` : 'Hola'}
        </Text>
        <Text style={description}>
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en Tengo Lugar. 
          Para proceder con el cambio, haz clic en el botón de abajo.
        </Text>
        
        <div style={buttonContainer}>
          <EmailButton href={resetUrl}>
            Crear nueva contraseña
          </EmailButton>
        </div>
        
        <Hr style={divider} />
        
        <div style={securityBox}>
          <Text style={securityTitle}>Información de seguridad:</Text>
          <ul style={securityList}>
            <li style={securityItem}>Este enlace expirará en <strong>24 horas</strong></li>
            <li style={securityItem}>Solo puede ser usado <strong>una vez</strong></li>
            <li style={securityItem}>Si no solicitaste este cambio, ignora este email</li>
          </ul>
        </div>
      </Section>

      {/* Help Section */}
      <Section style={helpSection}>
        <Text style={helpTitle}>¿Necesitas ayuda?</Text>
        <Text style={helpText}>
          Si tienes problemas para restablecer tu contraseña o no solicitaste este cambio, 
          nuestro equipo de soporte está aquí para ayudarte.
        </Text>
        <div style={buttonContainer}>
          <EmailButton href="https://tengolugar.store/support" variant="secondary">
            Contactar soporte
          </EmailButton>
        </div>
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

const lockIcon = {
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
  margin: '0 0 32px 0',
};

const divider = {
  margin: '32px 0',
  borderColor: 'hsl(252, 21%, 82%)', // --border
};

const securityBox = {
  backgroundColor: 'hsl(252, 21%, 95%)', // --background
  border: '1px solid hsl(252, 21%, 82%)', // --border
  borderRadius: 'calc(1rem - 4px)', // --radius sm
  padding: '24px',
  textAlign: 'left' as const,
  maxWidth: '400px',
  margin: '0 auto',
};

const securityTitle = {
  margin: '0 0 16px 0',
  fontSize: '16px',
  fontWeight: 'bold',
  color: 'hsl(252, 5%, 10%)', // --foreground
};

const securityList = {
  margin: '0',
  padding: '0 0 0 20px',
  color: 'hsl(252, 5%, 40%)', // --muted-foreground
};

const securityItem = {
  margin: '0 0 8px 0',
  fontSize: '14px',
  lineHeight: '1.4',
};

const helpSection = {
  backgroundColor: 'hsl(252, 21%, 90%)', // --card
  padding: '40px 30px',
  textAlign: 'center' as const,
};

const helpTitle = {
  margin: '0 0 16px 0',
  fontSize: '20px',
  fontWeight: 'bold',
  color: 'hsl(252, 5%, 10%)', // --foreground
};

const helpText = {
  margin: '0 auto 24px auto',
  fontSize: '16px',
  lineHeight: '1.5',
  color: 'hsl(252, 5%, 40%)', // --muted-foreground
  maxWidth: '400px',
};