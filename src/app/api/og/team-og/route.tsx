/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    console.log("Generating static team OpenGraph image");

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
            backgroundColor: "#111827", // gray-900
            color: "white",
            padding: "40px",
            position: "relative",
            fontFamily: "Tilt Warp, sans-serif",
            background:
              "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: "absolute",
              inset: "0",
              background:
                "radial-gradient(circle at 30% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
              display: "flex",
            }}
          />

          {/* Header with EVAL Logo */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "30px",
              position: "relative",
              zIndex: "10",
            }}
          >
            {/* "By Gamers, For Gamers" Badge */}
            <div
              style={{
                background:
                  "linear-gradient(90deg, rgba(6, 182, 212, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                borderRadius: "20px",
                padding: "12px 24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(90deg, #06b6d4 0%, #a855f7 100%)",
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontSize: "16px",
                  color: "#06b6d4",
                  fontWeight: "600",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "Tilt Warp, sans-serif",
                }}
              >
                BY GAMERS, FOR GAMERS
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
                width="250"
                height="83"
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
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              flex: "1",
              justifyContent: "center",
              position: "relative",
              zIndex: "10",
              marginTop: "-20px",
            }}
          >
            {/* Main Title */}
            <h1
              style={{
                fontSize: "80px",
                fontWeight: "bold",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontFamily: "Tilt Warp, sans-serif",
                lineHeight: "0.9",
                letterSpacing: "-0.02em",
              }}
            >
              <span
                style={{
                  color: "white",
                  display: "flex",
                }}
              >
                MEET THE
              </span>
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #06b6d4 0%, #a855f7 50%, #f59e0b 100%)",
                  backgroundClip: "text",
                  color: "transparent",
                  display: "flex",
                }}
              >
                TEAM
              </span>
            </h1>

            {/* Subtitle */}
            <div
              style={{
                marginBottom: "30px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: "32px",
                  color: "#d1d5db", // gray-300
                  fontFamily: "Tilt Warp, sans-serif",
                  textAlign: "center",
                  lineHeight: "1.2",
                  marginBottom: "0px",
                  letterSpacing: "0.02em",
                }}
              >
                The passionate leaders behind EVAL
              </p>
            </div>

            {/* Key Highlights */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: "40px",
                marginBottom: "30px",
              }}
            >
              {/* Princeton Badge */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%)",
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  borderRadius: "20px",
                  padding: "20px 30px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "180px",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    color: "#93c5fd", // blue-300
                    marginBottom: "8px",
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: "600",
                  }}
                >
                  EDUCATED AT
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#dbeafe", // blue-200
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                  }}
                >
                  PRINCETON
                </div>
              </div>

              {/* D1 Athletes Badge */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)",
                  border: "1px solid rgba(168, 85, 247, 0.4)",
                  borderRadius: "20px",
                  padding: "20px 30px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "180px",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    color: "#c4b5fd", // purple-300
                    marginBottom: "8px",
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: "600",
                  }}
                >
                  CURRENT
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#e9d5ff", // purple-200
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                  }}
                >
                  D1 ATHLETES
                </div>
              </div>

              {/* Gaming Experience Badge */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(16, 185, 129, 0.3) 100%)",
                  border: "1px solid rgba(34, 197, 94, 0.4)",
                  borderRadius: "20px",
                  padding: "20px 30px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "180px",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    color: "#86efac", // green-300
                    marginBottom: "8px",
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: "600",
                  }}
                >
                  EXPERIENCE
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#bbf7d0", // green-200
                    display: "flex",
                    fontFamily: "Tilt Warp, sans-serif",
                  }}
                >
                  10+ YEARS
                </div>
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
                "linear-gradient(90deg, #06b6d4 0%, #a855f7 50%, #f59e0b 100%)",
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
    console.error("Error generating team image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
