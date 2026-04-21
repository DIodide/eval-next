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

interface WeeklyDigestEmailProps {
  coachName: string;
  schoolName: string;
  profileViews: number;
  newMessages: number;
  newInterested: number;
  dashboardUrl: string;
}

export function WeeklyDigestEmail({
  coachName,
  schoolName,
  profileViews,
  newMessages,
  newInterested,
  dashboardUrl,
}: WeeklyDigestEmailProps) {
  const displayName = coachName.trim() || "Coach";

  return (
    <Html>
      <Head />
      <Preview>
        Your weekly EVAL Gaming recap for {schoolName}
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

          <Heading style={heading}>Your Weekly Recap</Heading>

          <Text style={paragraph}>
            Hi {displayName}, here&apos;s what happened with{" "}
            <strong>{schoolName}</strong>&apos;s esports program this week on
            EVAL Gaming.
          </Text>

          {/* Stats cards */}
          <Section style={statsContainer}>
            <Section style={statCard}>
              <Text style={statNumber}>{profileViews}</Text>
              <Text style={statLabel}>Profile Views</Text>
            </Section>
            <Section style={statCard}>
              <Text style={statNumber}>{newMessages}</Text>
              <Text style={statLabel}>New Messages</Text>
            </Section>
            <Section style={statCard}>
              <Text style={statNumber}>{newInterested}</Text>
              <Text style={statLabel}>Interested Players</Text>
            </Section>
          </Section>

          <Text style={paragraph}>
            {newMessages > 0
              ? "You have unread messages from players — don't leave them waiting!"
              : "No new messages this week. Keep your profile updated to attract more recruits."}
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              View Full Dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footerText}>
            You&apos;re receiving this weekly digest because you&apos;re a coach
            on EVAL Gaming. Manage your notification preferences in your
            dashboard settings.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

WeeklyDigestEmail.PreviewProps = {
  coachName: "Alex Thompson",
  schoolName: "Princeton University",
  profileViews: 24,
  newMessages: 3,
  newInterested: 7,
  dashboardUrl: "https://evalgaming.com/dashboard/coaches",
} satisfies WeeklyDigestEmailProps;

export default WeeklyDigestEmail;

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

const statsContainer = {
  margin: "24px 0",
  textAlign: "center" as const,
};

const statCard = {
  display: "inline-block" as const,
  width: "30%",
  textAlign: "center" as const,
  padding: "12px 4px",
  verticalAlign: "top" as const,
};

const statNumber = {
  fontSize: "28px",
  fontWeight: "700" as const,
  color: "#7c3aed",
  margin: "0 0 4px",
};

const statLabel = {
  fontSize: "13px",
  color: "#666",
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
