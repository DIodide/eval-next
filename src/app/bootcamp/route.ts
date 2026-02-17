import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect(
    "https://app.mindsmith.ai/course/cmlpoypi103tkkt04jkbv89js/learn",
    307 // temporary
  );
}
