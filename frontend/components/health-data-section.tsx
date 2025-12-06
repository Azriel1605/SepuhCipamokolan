"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input" // Import Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  kesehatanOptions,
  penyakitOptions,
  obatOptions,
  alatBantuOptions,
  aktivitasOptions,
  giziOptions,
  imunisasiOptions,
  bpjsOptions,
  riwayatBKLOptions
} from "@/lib/options"

interface HealthData {
  kondisi_kesehatan_umum: string
  riwayat_penyakit_kronis: string[]
  penggunaan_obat_rutin: string
  alat_bantu: string[] // Typo fix: was string
  aktivitas_fisik: string
  status_gizi: string
  riwayat_imunisasi: string[] // Typo fix: was string
  bpjs: string // [NEW]
}

interface HealthDataSectionProps {
  data: HealthData
  onChange: (field: string, value: any) => void
  onArrayChange: (field: string, value: string, checked: boolean) => void
}

const HealthDataSection = React.memo(({ data, onChange, onArrayChange }: HealthDataSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Kesehatan</CardTitle>
        <CardDescription>Informasi kondisi kesehatan lansia</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="kondisi_kesehatan_umum">Kondisi Kesehatan Umum</Label>
            <Select
              value={data.kondisi_kesehatan_umum}
              onValueChange={(value) => onChange("kondisi_kesehatan_umum", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kondisi Kesehatan" />
              </SelectTrigger>
              <SelectContent>
                {kesehatanOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bpjs">Status BPJS</Label>
            <Select
              value={data.bpjs}
              onValueChange={(value) => onChange("bpjs", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Status BPJS" />
              </SelectTrigger>
              <SelectContent>
                {bpjsOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <Label htmlFor="penggunaan_obat_rutin">Penggunaan Obat Rutin</Label>
                <Select
                  value={data.penggunaan_obat_rutin}
                  onValueChange={(value) => onChange("penggunaan_obat_rutin", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Penggunaan Obat Rutin" />
                  </SelectTrigger>
                  <SelectContent>
                    {obatOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="status_gizi">Status Gizi</Label>
                <Select value={data.status_gizi} onValueChange={(value) => onChange("status_gizi", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status gizi" />
                  </SelectTrigger>
                  <SelectContent>
                    {giziOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
        </div>

        <div>
          <Label>Riwayat Penyakit Kronis</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {penyakitOptions.map((riwayat) => (
              <div key={riwayat} className="flex items-center space-x-2">
                <Checkbox
                  id={riwayat}
                  checked={data.riwayat_penyakit_kronis.includes(riwayat)}
                  onCheckedChange={(checked) => onArrayChange("riwayat_penyakit_kronis", riwayat, checked as boolean)}
                />
                <Label htmlFor={riwayat} className="text-sm">
                  {riwayat}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label>Alat Bantu</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {alatBantuOptions.map((alat) => (
              <div key={alat} className="flex items-center space-x-2">
                <Checkbox
                  id={alat}
                  checked={data.alat_bantu.includes(alat)}
                  onCheckedChange={(checked) => onArrayChange("alat_bantu", alat, checked as boolean)}
                />
                <Label htmlFor={alat} className="text-sm">
                  {alat}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Riwayat Imunisasi</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {imunisasiOptions.map((imunisasi) => (
              <div key={imunisasi} className="flex items-center space-x-2">
                <Checkbox
                  id={imunisasi}
                  checked={data.riwayat_imunisasi.includes(imunisasi)}
                  onCheckedChange={(checked) => onArrayChange("riwayat_imunisasi", imunisasi, checked as boolean)}
                />
                <Label htmlFor={imunisasi} className="text-sm">
                  {imunisasi}
                </Label>
              </div>
            ))}
          </div>
        </div>


        <div>
            <Label htmlFor="aktivitas_fisik">Aktivitas Fisik</Label>
            <Select value={data.aktivitas_fisik} onValueChange={(value) => onChange("aktivitas_fisik", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Aktivitas Fisik" />
              </SelectTrigger>
              <SelectContent>
                {aktivitasOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
      </CardContent>
    </Card>
  )
})

HealthDataSection.displayName = "HealthDataSection"

export default HealthDataSection