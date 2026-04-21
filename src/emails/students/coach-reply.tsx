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

interface CoachReplyEmailProps {
  playerName: string;
  coachName: string;
  schoolName: string;
  messagePreview: string;
  viewUrl: string;
}

export function CoachReplyEmail({
  playerName,
  coachName,
  schoolName,
  messagePreview,
  viewUrl,
}: CoachReplyEmailProps) {
  const displayName = playerName.trim() || "Player";
  const truncatedPreview =
    messagePreview.length > 120
      ? messagePreview.slice(0, 120) + "..."
      : messagePreview;

  return (
    <Html>
      <Head />
      <Preview>
        Coach {coachName} from {schoolName} replied to your message
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://evalgaming.com/_next/image?url=%2Feval%2Flogos%2FeLOGO_black.png&w=256&q=75"
            width="120"
            height="40"
            alt="EVAL Gaming"
            style={logo}
          />

          <Heading style={heading}>A coach replied to you!</Heading>

          <Text style={paragraph}>
            Hi {displayName}, <strong>Coach {coachName}</strong> from{" "}
            <strong>{schoolName}</strong> responded to your message on EVAL
            Gaming.
          </Text>

          <Section style={messageBox}>
            <Text style={messageText}>&ldquo;{truncatedPreview}&rdquo;</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={viewUrl}>
              View Full Message
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footerText}>
            You&apos;re receiving this because a coach responded to your message
            on EVAL Gaming. Manage your notification preferences in your
            dashboard settings.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

CoachReplyEmail.PreviewProps = {
  playerName: "Jordan Lee",
  coachName: "Alex Thompson",
  schoolName: "Princeton University",
  messagePreview:
    "Hi Jordan, thanks for reaching out! We'd love to learn more about you. Our program is looking for Valorant players and your rank looks great.",
  viewUrl: "https://evalgaming.com/dashboard/player/messages",
} satisfies CoachReplyEmailProps;

export default CoachReplyEmail;

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

const messageBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
  borderLeft: "3px solid #7c3aed",
};

const messageText = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#4a4a4a",
  fontStyle: "italic" as const,
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
