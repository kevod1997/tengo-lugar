import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://localhost:3000"

export const authClient = createAuthClient({
    baseURL,
    plugins: [
        adminClient()
    ]
})