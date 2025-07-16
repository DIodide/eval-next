import { ImageResponse } from "next/og";
import { getPostBySlug, getPostSlugs } from "@/lib/blog";

export const runtime = "nodejs";

// Generate static params for known blog posts
export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return new Response('Missing slug parameter', { status: 400 });
    }

    // Get the blog post data
    const post = getPostBySlug(slug);
    
    if (!post) {
      return new Response('Blog post not found', { status: 404 });
    }

    console.log(`Generating dynamic blog post OpenGraph image for: ${post.title}`);
    
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

    // Format the date
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Truncate title if too long
    const truncatedTitle = post.title.length > 60 ? post.title.substring(0, 60) + '...' : post.title;
    
    // Truncate excerpt if too long
    const truncatedExcerpt = post.excerpt.length > 120 ? post.excerpt.substring(0, 120) + '...' : post.excerpt;

    return new ImageResponse(
      (
        <div style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f0f1a 50%, #1a1a2e 75%, #16213e 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Tilt Warp, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background Elements */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 20% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 50%)',
            display: 'flex',
          }} />
          
          {/* Hexagonal Grid Pattern */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.08,
            background: 'repeating-linear-gradient(60deg, transparent, transparent 10px, #06b6d4 10px, #06b6d4 11px), repeating-linear-gradient(-60deg, transparent, transparent 10px, #8b5cf6 10px, #8b5cf6 11px)',
            display: 'flex',
          }} />
          
          {/* Main Content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            textAlign: 'center',
            padding: '80px 60px',
            maxWidth: '1080px',
          }}>
            {/* EVAL Logo and News Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #f59e0b 100%)',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px',
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.3)',
              }}>
                <div style={{
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  fontFamily: 'Tilt Warp, sans-serif',
                }}>
                  E
                </div>
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: 'white',
                fontFamily: 'Tilt Warp, sans-serif',
                letterSpacing: '3px',
                marginRight: '20px',
              }}>
                EVAL
              </div>
              <div style={{
                backgroundColor: 'rgba(6, 182, 212, 0.2)',
                border: '2px solid #06b6d4',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#06b6d4',
                fontFamily: 'Tilt Warp, sans-serif',
              }}>
                NEWS
              </div>
            </div>
            
            {/* Blog Post Title */}
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              fontFamily: 'Tilt Warp, sans-serif',
              textAlign: 'center',
              lineHeight: '1.1',
              marginBottom: '20px',
              background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 50%, #f59e0b 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}>
              {truncatedTitle}
            </div>
            
            {/* Blog Post Excerpt */}
            <div style={{
              fontSize: '24px',
              color: '#94a3b8',
              fontFamily: 'Tilt Warp, sans-serif',
              textAlign: 'center',
              lineHeight: '1.4',
              marginBottom: '30px',
              maxWidth: '900px',
              fontWeight: 'normal',
            }}>
              {truncatedExcerpt}
            </div>
            
            {/* Author and Date */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '30px',
              fontSize: '18px',
              color: '#64748b',
              fontFamily: 'Tilt Warp, sans-serif',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#8b5cf6',
                  borderRadius: '50%',
                }} />
                <span>By {post.author}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#f59e0b',
                  borderRadius: '50%',
                }} />
                <span>{formattedDate}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#06b6d4',
                  borderRadius: '50%',
                }} />
                <span>{post.readingTime.text}</span>
              </div>
            </div>
          </div>
          
          {/* Bottom Brand Strip */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '8px',
            background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 33%, #f59e0b 66%, #ef4444 100%)',
            display: 'flex',
          }} />
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
    console.error('Error generating blog post OpenGraph image:', error);
    return new Response('Error generating image', { status: 500 });
  }
} 