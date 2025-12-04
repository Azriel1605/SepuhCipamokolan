"use client"

import { Suspense } from "react"
import ForgotPasswordContent from "./ForgotPasswordContent"

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
