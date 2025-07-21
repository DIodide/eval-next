/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    console.log("Generating static tryouts combines OpenGraph image");

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
              "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 75%, #1e293b 100%)",
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
                "radial-gradient(circle at 20% 30%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
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
            {/* Tryouts Badge */}
            <div
              style={{
                background:
                  "linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(168, 85, 247, 0.2))",
                border: "1px solid rgba(239, 68, 68, 0.3)",
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
                  background: "linear-gradient(90deg, #ef4444, #a855f7)",
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#ef4444",
                  display: "flex",
                  fontFamily: "Tilt Warp, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                COMBINES
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
                marginBottom: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                maxWidth: "1000px",
              }}
            >
              <h1
                style={{
                  fontSize: "96px",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "15px",
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
                <span style={{ display: "flex", marginBottom: "10px" }}>
                  TRYOUT
                </span>
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #ef4444 0%, #a855f7 50%, #06b6d4 100%)",
                    backgroundClip: "text",
                    color: "transparent",
                    display: "flex",
                  }}
                >
                  COMBINES
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: "48px",
                color: "#d1d5db",
                marginBottom: "60px",
                display: "flex",
                fontFamily: "Tilt Warp, sans-serif",
                textAlign: "center",
                maxWidth: "1000px",
                lineHeight: "1.4",
              }}
            >
              Showcase your skills in competitive events
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
                "linear-gradient(90deg, #ef4444 0%, #a855f7 33%, #06b6d4 66%, #f59e0b 100%)",
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
    console.error("Error generating tryouts combines OpenGraph image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
