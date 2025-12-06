"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { hubunganOptions, ketersediaanWaktuOptions, dataBKLOptions, keterlibatanDanaOptions, riwayatBKLOptions } from "@/lib/options"

interface FamilyData {
  memiliki_pendamping: boolean
  hubungan_dengan_lansia: string
  ketersediaan_waktu: string
  partisipasi_program_bkl: string
  riwayat_partisipasi_bkl: string
  keterlibatan_data: string
}

interface FamilyDataSectionProps {
  data: FamilyData
  onChange: (field: string, value: any) => void
}

const FamilyDataSection = React.memo(({ data, onChange }: FamilyDataSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Keluarga/Pendamping</CardTitle>
        <CardDescription>Informasi keluarga atau pendamping lansia</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex items-center space-x-2 mb-4 p-4 bg-slate-50 rounded-md border">
          <Checkbox 
            id="memiliki_pendamping" 
            checked={data.memiliki_pendamping}
            onCheckedChange={(checked) => onChange("memiliki_pendamping", checked)}
          />
          <Label htmlFor="memiliki_pendamping" className="cursor-pointer">
            Lansia Memiliki Pendamping / Keluarga yg Merawat?
          </Label>
        </div>

        {data.memiliki_pendamping && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="hubungan_dengan_lansia">Hubungan dengan Lansia</Label>
                <Select
                value={data.hubungan_dengan_lansia}
                onValueChange={(value) => onChange("hubungan_dengan_lansia", value)}
                >
                <SelectTrigger>
                    <SelectValue placeholder="Pilih hubungan" />
                </SelectTrigger>
                <SelectContent>
                    {hubunganOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                        {option}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="ketersediaan_waktu">Ketersediaan Waktu</Label>
                <Select value={data.ketersediaan_waktu} onValueChange={(value) => onChange("ketersediaan_waktu", value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Pilih ketersediaan waktu" />
                </SelectTrigger>
                <SelectContent>
                    {ketersediaanWaktuOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                        {option}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="partisipasi_program_bkl">Partisipasi Program BKL</Label>
                <Select value={data.partisipasi_program_bkl} onValueChange={(value) => onChange("partisipasi_program_bkl", value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Partisipasi Program BKL" />
                </SelectTrigger>
                <SelectContent>
                    {dataBKLOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                        {option}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="keterlibatan_data">Keterlibatan Dana</Label>
                <Select value={data.keterlibatan_data} onValueChange={(value) => onChange("keterlibatan_data", value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Pilih keterlibatan dana" />
                </SelectTrigger>
                <SelectContent>
                    {keterlibatanDanaOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                        {option}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="riwayat_partisipasi_bkl">Riwayat Partisipasi BKL</Label>
                <Select value={data.riwayat_partisipasi_bkl} onValueChange={(value) => onChange("riwayat_partisipasi_bkl", value)}>
                    <SelectTrigger>
                    <SelectValue placeholder="Pilih Riwayat Partisipasi BKL" />
                    </SelectTrigger>
                    <SelectContent>
                    {riwayatBKLOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                        {option}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            </div>
        )}

      </CardContent>
    </Card>
  )
})

FamilyDataSection.displayName = "FamilyDataSection"

export default FamilyDataSection