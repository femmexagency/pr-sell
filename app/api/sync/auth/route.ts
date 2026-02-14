import { NextResponse } from "next/server"

const SYNC_API_BASE = "https://api.sync.com.br"
const CLIENT_ID = "89210cff-1a37-4cd0-825d-45fecd8e77bb"
const CLIENT_SECRET = "dadc1b2c-86ee-4256-845a-d1511de315bb"

let cachedToken: { token: string; expiresAt: number } | null = null

export async function POST() {
  try {
    // Return cached token if still valid (with 5min buffer)
    if (cachedToken && Date.now() < cachedToken.expiresAt - 300000) {
      return NextResponse.json({ access_token: cachedToken.token })
    }

    const response = await fetch(`${SYNC_API_BASE}/api/partner/v1/auth-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Auth failed:", response.status, errorText)
      return NextResponse.json({ error: "Authentication failed" }, { status: response.status })
    }

    const data = await response.json()

    // Cache the token
    cachedToken = {
      token: data.access_token,
      expiresAt: new Date(data.expires_at).getTime(),
    }

    return NextResponse.json({ access_token: data.access_token })
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
