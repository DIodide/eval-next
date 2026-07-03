import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface CoachIntroEmailProps {
  coachName: string;
  schoolName: string;
  claimUrl: string;
  learnMoreUrl: string;
}

export function CoachIntroEmail({
  coachName,
  schoolName,
  claimUrl,
  learnMoreUrl = "https://evalgaming.com/about",
}: CoachIntroEmailProps) {
  const displayName = coachName.trim() || "Coach";

  return (
    <Html>
      <Head />
      <Preview>
        Student players are already exploring your esports program on EVAL
        Gaming
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

          <Heading style={heading}>Hi Coach {displayName},</Heading>

          <Text style={paragraph}>
            Student players are already exploring E-sportsprograms like{" "}
            <strong>{schoolName}&apos;s</strong> on EVAL Gaming — so we&apos;ve
            added your esports program to ensure they can find and connect with
            it.
          </Text>

          <Text style={paragraph}>
            {/* EVAL Gaming is the platform connecting high school esports athletes
            with college programs. Coaches who claim their profile can message
            recruits, post tryouts, and manage their program&apos;s presence in
            one place. */}
            Players are actively browsing programs like yours and may want to
            reach out. Claim your coach profile to manage your program&apos;s
            presence and connect with prospective recruits directly.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={claimUrl}>
              Claim Your Coach Profile
            </Button>
          </Section>

          <Text style={learnMoreText}>
            Not sure what EVAL Gaming is?{" "}
            <Link href={learnMoreUrl} style={learnMoreLink}>
              Learn more about how it works
            </Link>
          </Text>

          <Hr style={hr} />

          <Text style={footerText}>
            EVAL Gaming helps talented esports athletes get recruited by college
            programs. If you believe this was sent in error, you can ignore this
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

CoachIntroEmail.PreviewProps = {
  coachName: "Alex Thompson",
  schoolName: "Princeton University",
  claimUrl: "https://evalgaming.com/sign-up/schools",
  learnMoreUrl: "https://evalgaming.com/about",
} satisfies CoachIntroEmailProps;

export default CoachIntroEmail;

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

const learnMoreText = {
  fontSize: "14px",
  color: "#666",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const learnMoreLink = {
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
