import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface EmailVerificationEmailProps {
  userName: string;
  verificationUrl: string;
}

export function EmailVerificationEmail({
  userName,
  verificationUrl,
}: EmailVerificationEmailProps) {
  const displayName = userName.trim() || "there";

  return (
    <Html>
      <Head />
      <Preview>Verify your email address for EVAL Gaming</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://evalgaming.com/_next/image?url=%2Feval%2Flogos%2FeLOGO_black.png&w=256&q=75"
            width="120"
            height="40"
            alt="EVAL Gaming"
            style={logo}
          />

          <Heading style={heading}>Verify your email</Heading>

          <Text style={paragraph}>
            Hi {displayName}, please confirm your email address to complete your
            EVAL Gaming account setup.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={verificationUrl}>
              Verify Email Address
            </Button>
          </Section>

          <Text style={secondaryText}>
            This link will expire in 24 hours. If you didn&apos;t create an
            account on EVAL Gaming, you can safely ignore this email.
          </Text>

          <Hr style={hr} />

          <Text style={footerText}>
            If the button above doesn&apos;t work, copy and paste this URL into
            your browser: {verificationUrl}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

EmailVerificationEmail.PreviewProps = {
  userName: "Jordan Lee",
  verificationUrl: "https://evalgaming.com/verify?token=abc123",
} satisfies EmailVerificationEmailProps;

export default EmailVerificationEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const logo = {
  margin: "0 auto 24px",
  display: "block" as const,
};

const heading = {
  fontSize: "24px",
  fontWeight: "600" as const,
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#4a4a4a",
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#7c3aed",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 24px",
  display: "inline-block" as const,
};

const secondaryText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#666",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const hr = {
  borderColor: "#e6e6e6",
  margin: "24px 0",
};

const footerText = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#999",
  wordBreak: "break-all" as const,
};
