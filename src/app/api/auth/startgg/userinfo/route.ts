import { type NextRequest, NextResponse } from "next/server";

// Types for start.gg GraphQL response
interface StartGGLocation {
  country: string | null;
  state: string | null;
  city: string | null;
}

interface StartGGImage {
  url: string;
  type: string;
}

interface StartGGPlayer {
  gamerTag: string | null;
}

interface StartGGUser {
  id: number;
  slug: string;
  player?: StartGGPlayer;
  name: string | null;
  bio: string | null;
  birthday: string | null;
  genderPronoun: string | null;
  location: StartGGLocation | null;
  images: StartGGImage[] | null;
}

interface StartGGGraphQLResponse {
  data?: {
    currentUser: StartGGUser | null;
  };
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from Clerk's request
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 },
      );
    }

    // Extract the access token from the authorization header
    const accessToken = authorization.replace("Bearer ", "");

    // Make GraphQL request to start.gg
    const graphqlQuery = {
      query: `
        query {
          currentUser {
            id
            slug
            player {
              gamerTag
            }
            name
            bio
            birthday
            genderPronoun
            location {
              country
              state
              city
            }
            images {
              url
              type
            }
          }
        }
      `,
    };

    const startggResponse = await fetch("https://api.start.gg/gql/alpha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!startggResponse.ok) {
      console.error(
        "start.gg API error:",
        startggResponse.status,
        startggResponse.statusText,
      );
      return NextResponse.json(
        { error: "Failed to fetch user data from start.gg" },
        { status: startggResponse.status },
      );
    }

    const data = (await startggResponse.json()) as StartGGGraphQLResponse;
    console.log("start.gg GraphQL response:", data);

    if (data.errors) {
      console.error("start.gg GraphQL errors:", data.errors);
      return NextResponse.json(
        { error: "GraphQL errors from start.gg", details: data.errors },
        { status: 400 },
      );
    }

    const user = data.data?.currentUser;

    if (!user) {
      return NextResponse.json(
        { error: "No user data returned from start.gg" },
        { status: 404 },
      );
    }

    // Convert GraphQL response to REST format for Clerk
    const restResponse = {
      id: user.id?.toString(),
      sub: user.id?.toString(), // Standard OIDC subject identifier
      slug: user.slug,
      name: user.name ?? user.player?.gamerTag ?? user.slug,
      preferred_username: user.slug,
      nickname: user.player?.gamerTag ?? user.slug,
      bio: user.bio,
      birthdate: user.birthday,
      gender: user.genderPronoun,
      locale: user.location
        ? `${user.location.city}, ${user.location.state}, ${user.location.country}`
        : null,
      picture: user.images?.find((img: StartGGImage) => img.type === "profile")
        ?.url,
      // Custom start.gg specific fields
      start_gg_id: user.id?.toString(),
      start_gg_slug: user.slug,
      gamer_tag: user.player?.gamerTag,
      location: user.location,
      images: user.images,
    };

    // Remove null/undefined values
    const cleanedResponse = Object.fromEntries(
      Object.entries(restResponse).filter(([_, value]) => value != null),
    );

    console.log("Proxy response for Clerk:", cleanedResponse);

    return NextResponse.json(cleanedResponse);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error in start.gg proxy" },
      { status: 500 },
    );
  }
}
