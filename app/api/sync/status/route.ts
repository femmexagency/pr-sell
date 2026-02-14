import { NextRequest, NextResponse } from "next/server"

const SYNC_API_BASE = "https://api.sync.com.br"

async function getAuthToken(): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/sync/auth`, { method: "POST" })
  const data = await res.json()
  if (!data.access_token) throw new Error("Failed to get auth token")
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
