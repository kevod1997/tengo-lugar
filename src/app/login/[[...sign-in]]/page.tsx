'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { SignIn } from "@clerk/nextjs"
import { useSearchParams } from 'next/navigation'

const DynamicSignIn = dynamic(() => Promise.resolve(SignIn), {
  ssr: false
})

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)

  useEffect(() => {
    const redirect = searchParams.get('redirect_url')
    if (redirect) {
      const encodedRedirect = encodeURIComponent(redirect)
      setRedirectUrl(`/auth-redirect?redirect_url=${encodedRedirect}`)
    }
  }, [searchParams])

  return (
    <div className="flex justify-center mt-10">
      <DynamicSignIn
        signUpUrl="/registro"
        forceRedirectUrl={redirectUrl}
      />
    </div>
  )
}