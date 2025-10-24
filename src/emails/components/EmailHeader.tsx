import {
  Section,
  Img,
  Link,
  Row,
  Column,
} from '@react-email/components';

export const EmailHeader = () => {
  return (
    <Section style={header}>
      <Row>
        <Column style={logoColumn}>
          <Link href="https://tengolugar.store" style={logoLink}>
            <Img
              src="https://i.ibb.co/k63ZbY43/logo-2.png"
              width="180"
              height="auto"
              alt="Tengo Lugar"
              style={logo}
            />
          </Link>
        </Column>
      </Row>
    </Section>
  );
};

const header = {
  backgroundColor: '#ffffff',
  padding: '50px 30px 40px 30px',
  textAlign: 'center' as const,
  borderBottom: '1px solid hsl(252, 21%, 82%)', // --border
};

const logoColumn = {
  textAlign: 'center' as const,
};

const logoLink = {
  textDecoration: 'none',
  display: 'inline-block',
};

const logo = {
  width: '180px',
  maxWidth: '90%',
  height: 'auto',
  border: 'none',
  textDecoration: 'none',
  display: 'block',
  margin: '0 auto',
};