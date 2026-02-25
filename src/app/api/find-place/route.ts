import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const key = searchParams.get("key");

    if (!query || !key) {
      return NextResponse.json(
        { error: "Missing query or API key" },
        { status: 400 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address,rating,user_ratings_total&key=${key}`;

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch place data" },
      { status: 500 }
    );
  }
}
