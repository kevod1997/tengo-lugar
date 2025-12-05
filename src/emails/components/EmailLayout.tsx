import type { ReactNode } from 'react';

import {
  Body,
  Container,
  Html,
  Head,
  Preview,
} from '@react-email/components';

interface EmailLayoutProps {
  children: ReactNode;
  preview: string;
}

export const EmailLayout = ({ children, preview }: EmailLayoutProps) => {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {children}
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: 'hsl(252, 21%, 95%)', // --background
  fontFamily: 'Arial, Helvetica, sans-serif',
  margin: 0,
  padding: 0,
  color: 'hsl(252, 5%, 10%)', // --foreground
};

const container = {
  backgroundColor: 'hsl(252, 21%, 95%)', // --background
  margin: '0 auto',
  padding: '20px 0',
  width: '100%',
  maxWidth: '600px',
};