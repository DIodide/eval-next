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

interface InactivityNudgeEmailProps {
  playerName: string;
  daysSinceLastLogin: number;
  profileUrl: string;
  browseUrl: string;
}

export function InactivityNudgeEmail({
  playerName,
  daysSinceLastLogin,
  profileUrl,
  browseUrl,
}: InactivityNudgeEmailProps) {
  const displayName = playerName.trim() || "Player";

  return (
    <Html>
      <Head />
      <Preview>Coaches are browsing — don&apos;t miss out</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://evalgaming.com/_next/image?url=%2Feval%2Flogos%2FeLOGO_black.png&w=256&q=75"
            width="120"
            height="40"
            alt="EVAL Gaming"
            style={logo}
          />

          <Heading style={heading}>We miss you, {displayName}!</Heading>

          <Text style={paragraph}>
            It&apos;s been {daysSinceLastLogin} days since you last visited EVAL
            Gaming. Coaches are actively browsing player profiles — keeping yours
            up to date gives you the best shot at getting noticed.
          </Text>

          <Text style={paragraph}>A few things you can do right now:</Text>

          <Text style={listItem}>
            <strong>Update your stats</strong> — make sure your rank, GPA, and
            highlights are current
          </Text>
          <Text style={listItem}>
            <strong>Browse new programs</strong> — new schools are joining EVAL
            Gaming regularly
          </Text>
          <Text style={listItem}>
            <strong>Message a coach</strong> — don&apos;t wait for them to find
            you
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={profileUrl}>
              Update Your Profile
            </Button>
          </Section>

          <Text style={secondaryCta}>
            Or{" "}
            <a href={browseUrl} style={link}>
              browse programs
            </a>{" "}
            to find your next opportunity
          </Text>

          <Hr style={hr} />

          <Text style={footerText}>
            You&apos;re receiving this because you have an account on EVAL
            Gaming. Manage your notification preferences in your dashboard
            settings.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

InactivityNudgeEmail.PreviewProps = {
  playerName: "Jordan Lee",
  daysSinceLastLogin: 14,
  profileUrl: "https://evalgaming.com/dashboard/player/profile",
  browseUrl: "https://evalgaming.com/schools",
} satisfies InactivityNudgeEmailProps;

export default InactivityNudgeEmail;

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

const listItem = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#4a4a4a",
  margin: "0 0 8px",
  paddingLeft: "8px",
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

const secondaryCta = {
  fontSize: "14px",
  color: "#666",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const link = {
  color: "#7c3aed",
  textDecoration: "underline",
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
