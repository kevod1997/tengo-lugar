import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000"

export const authClient = createAuthClient({
    baseURL,
    plugins: [
        adminClient()
    ]
})