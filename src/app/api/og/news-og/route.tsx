import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    console.log("Generating static news OpenGraph image");

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
            width: "1200px",
            height: "630px",
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f0f1a 50%, #1a1a2e 75%, #16213e 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Tilt Warp, sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background Elements */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background:
                "radial-gradient(circle at 20% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 50%)",
              display: "flex",
            }}
          />

          {/* Hexagonal Grid Pattern */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              opacity: 0.1,
              background:
                "repeating-linear-gradient(60deg, transparent, transparent 10px, #06b6d4 10px, #06b6d4 11px), repeating-linear-gradient(-60deg, transparent, transparent 10px, #8b5cf6 10px, #8b5cf6 11px)",
              display: "flex",
            }}
          />

          {/* Main Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              textAlign: "center",
              padding: "60px",
            }}
          >
            {/* Main Title */}
            <div
              style={{
                fontSize: "72px",
                fontWeight: "bold",
                fontFamily: "Tilt Warp, sans-serif",
                textAlign: "center",
                lineHeight: "1.1",
                marginBottom: "30px",
                background:
                  "linear-gradient(90deg, #06b6d4 0%, #8b5cf6 50%, #f59e0b 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              EVAL NEWS
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: "32px",
                color: "#94a3b8",
                fontFamily: "Tilt Warp, sans-serif",
                textAlign: "center",
                lineHeight: "1.3",
                maxWidth: "800px",
                fontWeight: "normal",
              }}
            >
              Stay updated with insights, platform updates, and industry news
            </div>

            {/* Decorative Elements */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginTop: "40px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "4px",
                  background:
                    "linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)",
                  borderRadius: "2px",
                }}
              />
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  background: "#f59e0b",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  width: "60px",
                  height: "4px",
                  background:
                    "linear-gradient(90deg, #8b5cf6 0%, #f59e0b 100%)",
                  borderRadius: "2px",
                }}
              />
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
    console.error("Error generating news OpenGraph image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
