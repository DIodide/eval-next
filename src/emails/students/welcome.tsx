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

interface StudentWelcomeEmailProps {
  playerName: string;
  profileUrl: string;
  browseUrl: string;
}

export function StudentWelcomeEmail({
  playerName,
  profileUrl,
  browseUrl,
}: StudentWelcomeEmailProps) {
  const displayName = playerName.trim() || "Player";

  return (
    <Html>
      <Head />
      <Preview>Welcome to EVAL Gaming — let&apos;s get you recruited</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://evalgaming.com/_next/image?url=%2Feval%2Flogos%2FeLOGO_black.png&w=256&q=75"
            width="120"
            height="40"
            alt="EVAL Gaming"
            style={logo}
          />

          <Heading style={heading}>Welcome to EVAL Gaming, {displayName}!</Heading>

          <Text style={paragraph}>
            You&apos;re now part of the platform connecting esports athletes with
            college programs. Coaches are actively browsing player profiles — the
            more complete yours is, the better your chances of getting noticed.
          </Text>

          <Text style={paragraph}>Get started in a few quick steps:</Text>

          <Text style={listItem}>
            <strong>Complete your profile</strong> — add your game, rank, GPA,
            and a highlight reel
          </Text>
          <Text style={listItem}>
            <strong>Browse programs</strong> — explore college esports programs
            that match your goals
          </Text>
          <Text style={listItem}>
            <strong>Reach out</strong> — message coaches directly to show your
            interest
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={profileUrl}>
              Complete Your Profile
            </Button>
          </Section>

          <Text style={secondaryCta}>
            Or{" "}
            <a href={browseUrl} style={link}>
              start browsing programs
            </a>
          </Text>

          <Hr style={hr} />

          <Text style={footerText}>
            You&apos;re receiving this because you signed up for EVAL Gaming. If
            you believe this was sent in error, you can ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

StudentWelcomeEmail.PreviewProps = {
  playerName: "Jordan Lee",
  profileUrl: "https://evalgaming.com/dashboard/player/profile",
  browseUrl: "https://evalgaming.com/schools",
} satisfies StudentWelcomeEmailProps;

export default StudentWelcomeEmail;

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
