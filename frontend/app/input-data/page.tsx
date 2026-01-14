"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileUp, UserPlus } from "lucide-react"
import { dataAPI } from "@/lib/api"
import RouteGuard from "@/components/route-guard"
import PersonalDataSection from "@/components/personal-data-section"
import HealthDataSection from "@/components/health-data-section"
import WelfareDataSection from "@/components/welfare-data-section"
import FamilyDataSection from "@/components/family-data-section"
import ADLSection from "@/components/adl-section"
import ExcelUploadSection from "@/components/excel-upload-section"
import { useAuth } from "@/hooks/use-auth"

function InputDataContent() {
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    // Personal Data (Lansia table)
    nama_lengkap: "",
    nik: "",
    jenis_kelamin: "",
    tanggal_lahir: "",
    alamat_lengkap: "",
    koordinat: "",
    rt: "",
    rw: "",
    status_perkawinan: "",
    agama: "",
    pendidikan_terakhir: "",
    pekerjaan_terakhir: "",
    sumber_penghasilan: "",
    // Health Data (KesehatanLansia table)
    kondisi_kesehatan_umum: "",
    riwayat_penyakit_kronis: [] as string[],
    penggunaan_obat_rutin: "",
    alat_bantu: [] as string[],
    aktivitas_fisik: "",
    status_gizi: "",
    riwayat_imunisasi: [] as string[],
    bpjs:"",
    // Social Welfare Data (KesejahteraanSosial table)
    dukungan_keluarga: "",
    kondisi_rumah: "",
    kebutuhan_mendesak: [] as string[],
    hobi_minat: "",
    kondisi_psikologis: "",
    // Family Data (KeluargaPendamping table)
    memiliki_pendamping: false,
    hubungan_dengan_lansia: "",
    ketersediaan_waktu: "",
    partisipasi_program_bkl: "",
    riwayat_partisipasi_bkl: "",
    keterlibatan_data: "",
    // Daily Living Activities (ADailyLiving table)
    bab: 0,
    bak: 0,
    membersihkan_diri: 0,
    toilet: 0,
    makan: 0,
    pindah_tempat: 0,
    mobilitas: 0,
    berpakaian: 0,
    naik_turun_tangga: 0,
    mandi:0,
  })

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const handleArrayChange = useCallback((field: string, value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter((item) => item !== value),
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const dataToSend = { ...formData}
      const isAdmin = ["admin", "superadmin", "kelurahan"].includes(user?.role || "")

      if (!isAdmin && user?.role) {
        dataToSend.rw = user.role
      }

      const response = await dataAPI.createLansia(formData)
      const data = await response.json()
      if (response.ok) {
        setMessage("Data lansia berhasil ditambahkan!")
        resetForm()
      } else {
        setError(data.message || "Terjadi kesalahan saat menyimpan data")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const resetForm = useCallback(() => {
    setFormData({
    nama_lengkap: "",
    nik: "",
    jenis_kelamin: "",
    tanggal_lahir: "",
    alamat_lengkap: "",
    koordinat: "",
    rt: "",
    rw: "",
    status_perkawinan: "",
    agama: "",
    pendidikan_terakhir: "",
    pekerjaan_terakhir: "",
    sumber_penghasilan: "",
    // Health Data (KesehatanLansia table)
    kondisi_kesehatan_umum: "",
    riwayat_penyakit_kronis: [],
    penggunaan_obat_rutin: "",
    alat_bantu: [],
    aktivitas_fisik: "",
    status_gizi: "",
    riwayat_imunisasi: [],
    bpjs:"",
    // Social Welfare Data (KesejahteraanSosial table)
    dukungan_keluarga: "",
    kondisi_rumah: "",
    kebutuhan_mendesak: [],
    hobi_minat: "",
    kondisi_psikologis: "",
    // Family Data (KeluargaPendamping table)
    memiliki_pendamping: false,
    hubungan_dengan_lansia: "",
    ketersediaan_waktu: "",
    partisipasi_program_bkl: "",
    riwayat_partisipasi_bkl: "",
    keterlibatan_data: "",
    // Daily Living Activities (ADailyLiving table)
    bab: 0,
    bak: 0,
    membersihkan_diri: 0,
    toilet: 0,
    makan: 0,
    pindah_tempat: 0,
    mobilitas: 0,
    berpakaian: 0,
    naik_turun_tangga: 0,
    mandi:0,
    })
  }, [])

  // Memoized data objects for each section
  const personalData = useMemo(
    () => ({
      nama_lengkap: formData.nama_lengkap,
      nik: formData.nik,
      jenis_kelamin: formData.jenis_kelamin,
      tanggal_lahir: formData.tanggal_lahir,
      alamat_lengkap: formData.alamat_lengkap,
      koordinat: formData.koordinat,
      rt: formData.rt,
      rw: formData.rw,
      status_perkawinan: formData.status_perkawinan,
      agama: formData.agama,
      pendidikan_terakhir: formData.pendidikan_terakhir,
      pekerjaan_terakhir: formData.pekerjaan_terakhir,
      sumber_penghasilan: formData.sumber_penghasilan,
    }),
    [
      formData.nama_lengkap,
      formData.nik,
      formData.jenis_kelamin,
      formData.tanggal_lahir,
      formData.alamat_lengkap,
      formData.koordinat,
      formData.rt,
      formData.rw,
      formData.status_perkawinan,
      formData.agama,
      formData.pendidikan_terakhir,
      formData.pekerjaan_terakhir,
      formData.sumber_penghasilan,
    ],
  )

  const healthData = useMemo(
    () => ({
      kondisi_kesehatan_umum: formData.kondisi_kesehatan_umum,
      riwayat_penyakit_kronis: formData.riwayat_penyakit_kronis,
      penggunaan_obat_rutin: formData.penggunaan_obat_rutin,
      alat_bantu: formData.alat_bantu,
      aktivitas_fisik: formData.aktivitas_fisik,
      status_gizi: formData.status_gizi,
      riwayat_imunisasi: formData.riwayat_imunisasi,
      bpjs : formData.bpjs,
    }),
    [
      formData.kondisi_kesehatan_umum,
      formData.riwayat_penyakit_kronis,
      formData.penggunaan_obat_rutin,
      formData.alat_bantu,
      formData.aktivitas_fisik,
      formData.status_gizi,
      formData.riwayat_imunisasi,
      formData.bpjs,
    ],
  )

  const welfareData = useMemo(
    () => ({
      dukungan_keluarga: formData.dukungan_keluarga,
      kondisi_rumah: formData.kondisi_rumah,
      kebutuhan_mendesak: formData.kebutuhan_mendesak,
      hobi_minat: formData.hobi_minat,
      kondisi_psikologis: formData.kondisi_psikologis,
    }),
    [
      formData.dukungan_keluarga,
      formData.kondisi_rumah,
      formData.kebutuhan_mendesak,
      formData.hobi_minat,
      formData.kondisi_psikologis,
    ],
  )

  const familyData = useMemo(
    () => ({
      memiliki_pendamping: formData.memiliki_pendamping,
      hubungan_dengan_lansia: formData.hubungan_dengan_lansia,
      ketersediaan_waktu: formData.ketersediaan_waktu,
      partisipasi_program_bkl: formData.partisipasi_program_bkl,
      riwayat_partisipasi_bkl: formData.riwayat_partisipasi_bkl,
      keterlibatan_data: formData.keterlibatan_data,
    }),
    [
      formData.memiliki_pendamping,
      formData.hubungan_dengan_lansia,
      formData.ketersediaan_waktu,
      formData.partisipasi_program_bkl,
      formData.riwayat_partisipasi_bkl,
      formData.keterlibatan_data,
    ],
  )

  const adlData = useMemo(
    () => ({
      bab: formData.bab,
      bak: formData.bak,
      membersihkan_diri: formData.membersihkan_diri,
      toilet: formData.toilet,
      makan: formData.makan,
      pindah_tempat: formData.pindah_tempat,
      mobilitas: formData.mobilitas,
      berpakaian: formData.berpakaian,
      naik_turun_tangga: formData.naik_turun_tangga,
      mandi: formData.mandi,
    }),
    [
      formData.bab,
      formData.bak,
      formData.membersihkan_diri,
      formData.toilet,
      formData.makan,
      formData.pindah_tempat,
      formData.mobilitas,
      formData.berpakaian,
      formData.naik_turun_tangga,
      formData.mandi
    ],
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Input Data Lansia</h1>
          <p className="mt-2 text-gray-600">Tambahkan data lansia baru ke dalam sistem</p>
        </div>

        <Tabs defaultValue="manual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              Input Manual
            </TabsTrigger>
            <TabsTrigger value="excel" className="flex items-center">
              <FileUp className="h-4 w-4 mr-2" />
              Upload Excel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <PersonalDataSection data={personalData} onChange={handleInputChange} />

              <HealthDataSection data={healthData} onChange={handleInputChange} onArrayChange={handleArrayChange} />

              <WelfareDataSection data={welfareData} onChange={handleInputChange} onArrayChange={handleArrayChange} />

              <FamilyDataSection data={familyData} onChange={handleInputChange} />

              <ADLSection data={adlData} onChange={handleInputChange} />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan Data"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="excel">
            <ExcelUploadSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function InputDataPage() {
  return (
    <RouteGuard requireAuth={true}>
      <InputDataContent />
    </RouteGuard>
  )
}
