/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    console.log("Generating static homepage OpenGraph image");
    
    // Fetch Tilt Warp font
    const fontResponse = await fetch(
      'https://fonts.googleapis.com/css2?family=Tilt+Warp:wght@400;600;700&display=swap'
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
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#111827', // gray-900
            color: 'white',
            padding: '0px',
            position: 'relative',
            fontFamily: 'Tilt Warp, sans-serif',
          }}
        >
          {/* Background Gradient */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(147, 51, 234, 0.15) 30%, rgba(245, 101, 101, 0.15) 60%, rgba(251, 146, 60, 0.15) 100%)',
              display: 'flex',
            }}
          />

          {/* Main Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              zIndex: 10,
              padding: '40px',
            }}
          >
            {/* EVAL Logo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0px',
            }}>
              <img 
                src={`${baseUrl}/eval/logos/eLOGO_white.png`}
                width="350"
                height="116"
                alt="EVAL Gaming"
                style={{
                  objectFit: 'contain',
                }}
              />
            </div>
            
            {/* Main Headline */}
            <div style={{
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: '1100px',
            }}>
              <h1 style={{ 
                fontSize: '72px', 
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '10px',
                display: 'flex',
                fontFamily: 'Tilt Warp, sans-serif',
                textAlign: 'center',
                lineHeight: '0.9',
                letterSpacing: '-0.02em',
                width: '100%',
                justifyContent: 'center',
              }}>
                CONNECTING <span style={{
                  background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 50%, #f59e0b 100%)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  marginLeft: '30px',
                }}>GAMERS</span>
              </h1>
              <h1 style={{ 
                fontSize: '72px', 
                fontWeight: 'bold',
                color: 'white',
                display: 'flex',
                fontFamily: 'Tilt Warp, sans-serif',
                textAlign: 'center',
                lineHeight: '0.9',
                letterSpacing: '-0.02em',
                width: '100%',
                justifyContent: 'center',
              }}>
                TO SCHOLARSHIPS
              </h1>
            </div>

            {/* Tagline */}
            <div style={{
              marginBottom: '15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <p style={{ 
                fontSize: '28px', 
                color: '#d1d5db', // gray-300
                fontWeight: '500',
                display: 'flex',
                fontFamily: 'Tilt Warp, sans-serif',
                textAlign: 'center',
                marginBottom: '0px',
                letterSpacing: '0.05em',
              }}>
                THE PREMIER COLLEGE ESPORTS
              </p>
              <p style={{ 
                fontSize: '28px', 
                color: '#d1d5db', // gray-300
                fontWeight: '500',
                display: 'flex',
                fontFamily: 'Tilt Warp, sans-serif',
                textAlign: 'center',
                letterSpacing: '0.05em',
              }}>
                RECRUITING PLATFORM
              </p>
            </div>

            {/* Key Features */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '50px',
              marginBottom: '15px',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '22px',
                  color: '#06b6d4', // cyan-500
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  fontFamily: 'Tilt Warp, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  display: 'flex',
                }}>
                  GET RANKED
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#9ca3af', // gray-400
                  fontFamily: 'Tilt Warp, sans-serif',
                  display: 'flex',
                }}>
                  Elite Analytics
                </div>
              </div>

              <div style={{
                width: '2px',
                height: '50px',
                background: 'linear-gradient(180deg, rgba(147, 51, 234, 0.5) 0%, rgba(6, 182, 212, 0.5) 100%)',
                display: 'flex',
              }} />

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '22px',
                  color: '#8b5cf6', // purple-500
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  fontFamily: 'Tilt Warp, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  display: 'flex',
                }}>
                  GET RECRUITED
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#9ca3af', // gray-400
                  fontFamily: 'Tilt Warp, sans-serif',
                  display: 'flex',
                }}>
                  Direct Access to Coaches
                </div>
              </div>

              <div style={{
                width: '2px',
                height: '50px',
                background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.5) 0%, rgba(251, 146, 60, 0.5) 100%)',
                display: 'flex',
              }} />

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '22px',
                  color: '#f59e0b', // amber-500
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  fontFamily: 'Tilt Warp, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  display: 'flex',
                }}>
                  GET SCHOLARSHIPS
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#9ca3af', // gray-400
                  fontFamily: 'Tilt Warp, sans-serif',
                  display: 'flex',
                }}>
                  $50M+ Available
                </div>
              </div>
            </div>

            {/* Supported Games */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '35px',
            }}>
              <div style={{
                fontSize: '14px',
                color: '#6b7280', // gray-500
                fontFamily: 'Tilt Warp, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: '600',
                display: 'flex',
              }}>
                VALORANT
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280', // gray-500
                fontFamily: 'Tilt Warp, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: '600',
                display: 'flex',
              }}>
                ROCKET LEAGUE
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280', // gray-500
                fontFamily: 'Tilt Warp, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: '600',
                display: 'flex',
              }}>
                OVERWATCH 2
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280', // gray-500
                fontFamily: 'Tilt Warp, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: '600',
                display: 'flex',
              }}>
                SMASH ULTIMATE
              </div>
            </div>
          </div>

          {/* Bottom Brand Strip */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 25%, #f59e0b 50%, #ef4444 75%, #8b5cf6 100%)',
              display: 'flex',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fontData ? [
          {
            name: 'Tilt Warp',
            data: fontData,
            weight: 400,
          },
        ] : [],
      }
    );
  } catch (error) {
    console.error('Error generating homepage image:', error);
    return new Response('Error generating image', { status: 500 });
  }
} 