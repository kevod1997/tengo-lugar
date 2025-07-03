import { Button } from '@react-email/components';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const EmailButton = ({ href, children, variant = 'primary' }: EmailButtonProps) => {
  const buttonStyle = variant === 'primary' ? primaryButton : secondaryButton;
  
  return (
    <Button href={href} style={buttonStyle}>
      {children}
    </Button>
  );
};

const primaryButton = {
  backgroundColor: 'hsl(252, 52%, 60%)', // --primary
  borderRadius: 'calc(1rem - 2px)', // --radius md
  color: 'hsl(0, 0%, 100%)', // --primary-foreground
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  fontSize: '16px',
  lineHeight: '1.4',
  cursor: 'pointer',
  border: 'none',
  letterSpacing: '0.01em',
  transition: 'all 0.2s ease',
};

const secondaryButton = {
  backgroundColor: 'transparent',
  borderRadius: 'calc(1rem - 2px)', // --radius md
  color: 'hsl(252, 52%, 60%)', // --primary
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  fontSize: '16px',
  lineHeight: '1.4',
  cursor: 'pointer',
  border: '2px solid hsl(252, 52%, 60%)', // --primary
  letterSpacing: '0.01em',
  transition: 'all 0.2s ease',
};