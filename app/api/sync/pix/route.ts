import { NextRequest, NextResponse } from "next/server"

const SYNC_API_BASE = "https://api.sync.com.br"
const CLIENT_ID = "89210cff-1a37-4cd0-825d-45fecd8e77bb"
const CLIENT_SECRET = "dadc1b2c-86ee-4256-845a-d1511de315bb"

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAuthToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300000) {
    return cachedToken.token
  }

  const authUrl = `${SYNC_API_BASE}/api/partner/v1/auth-token`
  console.log("[v0] Requesting auth token from:", authUrl)

  const res = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  })

  const responseText = await res.text()
  console.log("[v0] Auth response status:", res.status)
  console.log("[v0] Auth response body:", responseText)

  if (!res.ok) {
    throw new Error(`Auth failed: ${res.status} - ${responseText}`)
  }

  let data
  try {
    data = JSON.parse(responseText)
  } catch {
    throw new Error(`Auth returned invalid JSON: ${responseText}`)
  }

  const token = data.access_token || data.token || data.data?.access_token
  if (!token) {
    console.log("[v0] Auth response keys:", Object.keys(data))
    throw new Error(`No token in auth response: ${responseText}`)
  }

  cachedToken = {
    token: token,
    expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : Date.now() + 3600000,
  }
  return token
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, amount, plan } = body

    if (!name || !email || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const token = await getAuthToken()

    // Calculate expiration (30 minutes from now)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30)

    const pixPayload = {
      ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
      pix: {
        expiresInDays: expiresAt.toISOString().split("T")[0],
      },
      items: [
        {
          title: `Assinatura Gemeas Scarlatt - ${plan || "Mensal"}`,
          quantity: 1,
          tangible: false,
          unitPrice: amount,
        },
      ],
      amount: amount,
      customer: {
        cpf: "00000000000",
        name: name,
        email: email,
        phone: "",
        externaRef: `GS-${Date.now()}`,
        address: {
          city: "Sao Paulo",
          state: "SP",
          street: "N/A",
          country: "BR",
          zipCode: "00000-000",
          complement: "",
          neighborhood: "N/A",
          streetNumber: "0",
        },
      },
      metadata: {
        provider: "GemeasScarlatt",
        sell_url: typeof request.headers.get("referer") === "string" ? request.headers.get("referer") : "https://gemeasscarlatt.com",
        order_url: "https://gemeasscarlatt.com",
        user_email: email,
        user_identitication_number: "00000000000",
      },
      traceable: true,
      postbackUrl: "https://gemeasscarlatt.com/api/sync/webhook",
    }

    console.log("[v0] Sending PIX request with token:", token.substring(0, 20) + "...")
    console.log("[v0] PIX payload amount:", pixPayload.amount)

    const response = await fetch(`${SYNC_API_BASE}/v1/gateway/api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pixPayload),
    })

    const pixResponseText = await response.text()
    console.log("[v0] PIX response status:", response.status)
    console.log("[v0] PIX response body:", pixResponseText)

    if (!response.ok) {
      return NextResponse.json({ error: `Payment request failed: ${pixResponseText}` }, { status: response.status })
    }

    let data
    try {
      data = JSON.parse(pixResponseText)
    } catch {
      return NextResponse.json({ error: `Invalid response from payment provider: ${pixResponseText}` }, { status: 500 })
    }

    return NextResponse.json({
      status: data.status,
      paymentCode: data.paymentCode,
      paymentCodeBase64: data.paymentCodeBase64,
      idTransaction: data.idTransaction,
      statusTransaction: data.status_transaction,
    })
  } catch (error) {
    console.error("[v0] PIX error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
