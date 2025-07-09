/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { api } from '@/trpc/server';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    console.log("Starting school image generation for:", id);
    
    // Fetch school data
    const school = await api.schoolProfile.getById({ id });
    
    if (!school) {
      return new Response('School not found', { status: 404 });
    }
    
    // Get school stats
    const stats = await api.schoolProfile.getStats({ schoolId: id });
    
    // Prepare school data
    const schoolName = school.name;
    const schoolType = school.type.replace('_', ' ');
    const schoolLocation = `${school.location}, ${school.state}`;
    const schoolBio = school.bio ?? `${schoolName} is a ${schoolType.toLowerCase()} esports program committed to competitive excellence and player development.`;
    const schoolLogo = school.logo_url;
    
    // Get stats
    const totalCoaches = stats.totalCoaches ?? 0;
    const totalPlayers = stats.totalPlayers ?? 0;
    const activeTeams = stats.activeTeams ?? 0;
    const upcomingTryouts = stats.upcomingTryouts ?? 0;
    
    console.log("About to generate school ImageResponse");
    
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
            padding: '32px',
            position: 'relative',
            fontFamily: 'Tilt Warp, sans-serif',
          }}
        >
          {/* Top Row - School Header + EVAL Logo */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '24px',
          }}>
            {/* School Info */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '32px',
            }}>
              {/* School Logo */}
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '12px',
                backgroundColor: '#374151', // gray-700
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #06b6d4', // cyan-500
                fontSize: '24px',
                overflow: 'hidden',
              }}>
                {schoolLogo ? (
                  <img 
                    src={schoolLogo}
                    width="100"
                    height="100"
                    alt="School Logo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px',
                    }}
                  />
                ) : (
                  '🏫'
                )}
              </div>
              
              {/* School Name and Details */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}>
                <div style={{ 
                  fontSize: '48px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  display: 'flex',
                  fontFamily: 'Tilt Warp, sans-serif',
                  color: 'white',
                  lineHeight: '1.1',
                }}>
                  {schoolName}
                </div>
                <div style={{ 
                  fontSize: '28px', 
                  color: '#06b6d4', // cyan-500
                  marginBottom: '4px',
                  display: 'flex',
                  fontFamily: 'Tilt Warp, sans-serif',
                }}>
                  {schoolType}
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  color: '#9ca3af', // gray-400
                  display: 'flex',
                  fontFamily: 'Tilt Warp, sans-serif',
                }}>
                  📍 {schoolLocation}
                </div>
              </div>
            </div>
            
            {/* EVAL Logo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
            }}>
              <img 
                src={`${baseUrl}/eval/logos/eLOGO_white.png`}
                width="240"
                height="80"
                alt="EVAL Gaming"
                style={{
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
          
          {/* Middle Row - School Bio */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '24px',
            padding: '24px 32px',
            backgroundColor: '#1f2937', // gray-800
            border: '1px solid #374151', // gray-700
            borderRadius: '12px',
          }}>
            <div style={{
              fontSize: '24px',
              color: '#9ca3af', // gray-400
              marginBottom: '12px',
              display: 'flex',
              fontFamily: 'Tilt Warp, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: '600',
            }}>
              ABOUT THE PROGRAM
            </div>
            <div style={{
              fontSize: '24px',
              color: '#d1d5db', // gray-300
              display: 'flex',
              fontFamily: 'Tilt Warp, sans-serif',
              lineHeight: '1.4',
            }}>
              {schoolBio.length > 200 ? `${schoolBio.substring(0, 200)}...` : schoolBio}
            </div>
          </div>
          
          {/* Bottom Row - Program Stats */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            width: '100%',
          }}>
            {/* Active Coaches */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)', // purple gradient
              border: '1px solid rgba(168, 85, 247, 0.3)', // purple border
              borderRadius: '20px',
              padding: '28px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: '1',
              minWidth: '180px',
            }}>
              <div style={{ 
                fontSize: '24px', 
                color: '#c4b5fd', // purple-300
                marginBottom: '12px',
                display: 'flex',
                fontFamily: 'Tilt Warp, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '600',
              }}>
                COACHES
              </div>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold',
                color: '#e9d5ff', // purple-200
                display: 'flex',
                fontFamily: 'Tilt Warp, sans-serif',
              }}>
                {totalCoaches}
              </div>
            </div>
            
            {/* Active Teams */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.4) 0%, rgba(16, 185, 129, 0.4) 100%)', // green gradient
              border: '1px solid rgba(34, 197, 94, 0.3)', // green border
              borderRadius: '20px',
              padding: '28px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: '1',
              minWidth: '180px',
            }}>
              <div style={{ 
                fontSize: '24px', 
                color: '#86efac', // green-300
                marginBottom: '12px',
                display: 'flex',
                fontFamily: 'Tilt Warp, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '600',
              }}>
                ACTIVE TEAMS
              </div>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold',
                color: '#bbf7d0', // green-200
                display: 'flex',
                fontFamily: 'Tilt Warp, sans-serif',
              }}>
                {activeTeams}
              </div>
            </div>
            
            {/* Total Players */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.4) 100%)', // blue gradient
              border: '1px solid rgba(59, 130, 246, 0.3)', // blue border
              borderRadius: '20px',
              padding: '28px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: '1',
              minWidth: '180px',
            }}>
              <div style={{ 
                fontSize: '24px', 
                color: '#93c5fd', // blue-300
                marginBottom: '12px',
                display: 'flex',
                fontFamily: 'Tilt Warp, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '600',
              }}>
                PLAYERS
              </div>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold',
                color: '#dbeafe', // blue-200
                display: 'flex',
                fontFamily: 'Tilt Warp, sans-serif',
              }}>
                {totalPlayers}
              </div>
            </div>
            
            {/* Upcoming Tryouts */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(153, 27, 27, 0.4) 0%, rgba(220, 38, 38, 0.4) 100%)', // red gradient
              border: '1px solid rgba(239, 68, 68, 0.3)', // red border
              borderRadius: '20px',
              padding: '28px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: '1',
              minWidth: '200px',
            }}>
              <div style={{ 
                fontSize: '24px', 
                color: '#fca5a5', // red-300
                marginBottom: '12px',
                display: 'flex',
                fontFamily: 'Tilt Warp, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '600',
              }}>
                TRYOUTS
              </div>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold',
                color: '#fecaca', // red-200
                display: 'flex',
                fontFamily: 'Tilt Warp, sans-serif',
              }}>
                {upcomingTryouts}
              </div>
            </div>
          </div>
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
    console.error('Error generating school image:', error);
    return new Response('Error generating image', { status: 500 });
  }
} 