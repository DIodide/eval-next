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

interface AccountDeactivationEmailProps {
  userName: string;
  reason?: string;
  supportUrl: string;
}

export function AccountDeactivationEmail({
  userName,
  reason,
  supportUrl,
}: AccountDeactivationEmailProps) {
  const displayName = userName.trim() || "there";

  return (
    <Html>
      <Head />
      <Preview>Your EVAL Gaming account has been deactivated</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://evalgaming.com/_next/image?url=%2Feval%2Flogos%2FeLOGO_black.png&w=256&q=75"
            width="120"
            height="40"
            alt="EVAL Gaming"
            style={logo}
          />

          <Heading style={heading}>Account deactivated</Heading>

          <Text style={paragraph}>
            Hi {displayName}, your EVAL Gaming account has been deactivated.
            Your profile and data are no longer visible to other users on the
            platform.
          </Text>

          {reason && (
            <Section style={reasonBox}>
              <Text style={reasonLabel}>Reason</Text>
              <Text style={reasonText}>{reason}</Text>
            </Section>
          )}

          <Text style={paragraph}>
            If you believe this was a mistake or would like to reactivate your
            account, please reach out to our support team.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={supportUrl}>
              Contact Support
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footerText}>
            This is an automated notification from EVAL Gaming. You&apos;re
            receiving this because your account status changed.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

AccountDeactivationEmail.PreviewProps = {
  userName: "Jordan Lee",
  reason: "Account deactivated at your request.",
  supportUrl: "https://evalgaming.com/support",
} satisfies AccountDeactivationEmailProps;

export default AccountDeactivationEmail;

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

const reasonBox = {
  backgroundColor: "#fef9f0",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
  borderLeft: "3px solid #f59e0b",
};

const reasonLabel = {
  fontSize: "13px",
  fontWeight: "600" as const,
  color: "#92400e",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const reasonText = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#4a4a4a",
  margin: "0",
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

const hr = {
  borderColor: "#e6e6e6",
  margin: "24px 0",
};

const footerText = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#999",
};
