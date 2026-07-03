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

interface PlayerMessageEmailProps {
  coachName: string;
  playerName: string;
  playerGame?: string | null;
  playerRank?: string | null;
  playerGpa?: string | null;
  messagePreview: string;
  viewUrl: string;
}

export function PlayerMessageEmail({
  coachName,
  playerName,
  playerGame,
  playerRank,
  playerGpa,
  messagePreview,
  viewUrl,
}: PlayerMessageEmailProps) {
  const displayName = coachName.trim() || "Coach";
  const truncatedPreview =
    messagePreview.length > 120
      ? messagePreview.slice(0, 120) + "..."
      : messagePreview;

  return (
    <Html>
      <Head />
      <Preview>
        {playerName} sent you a message on EVAL Gaming
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

          <Heading style={heading}>New message from a player</Heading>

          <Text style={paragraph}>
            Hi {displayName}, a player reached out to your E-sports program on EVAL Gaming.
          </Text>

          {/* Player card */}
          <Section style={playerCard}>
            <Text style={playerCardName}>{playerName}</Text>
            {playerGame && (
              <Text style={playerCardDetail}>
                Game: {playerGame}
                {playerRank ? ` | Rank: ${playerRank}` : ""}
              </Text>
            )}
            {playerGpa && (
              <Text style={playerCardDetail}>GPA: {playerGpa}</Text>
            )}
          </Section>

          {/* Message preview */}
          <Section style={messageBox}>
            <Text style={messageText}>&ldquo;{truncatedPreview}&rdquo;</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={viewUrl}>
              View Message on EVAL
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footerText}>
            Sign up on EVAL Gaming to view the full message and respond to this
            player. Explore detailed player profiles to find the right fit for your program only on EVAL Gaming.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

PlayerMessageEmail.PreviewProps = {
  coachName: "Alex Thompson",
  playerName: "Jordan Lee",
  playerGame: "Valorant",
  playerRank: "Diamond 2",
  playerGpa: "3.8",
  messagePreview:
    "Hi Coach Thompson, I'm a junior looking to play esports at the collegiate level. I've been playing Valorant for 3 years and currently ranked Diamond. Would love to learn more about your program.",
  viewUrl: "https://evalgaming.com/sign-up/coaches",
} satisfies PlayerMessageEmailProps;

export default PlayerMessageEmail;

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

const playerCard = {
  backgroundColor: "#f8f5ff",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
  border: "1px solid #e9e0ff",
};

const playerCardName = {
  fontSize: "18px",
  fontWeight: "600" as const,
  color: "#1a1a1a",
  margin: "0 0 4px",
};

const playerCardDetail = {
  fontSize: "14px",
  color: "#666",
  margin: "0 0 2px",
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
