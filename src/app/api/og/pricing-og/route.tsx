/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    console.log("Generating static pricing OpenGraph image");

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

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 75%, #1e293b 100%)", // dark gradient
            color: "white",
            padding: "40px",
            position: "relative",
            fontFamily: "Tilt Warp, sans-serif",
          }}
        >
          {/* Subtle Background Pattern */}
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              background:
                "radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(245, 158, 11, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
              display: "flex",
            }}
          />

          {/* Top Row - Badge + EVAL Logo */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "0px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Pricing Badge */}
            <div
              style={{
                background:
                  "linear-gradient(90deg, rgba(245, 158, 11, 0.2), rgba(139, 92, 246, 0.2))",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "50px",
                padding: "16px 32px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "12px",
                  background: "linear-gradient(90deg, #f59e0b, #8b5cf6)",
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#f59e0b",
                  display: "flex",
                  fontFamily: "Tilt Warp, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                PRICING PLANS
              </span>
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
                width="280"
                height="93"
                alt="EVAL Gaming"
                style={{
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              flex: "1",
              justifyContent: "center",
              position: "relative",
              zIndex: 1,
              marginBottom: "0px",
            }}
          >
            {/* Main Headline */}
            <div
              style={{
                marginBottom: "15px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                maxWidth: "900px",
              }}
            >
              <h1
                style={{
                  fontSize: "56px",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  fontFamily: "Tilt Warp, sans-serif",
                  textAlign: "center",
                  lineHeight: "0.95",
                  letterSpacing: "-0.01em",
                  width: "100%",
                }}
              >
                <span style={{ display: "flex", marginBottom: "8px" }}>
                  CHOOSE YOUR
                </span>
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #06b6d4 0%, #8b5cf6 50%, #f59e0b 100%)",
                    backgroundClip: "text",
                    color: "transparent",
                    display: "flex",
                  }}
                >
                  ESPORTS PLAN
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: "24px",
                color: "#d1d5db", // gray-300
                marginBottom: "25px",
                display: "flex",
                fontFamily: "Tilt Warp, sans-serif",
                textAlign: "center",
                maxWidth: "700px",
                lineHeight: "1.4",
              }}
            >
              Elevate your esports journey with plans for players, coaches, and
              leagues
            </div>

            {/* Pricing Tiers */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "flex-start",
                gap: "25px",
                marginBottom: "20px",
                width: "100%",
                maxWidth: "1000px",
              }}
            >
              {/* Free Tier */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(14, 165, 233, 0.2) 100%)",
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                  borderRadius: "16px",
                  padding: "18px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: "1",
                  minWidth: "200px",
                  maxWidth: "280px",
                  minHeight: "150px",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    color: "#67e8f9", // cyan-300
                    marginBottom: "6px",
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: "600",
                  }}
                >
                  FREE
                </div>
                <div
                  style={{
                    fontSize: "42px",
                    fontWeight: "bold",
                    color: "#a5f3fc", // cyan-200
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    marginBottom: "4px",
                    lineHeight: "1",
                  }}
                >
                  $0
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#a5f3fc", // cyan-200
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    textAlign: "center",
                    lineHeight: "1.2",
                  }}
                >
                  Forever free for players
                </div>
              </div>

              {/* Gold Tier */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.2) 100%)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: "16px",
                  padding: "18px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: "1",
                  minWidth: "200px",
                  maxWidth: "280px",
                  minHeight: "150px",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    color: "#fcd34d", // yellow-300
                    marginBottom: "6px",
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: "600",
                  }}
                >
                  GOLD
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: "#fef3c7", // yellow-100
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    marginBottom: "4px",
                    lineHeight: "1",
                  }}
                >
                  Coming Soon
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#fef3c7", // yellow-100
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    textAlign: "center",
                    lineHeight: "1.2",
                  }}
                >
                  Enhanced recruiting tools
                </div>
              </div>

              {/* Platinum Tier */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "16px",
                  padding: "18px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: "1",
                  minWidth: "200px",
                  maxWidth: "280px",
                  minHeight: "150px",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    color: "#c4b5fd", // purple-300
                    marginBottom: "6px",
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: "600",
                  }}
                >
                  PLATINUM
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: "#ddd6fe", // purple-200
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    marginBottom: "4px",
                    lineHeight: "1",
                  }}
                >
                  Coming Soon
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#ddd6fe", // purple-200
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    textAlign: "center",
                    lineHeight: "1.2",
                  }}
                >
                  Complete recruiting solution
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: "25px",
                width: "100%",
                maxWidth: "800px",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  color: "#9ca3af", // gray-400
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "Tilt Warp, sans-serif",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "4px",
                    background: "#06b6d4",
                    display: "flex",
                  }}
                />
                Player Profiles
              </div>
              <div
                style={{
                  fontSize: "16px",
                  color: "#9ca3af", // gray-400
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "Tilt Warp, sans-serif",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "4px",
                    background: "#f59e0b",
                    display: "flex",
                  }}
                />
                Analytics & Rankings
              </div>
              <div
                style={{
                  fontSize: "16px",
                  color: "#9ca3af", // gray-400
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "Tilt Warp, sans-serif",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "4px",
                    background: "#8b5cf6",
                    display: "flex",
                  }}
                />
                Recruiting Tools
              </div>
            </div>
          </div>

          {/* Bottom Brand Strip */}
          <div
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              right: "0",
              height: "8px",
              background:
                "linear-gradient(90deg, #06b6d4 0%, #8b5cf6 33%, #f59e0b 66%, #ef4444 100%)",
              display: "flex",
            }}
          />
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
    console.error("Error generating pricing OpenGraph image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
