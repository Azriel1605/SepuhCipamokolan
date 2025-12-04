"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FileUp, Upload, Download } from "lucide-react"
import { dataAPI } from "@/lib/api"

const ExcelUploadSection = React.memo(() => {
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const [dialogMessage, setDialogMessage] = useState("")
  

  const handleDownloadTemplate = async () => {
    try {
      const response = await dataAPI.exportTemplate()
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = "Template Input Lansia.xlsm"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error downloading template:", error)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (
        !file.name.toLowerCase().endsWith(".xlsx") &&
        !file.name.toLowerCase().endsWith(".xls") &&
        !file.name.toLowerCase().endsWith(".xlsm")
      ) {
        setError("Format file tidak valid. Harap upload file Excel (.xlsx atau .xls)")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 10MB")
        return
      }
      setError("")
      setUploadFile(file)
    }
  }

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      setError("Pilih file Excel terlebih dahulu")
      return
    }

    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const formData = new FormData()
      formData.append("file", uploadFile)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-excel`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.count !== undefined) {
        setUploadFile(null)
        if (data.errors && data.errors.length > 0) {
          setError(`Upload Gagal, Silahkan Perbaiki Data berikut: ${data.errors.slice(0, 3).join(", ")}`)

          setDialogType("error");
          setDialogMessage(`Upload Gagal, Silahkan Perbaiki Data berikut: ${data.errors.slice(0, 3).join(", ")}`);
          setShowDialog(true);
        } else{
          setDialogType("success");
          setDialogMessage(`Berhasil mengupload ${data.count} data lansia`);
          setShowDialog(true);
        }
        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) {
          fileInput.value = ""
        }
      } else{
        setDialogType("error");
        setDialogMessage(data.message || "Terjadi kesalahan saat mengupload file");
        setShowDialog(true);
        setError(data.message || "Terjadi kesalahan saat mengupload file")

      }

      // if (data.count !== undefined) {
      //   setMessage(`Berhasil mengupload ${data.count} data lansia`)
      //   setUploadFile(null)
      //   const fileInput = document.getElementById("file-upload") as HTMLInputElement
      //   if (fileInput) {
      //     fileInput.value = ""
      //   }
      //   if (data.errors && data.errors.length > 0) {
      //     setError(`Upload Gagal, Silahkan Perbaiki Data berikut: ${data.errors.slice(0, 3).join(", ")}`)
      //   }
      // } else {
      //   setError(data.message || "Terjadi kesalahan saat mengupload file")
      // }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : "Please try again."}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload File Excel</CardTitle>
        <CardDescription>Upload data lansia dalam format Excel untuk input massal</CardDescription>
        {showDialog && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {dialogType === "success" ? "Berhasil" : "Terjadi Kesalahan"}
                </DialogTitle>
                <DialogDescription>
                  {dialogMessage}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end space-x-2 mt-4">
                <Button onClick={() => setShowDialog(false)}>Tutup</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Langkah 1: Download Template</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download template Excel terlebih dahulu untuk memastikan format data sesuai
            </p>
            <Button onClick={handleDownloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Template Excel
            </Button>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Langkah 2: Upload File</h3>
            <p className="text-sm text-gray-600 mb-4">Pilih file Excel yang sudah diisi dengan data lansia</p>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-gray-400 transition-colors min-h-[200px] flex items-center justify-center"
              onDragOver={(e) => {
                e.preventDefault()
                e.currentTarget.classList.add("border-blue-400", "bg-blue-50")
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove("border-blue-400", "bg-blue-50")
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove("border-blue-400", "bg-blue-50")
                const files = e.dataTransfer.files
                if (files.length > 0) {
                  const file = files[0]
                  if (
                    file.name.toLowerCase().endsWith(".xlsx") ||
                    file.name.toLowerCase().endsWith(".xls") ||
                    file.name.toLowerCase().endsWith(".xlsm")
                  ) {
                    setUploadFile(file)
                  } else {
                    setError("Format file tidak valid. Harap upload file Excel (.xlsx atau .xls)")
                  }
                }
              }}
            >
              <div className="text-center w-full">
                <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-lg font-medium text-gray-900 hover:text-blue-600 block">
                      Klik untuk pilih file Excel
                    </span>
                    <span className="text-sm text-gray-500 block mt-1">atau drag & drop file di area ini</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".xlsx,.xls,.xlsm"
                      className="sr-only"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-3">
                    Format yang didukung: .xlsx, .xls, .xlsm (Maksimal: 10MB)
                  </p>
                </div>
              </div>
            </div>
            {uploadFile && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileUp className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">{uploadFile.name}</p>
                      <p className="text-xs text-blue-700">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setUploadFile(null)
                      const fileInput = document.getElementById("file-upload") as HTMLInputElement
                      if (fileInput) {
                        fileInput.value = ""
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleUploadSubmit} disabled={!uploadFile || isLoading} className="min-w-[120px]">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mengupload...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Data
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2">Catatan Penting:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Pastikan format file sesuai dengan template yang disediakan</li>
            <li>• NIK harus unik dan tidak boleh duplikat</li>
            <li>• Tanggal lahir harus dalam format YYYY-MM-DD</li>
            <li>• Macro harus diaktifkan untuk menggunakan excel</li>
            <li>• File maksimal berukuran 10MB</li>
            <li>• Pastikan tidak ada baris kosong di tengah data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
})

ExcelUploadSection.displayName = "ExcelUploadSection"

export default ExcelUploadSection
