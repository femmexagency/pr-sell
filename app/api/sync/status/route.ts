import { NextRequest, NextResponse } from "next/server"

const SYNC_API_BASE = "https://api.sync.com.br"
const CLIENT_ID = "89210cff-1a37-4cd0-825d-45fecd8e77bb"
const CLIENT_SECRET = "dadc1b2c-86ee-4256-845a-d1511de315bb"

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAuthToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300000) {
    return cachedToken.token
  }

  const res = await fetch(`${SYNC_API_BASE}/api/partner/v1/auth-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  })

  if (!res.ok) {
    throw new Error("Failed to get auth token")
  }

  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: new Date(data.expires_at).getTime(),
  }
  return data.access_token
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("id")

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })
    }

    const token = await getAuthToken()

    const response = await fetch(
      `${SYNC_API_BASE}/api/partner/v1/transactions/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Status check failed:", response.status, errorText)
      return NextResponse.json({ error: "Status check failed" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      status: data.status,
      amount: data.amount,
      id: data.id,
    })
  } catch (error) {
    console.error("[v0] Status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
