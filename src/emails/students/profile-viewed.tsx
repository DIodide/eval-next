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

interface ProfileViewedEmailProps {
  playerName: string;
  coachName: string;
  schoolName: string;
  schoolProfileUrl: string;
  dashboardUrl: string;
}

export function ProfileViewedEmail({
  playerName,
  coachName,
  schoolName,
  schoolProfileUrl,
  dashboardUrl,
}: ProfileViewedEmailProps) {
  const displayName = playerName.trim() || "Player";

  return (
    <Html>
      <Head />
      <Preview>A coach just viewed your EVAL Gaming profile</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://evalgaming.com/_next/image?url=%2Feval%2Flogos%2FeLOGO_black.png&w=256&q=75"
            width="120"
            height="40"
            alt="EVAL Gaming"
            style={logo}
          />

          <Heading style={heading}>A coach checked out your profile</Heading>

          <Text style={paragraph}>
            Hi {displayName}, <strong>Coach {coachName}</strong> from{" "}
            <strong>{schoolName}</strong> viewed your player profile on EVAL
            Gaming.
          </Text>

          <Text style={paragraph}>
            This could be a great opportunity — check out their program and
            consider reaching out if it&apos;s a good fit.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={schoolProfileUrl}>
              View {schoolName}&apos;s Program
            </Button>
          </Section>

          <Text style={secondaryCta}>
            Or{" "}
            <a href={dashboardUrl} style={link}>
              go to your dashboard
            </a>{" "}
            to see all profile views
          </Text>

          <Hr style={hr} />

          <Text style={footerText}>
            You&apos;re receiving this because a coach viewed your profile on
            EVAL Gaming. Manage your notification preferences in your dashboard
            settings.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ProfileViewedEmail.PreviewProps = {
  playerName: "Jordan Lee",
  coachName: "Alex Thompson",
  schoolName: "Princeton University",
  schoolProfileUrl: "https://evalgaming.com/schools/princeton-university",
  dashboardUrl: "https://evalgaming.com/dashboard/player",
} satisfies ProfileViewedEmailProps;

export default ProfileViewedEmail;

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
