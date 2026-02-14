"use server"

const SYNC_AUTH_URL = "https://api.sync.com.br/api/partner/v1/auth-token"
const SYNC_GATEWAY_URL = "https://api.sync.com.br/v1/gateway/api"
const CLIENT_ID = "89210cff-1a37-4cd0-825d-45fecd8e77bb"
const CLIENT_SECRET = "dadc1b2c-86ee-4256-845a-d1511de315bb"

let cachedToken: { token: string; expiresAt: number } | null = null

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(SYNC_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
      signal: controller.signal,
      cache: "no-store",
    })

    clearTimeout(timeout)
    const text = await res.text()
    console.log("[v0] Auth response status:", res.status, "length:", text.length)

    if (!res.ok) {
      console.log("[v0] Auth error body:", text.substring(0, 200))
      throw new Error(`Auth failed: ${res.status} - ${text.substring(0, 100)}`)
    }

    const data = JSON.parse(text)
    const token = data.access_token || data.token
    if (!token) throw new Error("No token returned")

    cachedToken = {
      token,
      expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : Date.now() + 3600000,
    }
    return token
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

interface PixInput {
  name: string
  email: string
  amount: number
  planLabel: string
}

export async function createPixPayment(input: PixInput) {
  try {
    const token = await getToken()

    const payload = {
      ip: "127.0.0.1",
      pix: {
        expiresInDays: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      items: [
        {
          title: `Assinatura ${input.planLabel} - Gemeas Scarlatt`,
          quantity: 1,
          tangible: false,
          unitPrice: input.amount,
        },
      ],
      amount: input.amount,
      customer: {
        cpf: "00000000000",
        name: input.name,
        email: input.email,
        phone: "00000000000",
        externaRef: `gemeas-${Date.now()}`,
        address: {
          city: "Sao Paulo",
          state: "SP",
          street: "Rua Exemplo",
          country: "BR",
          zipCode: "01000-000",
          complement: "",
          neighborhood: "Centro",
          streetNumber: "1",
        },
      },
      metadata: {
        provider: "gemeasscarlatt",
        sell_url: "https://gemeasscarlatt.com",
        order_url: "https://gemeasscarlatt.com",
        user_email: input.email,
        user_identitication_number: "00000000000",
      },
      traceable: true,
      postbackUrl: "https://gemeasscarlatt.com/api/webhook",
    }

    console.log("[v0] Sending PIX request...")

    const res = await fetch(SYNC_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const text = await res.text()
    console.log("[v0] PIX status:", res.status, "body:", text.substring(0, 300))

    if (!res.ok) {
      return { success: false, error: `Erro ${res.status}: ${text.substring(0, 100)}` }
    }

    const data = JSON.parse(text)

    if (!data.paymentCode) {
      return { success: false, error: "Codigo PIX nao retornado" }
    }

    return {
      success: true,
      paymentCode: data.paymentCode,
      transactionId: data.idTransaction,
      qrCodeBase64: data.paymentCodeBase64,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido"
    console.log("[v0] createPixPayment error:", message)

    if (message.includes("Invalid request") || message.includes("public URLs")) {
      return {
        success: false,
        error: "O pagamento Pix funciona apenas em producao. Faca o deploy na Vercel para testar.",
      }
    }

    return { success: false, error: message }
  }
}

export async function checkPixStatus(transactionId: string) {
  try {
    const token = await getToken()

    const res = await fetch(`${SYNC_GATEWAY_URL}/${transactionId}`, {
      headers: {
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    const text = await res.text()
    console.log("[v0] Status check:", res.status, text.substring(0, 200))

    if (!res.ok) {
      return { status: "pending" }
    }

    const data = JSON.parse(text)
    return { status: data.status_transaction || data.status || "pending" }
  } catch {
    return { status: "pending" }
  }
}
