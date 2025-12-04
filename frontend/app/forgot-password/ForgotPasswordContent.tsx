"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, Lock } from "lucide-react"
import Link from "next/link"
import { authAPI } from "@/lib/api"

export default function ForgotPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await authAPI.forgotPassword(email)
      const data = await response.json()

      if (response.ok) {
        setMessage("Link reset password telah dikirim ke email Anda.")
        setIsSuccess(true)
      } else {
        setError(data.message || "Terjadi kesalahan.")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    if (newPassword !== confirmPassword) {
      setError("Password tidak cocok.")
      setIsLoading(false)
      return
    }

    if (!token) {
      setError("Token tidak valid atau tidak ditemukan.")
      setIsLoading(false)
      return
    }

    try {
      const response = await authAPI.resetPassword(token, newPassword)
      const data = await response.json()

      if (response.ok) {
        setMessage("Password Anda berhasil diperbarui.")
        setIsSuccess(true)
        setTimeout(() => router.push("/login"), 3000)
      } else {
        setError(data.message || "Gagal memperbarui password.")
      }
    } catch {
      setError("Something wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SI</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {token ? "Buat Password Baru" : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-center">
            {token
              ? "Masukkan password baru Anda di bawah ini."
              : "Masukkan email untuk mendapatkan link reset password"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {!isSuccess && (
            <form onSubmit={token ? handleResetPasswordSubmit : handleEmailSubmit} className="space-y-4">
              {!token ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Masukkan email Anda"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Memproses..." : token ? "Simpan Password Baru" : "Kirim Link Reset"}
              </Button>
            </form>
          )}

          {!token && (
            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali ke Login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
