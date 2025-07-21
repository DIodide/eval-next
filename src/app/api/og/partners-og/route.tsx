/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    console.log("Generating static partners OpenGraph image");

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
            background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)", // gray-900 to gray-800
            color: "white",
            padding: "40px",
            position: "relative",
            fontFamily: "Tilt Warp, sans-serif",
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 50% 90%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)",
              display: "flex",
            }}
          />

          {/* Header with EVAL Logo */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "35px",
              position: "relative",
              zIndex: 10,
            }}
          >
            {/* Partnership Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background:
                  "linear-gradient(90deg, rgba(6, 182, 212, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)",
                border: "1px solid rgba(6, 182, 212, 0.4)",
                borderRadius: "25px",
                padding: "12px 24px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                🤝
              </div>
              <span
                style={{
                  fontSize: "16px",
                  color: "#06b6d4",
                  fontWeight: "600",
                  letterSpacing: "0.1em",
                  display: "flex",
                  fontFamily: "Tilt Warp, sans-serif",
                }}
              >
                BUILDING THE FUTURE TOGETHER
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

          {/* Main Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              flex: "1",
              gap: "50px",
              position: "relative",
              zIndex: 10,
            }}
          >
            {/* Left Side - Main Messaging */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: "1",
                alignItems: "flex-start",
              }}
            >
              {/* Main Headline */}
              <div
                style={{
                  marginBottom: "35px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <h1
                  style={{
                    fontSize: "72px",
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: "8px",
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    lineHeight: "0.9",
                    letterSpacing: "-0.01em",
                  }}
                >
                  OUR
                </h1>
                <h1
                  style={{
                    fontSize: "72px",
                    fontWeight: "bold",
                    background:
                      "linear-gradient(90deg, #06b6d4 0%, #8b5cf6 50%, #f59e0b 100%)",
                    backgroundClip: "text",
                    color: "transparent",
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    lineHeight: "0.9",
                    letterSpacing: "-0.01em",
                  }}
                >
                  PARTNERS
                </h1>
              </div>

              {/* Tagline */}
              <div
                style={{
                  fontSize: "28px",
                  color: "#d1d5db", // gray-300
                  marginBottom: "20px",
                  fontWeight: "400",
                  display: "flex",
                  fontFamily: "Tilt Warp, sans-serif",
                  lineHeight: "1.3",
                }}
              >
                Collaborating with industry leaders
              </div>

              <div
                style={{
                  fontSize: "28px",
                  color: "#d1d5db", // gray-300
                  marginBottom: "25px",
                  fontWeight: "400",
                  display: "flex",
                  fontFamily: "Tilt Warp, sans-serif",
                  lineHeight: "1.3",
                }}
              >
                to create unprecedented opportunities
              </div>

              <div
                style={{
                  fontSize: "28px",
                  color: "#06b6d4", // cyan-400
                  fontWeight: "600",
                  display: "flex",
                  fontFamily: "Tilt Warp, sans-serif",
                }}
              >
                for esports talent worldwide
              </div>
            </div>

            {/* Right Side - Partnership Features */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                minWidth: "400px",
              }}
            >
              {/* Educational Institutions */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)",
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                  borderRadius: "16px",
                  padding: "20px 28px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    display: "flex",
                  }}
                >
                  🎓
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#06b6d4",
                      marginBottom: "4px",
                      fontWeight: "600",
                      display: "flex",
                      fontFamily: "Tilt Warp, sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    EDUCATIONAL
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      color: "white",
                      fontWeight: "500",
                      display: "flex",
                      fontFamily: "Tilt Warp, sans-serif",
                    }}
                  >
                    Universities & Schools
                  </div>
                </div>
              </div>

              {/* Gaming Organizations */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "16px",
                  padding: "20px 28px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    display: "flex",
                  }}
                >
                  👥
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#8b5cf6",
                      marginBottom: "4px",
                      fontWeight: "600",
                      display: "flex",
                      fontFamily: "Tilt Warp, sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    GAMING
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      color: "white",
                      fontWeight: "500",
                      display: "flex",
                      fontFamily: "Tilt Warp, sans-serif",
                    }}
                  >
                    Esports Organizations
                  </div>
                </div>
              </div>

              {/* Technology Partners */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: "16px",
                  padding: "20px 28px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    display: "flex",
                  }}
                >
                  💻
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#f59e0b",
                      marginBottom: "4px",
                      fontWeight: "600",
                      display: "flex",
                      fontFamily: "Tilt Warp, sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    TECHNOLOGY
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      color: "white",
                      fontWeight: "500",
                      display: "flex",
                      fontFamily: "Tilt Warp, sans-serif",
                    }}
                  >
                    Platform Integrations
                  </div>
                </div>
              </div>

              {/* Corporate Sponsors */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "16px",
                  padding: "20px 28px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    display: "flex",
                  }}
                >
                  🏢
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#ef4444",
                      marginBottom: "4px",
                      fontWeight: "600",
                      display: "flex",
                      fontFamily: "Tilt Warp, sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    CORPORATE
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      color: "white",
                      fontWeight: "500",
                      display: "flex",
                      fontFamily: "Tilt Warp, sans-serif",
                    }}
                  >
                    Brand Partnerships
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Brand Strip */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
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
    console.error("Error generating partners image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
