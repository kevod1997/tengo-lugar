import {
  Section,
  Text,
  Link,
  Row,
  Column,
  Hr,
} from '@react-email/components';

export const EmailFooter = () => {
  return (
    <>
      <Hr style={divider} />
      <Section style={footer}>
        <Row>
          <Column style={footerColumn}>
            <Text style={companyText}>
              <strong>Tengo Lugar</strong>
            </Text>
            <Text style={descriptionText}>
              La plataforma de carpooling que conecta conductores y pasajeros
            </Text>
            <Text style={linksText}>
              <Link href="https://tengolugar.com/politica-de-privacidad" style={footerLink}>
                Política de Privacidad
              </Link>
              {' • '}
              <Link href="https://tengolugar.com/terminos" style={footerLink}>
                Términos de Uso
              </Link>
              {' • '}
              <Link href="https://tengolugar.com/unsubscribe" style={footerLink}>
                Darse de baja
              </Link>
            </Text>
            <Text style={copyrightText}>
              &copy; {new Date().getFullYear()} Tengo Lugar. Todos los derechos reservados.
            </Text>
          </Column>
        </Row>
      </Section>
    </>
  );
};

const divider = {
  margin: '30px 0 0 0',
  borderColor: 'hsl(252, 21%, 82%)', // --border
};

const footer = {
  backgroundColor: 'hsl(252, 21%, 90%)', // --card
  padding: '40px 30px',
  textAlign: 'center' as const,
};

const footerColumn = {
  textAlign: 'center' as const,
};

const companyText = {
  margin: '0 0 8px 0',
  fontSize: '18px',
  fontWeight: 'bold',
  color: 'hsl(252, 5%, 10%)', // --foreground
};

const descriptionText = {
  margin: '0 0 20px 0',
  fontSize: '14px',
  color: 'hsl(252, 5%, 40%)', // --muted-foreground
  lineHeight: '20px',
};

const linksText = {
  margin: '0 0 20px 0',
  fontSize: '13px',
  lineHeight: '18px',
};

const footerLink = {
  color: 'hsl(252, 52%, 60%)', // --primary
  textDecoration: 'none',
};

const copyrightText = {
  margin: '0',
  fontSize: '12px',
  color: 'hsl(252, 5%, 40%)', // --muted-foreground
  lineHeight: '16px',
};