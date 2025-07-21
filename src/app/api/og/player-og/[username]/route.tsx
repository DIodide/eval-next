/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { api } from "@/trpc/server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    console.log("Starting image generation for:", username);

    // Fetch player data
    const player = await api.playerProfile.getPublicProfile({ username });

    if (!player) {
      return new Response("Player not found", { status: 404 });
    }

    // Get display name
    const displayName =
      player.first_name && player.last_name
        ? `${player.first_name} ${player.last_name}`
        : (player.username ?? "Player");

    // Get EVAL Score from game profiles
    const gameProfile = player.game_profiles?.[0];
    const evalScore = gameProfile?.combine_score?.toFixed(1) ?? "N/A";

    // Get main game info
    const mainGame = player.main_game?.name ?? "Game";

    // Use basic role info from game profiles if available
    const gameRole = gameProfile?.role ?? "Player";

    // Check if main game is Valorant (case-insensitive)
    const isValorantPlayer = mainGame.toLowerCase().includes("valorant");
    console.log("isValorantPlayer", isValorantPlayer);
    console.log("mainGame", mainGame);

    // Get Valorant stats if available and player's main game is Valorant
    let valorantRank = "Rank Available Soon";
    let actualEvalScore = evalScore;
    let valorantGameName = null;
    let valorantTagLine = null;
    let gameWinRate = null;
    let roundWinRate = null;
    let kda = null;

    if (player.id && isValorantPlayer) {
      try {
        const valorantStats = await api.valorantStats.getPlayerStatsByPlayerId({
          playerId: player.id,
        });
        if (valorantStats.success && valorantStats.data) {
          valorantRank = valorantStats.data.stats.rank;
          valorantGameName = valorantStats.data.gameName;
          valorantTagLine = valorantStats.data.tagLine;
          gameWinRate = valorantStats.data.stats.gameWinRate;
          roundWinRate = valorantStats.data.stats.roundWinRate;
          kda = valorantStats.data.stats.kda;

          // Use Valorant API EVAL score if available, otherwise keep the database one
          if (valorantStats.data.stats.evalScore) {
            actualEvalScore = valorantStats.data.stats.evalScore.toFixed(1);
          }
        }
      } catch (error) {
        console.log("Could not fetch Valorant stats:", error);
        // Continue with default values
      }
    }

    // Use avatar URL from player profile if available
    const avatarUrl = player.image_url;

    console.log("About to generate ImageResponse");

    // Fetch Tilt Warp font
    const fontResponse = await fetch(
      "https://fonts.googleapis.com/css2?family=Tilt+Warp:wght@400;600;700&display=swap",
    );
    const fontCss = await fontResponse.text();

    // Extract the font URL from the CSS
    const fontUrlRegex = /url\(([^)]+)\)/;
    const fontUrlMatch = fontUrlRegex.exec(fontCss);
    const fontUrl = fontUrlMatch ? fontUrlMatch[1] : null;

    let fontData;
    if (fontUrl) {
      const fontFileResponse = await fetch(fontUrl);
      fontData = await fontFileResponse.arrayBuffer();
    }

    // Helper function to render game-specific content in bottom row
    const renderGameSpecificStats = () => {
      if (!isValorantPlayer) {
        return null; // No game-specific stats for non-Valorant players
      }

      // Valorant-specific stats
      if (gameWinRate !== null || roundWinRate !== null || kda !== null) {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              width: "100%",
            }}
          >
            {/* K/D/A */}
            {kda && (
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)", // purple gradient
                  border: "1px solid rgba(168, 85, 247, 0.3)", // purple border
                  borderRadius: "20px",
                  padding: "28px 40px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: "1",
                  minWidth: "180px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    color: "#c4b5fd", // purple-300
                    marginBottom: "12px",
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: "600",
                  }}
                >
                  K/D/A
                </div>
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: "#e9d5ff", // purple-200
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                  }}
                >
                  {kda}
                </div>
              </div>
            )}

            {/* Game Win Rate */}
            {gameWinRate && (
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(5, 150, 105, 0.4) 0%, rgba(16, 185, 129, 0.4) 100%)", // green gradient
                  border: "1px solid rgba(34, 197, 94, 0.3)", // green border
                  borderRadius: "20px",
                  padding: "28px 40px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: "1",
                  minWidth: "200px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    color: "#86efac", // green-300
                    marginBottom: "12px",
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: "600",
                  }}
                >
                  GAME WIN %
                </div>
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: "#bbf7d0", // green-200
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                  }}
                >
                  {gameWinRate}
                </div>
              </div>
            )}

            {/* Round Win Rate */}
            {roundWinRate && (
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.4) 100%)", // blue gradient
                  border: "1px solid rgba(59, 130, 246, 0.3)", // blue border
                  borderRadius: "20px",
                  padding: "28px 40px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: "1",
                  minWidth: "200px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    color: "#93c5fd", // blue-300
                    marginBottom: "12px",
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: "600",
                  }}
                >
                  ROUND WIN %
                </div>
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: "#dbeafe", // blue-200
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                  }}
                >
                  {roundWinRate}
                </div>
              </div>
            )}
          </div>
        );
      }

      return null;
    };

    // Helper function to render game-specific account info
    const renderGameAccountInfo = () => {
      if (isValorantPlayer && valorantGameName && valorantTagLine) {
        return (
          <div
            style={{
              fontSize: "32px",
              color: "#fca5a5", // red-300
              display: "flex",
              fontFamily: "Tilt Warp, sans-serif",
            }}
          >
            {valorantGameName}#{valorantTagLine}
          </div>
        );
      }
      // Future: Add other game account info here (Overwatch, Rocket League, etc.)
      return null;
    };

    // Helper function to render game-specific rank
    const renderGameRank = () => {
      if (!isValorantPlayer) {
        return null; // No rank display for non-Valorant players
      }

      return (
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(153, 27, 27, 0.5) 0%, rgba(220, 38, 38, 0.5) 100%)", // red gradient
            border: "1px solid rgba(239, 68, 68, 0.3)", // red border
            borderRadius: "20px",
            padding: "28px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "200px",
            height: "100%",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              color: "#fca5a5", // red-300
              marginBottom: "12px",
              display: "flex",
              fontFamily: "Tilt Warp, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: "600",
            }}
          >
            VALORANT RANK
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#fecaca", // red-200
              textAlign: "center",
              display: "flex",
              fontFamily: "Tilt Warp, sans-serif",
            }}
          >
            {valorantRank}
          </div>
        </div>
      );
    };

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#111827", // gray-900
            color: "white",
            padding: "32px",
            position: "relative",
            fontFamily: "Tilt Warp, sans-serif",
          }}
        >
          {/* Top Row - Player Header + EVAL Logo */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "20px",
            }}
          >
            {/* Player Info */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "24px",
              }}
            >
              {/* Profile Picture */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "40px",
                  backgroundColor: "#374151", // gray-700
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid #06b6d4", // cyan-500
                  fontSize: "32px",
                  overflow: "hidden",
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    width="80"
                    height="80"
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "40px",
                    }}
                  />
                ) : (
                  "👤"
                )}
              </div>

              {/* Name and Username */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    color: "white",
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    color: "#06b6d4", // cyan-500
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                  }}
                >
                  @{username}
                </div>
              </div>
            </div>

            {/* EVAL Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={`${baseUrl}/eval/logos/eLOGO_white.png`}
                width="300"
                height="100"
                alt="EVAL Gaming"
                style={{
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          {/* Middle Row - Game Info + EVAL Score + Rank */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "20px",
              gap: "20px",
            }}
          >
            {/* Left: Game Info */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: "1",
              }}
            >
              {/* Game Info Card */}
              <div
                style={{
                  fontSize: "16px",
                  color: "#d1d5db", // gray-300
                  display: "flex",
                  flexDirection: "column",
                  padding: "24px 32px",
                  backgroundColor: "#1f2937", // gray-800
                  border: "1px solid #374151", // gray-700
                  borderRadius: "8px",
                  fontFamily: "Tilt Warp, sans-serif",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    color: "#9ca3af", // gray-400
                    marginBottom: "8px",
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  MAIN GAME & ROLE
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    color: "#06b6d4", // cyan-400
                    fontWeight: "bold",
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    marginBottom: "8px",
                  }}
                >
                  {mainGame.toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    color: "#d1d5db", // gray-300
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    marginBottom: "8px",
                  }}
                >
                  Role: {gameRole}
                </div>
                {/* Game-specific Account Name */}
                {renderGameAccountInfo()}
              </div>
            </div>

            {/* Center: EVAL Score - Large */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(88, 28, 135, 0.6) 0%, rgba(79, 70, 229, 0.6) 100%)", // stronger purple gradient
                border: "2px solid rgba(147, 51, 234, 0.5)", // stronger purple border
                borderRadius: "20px",
                padding: "40px 50px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "200px",
                boxShadow: "0 12px 40px rgba(88, 28, 135, 0.5)",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  color: "#c084fc", // purple-300
                  marginBottom: "16px",
                  fontWeight: "600",
                  display: "flex",
                  fontFamily: "Tilt Warp, sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                EVAL SCORE
              </div>
              <div
                style={{
                  fontSize: "96px",
                  fontWeight: "bold",
                  color: "#ddd6fe", // purple-200
                  display: "flex",
                  fontFamily: "Tilt Warp, sans-serif",
                  lineHeight: "0.9",
                }}
              >
                {actualEvalScore}
              </div>
            </div>

            {/* Right: Game Rank */}
            {renderGameRank()}
          </div>

          {/* Bottom Row - Game Stats */}
          {renderGameSpecificStats()}
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fontData
          ? [
              {
                name: "Tilt Warp",
                data: fontData,
                weight: 400,
              },
            ]
          : [],
      },
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
