import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

// Dynamic baseURL detection based on current domain
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use current domain
    return window.location.origin
  }
  // Server-side: fallback to env variable
  return process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://localhost:3000"
}

export const authClient = createAuthClient({
    baseURL: getBaseURL(),
    plugins: [
        adminClient()
    ]
})