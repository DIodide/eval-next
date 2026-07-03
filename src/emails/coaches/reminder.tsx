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

interface ReminderEmailProps {
  coachName: string;
  schoolName: string;
  playerName: string;
  viewUrl: string;
}

export function ReminderEmail({
  coachName,
  schoolName,
  playerName,
  viewUrl,
}: ReminderEmailProps) {
  const displayName = coachName.trim() || "Coach";

  return (
    <Html>
      <Head />
      <Preview>A player tried to contact your esports program</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://evalgaming.com/_next/image?url=%2Feval%2Flogos%2FeLOGO_black.png&w=256&q=75"
            width="120"
            height="40"
            alt="EVAL Gaming"
            style={logo}
          />

          <Heading style={heading}>
            A player is waiting to hear from you
          </Heading>

          <Text style={paragraph}>
            Hi {displayName}, <strong>{playerName}</strong> sent a message to
            your esports program at <strong>{schoolName}</strong> on EVAL Gaming
            and hasn&apos;t received a response yet.
          </Text>

          <Text style={paragraph}>
            Sign up to view their full profile and respond directly through the
            platform.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={viewUrl}>
              View Message on EVAL
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footerText}>
            You&apos;re receiving this because a player messaged your program on
            EVAL Gaming. If you&apos;d like to stop receiving these emails,
            claim your profile and manage your notification settings.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ReminderEmail.PreviewProps = {
  coachName: "Alex Thompson",
  schoolName: "Princeton University",
  playerName: "Jordan Lee",
  viewUrl: "https://evalgaming.com/sign-up/coaches",
} satisfies ReminderEmailProps;

export default ReminderEmail;

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

const hr = {
  borderColor: "#e6e6e6",
  margin: "24px 0",
};

const footerText = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#999",
};
