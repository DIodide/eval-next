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

interface ProfileClaimedEmailProps {
  coachName: string;
  schoolName: string;
  dashboardUrl: string;
}

export function ProfileClaimedEmail({
  coachName,
  schoolName,
  dashboardUrl,
}: ProfileClaimedEmailProps) {
  const displayName = coachName.trim() || "Coach";

  return (
    <Html>
      <Head />
      <Preview>
        Welcome to EVAL Gaming — your coach profile is ready
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

          <Heading style={heading}>
            Welcome aboard, Coach {displayName}!
          </Heading>

          <Text style={paragraph}>
            You&apos;ve successfully claimed your coach profile for{" "}
            <strong>{schoolName}</strong> on EVAL Gaming. You now have full
            access to manage your program&apos;s presence and connect with
            prospective recruits.
          </Text>

          <Text style={paragraph}>Here&apos;s what you can do next:</Text>

          <Text style={listItem}>
            <strong>Complete your profile</strong> — add program details, roster
            info, and tryout dates
          </Text>
          <Text style={listItem}>
            <strong>View player messages</strong> — check any messages from
            interested players
          </Text>
          <Text style={listItem}>
            <strong>Browse recruits</strong> — search for players that match your
            program&apos;s needs
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Go to Your Dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footerText}>
            You&apos;re receiving this because you claimed your coach profile on
            EVAL Gaming. If you believe this was sent in error, please contact
            support.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ProfileClaimedEmail.PreviewProps = {
  coachName: "Alex Thompson",
  schoolName: "Princeton University",
  dashboardUrl: "https://evalgaming.com/dashboard/coaches",
} satisfies ProfileClaimedEmailProps;

export default ProfileClaimedEmail;

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

const hr = {
  borderColor: "#e6e6e6",
  margin: "24px 0",
};

const footerText = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#999",
};
