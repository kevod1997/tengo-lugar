import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"

// Add this after the baseURL definition
console.log('[Auth Client] baseURL:', baseURL);
console.log('[Auth Client] NEXT_PUBLIC_BETTER_AUTH_URL exists:', !!process.env.NEXT_PUBLIC_BETTER_AUTH_URL);

export const authClient = createAuthClient({
    baseURL,
    plugins: [
        adminClient()
    ]
})