"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { dukunganOptions, rumahOptions, kebutuhanMendesakOptions, hobiOptions, psikologisOptions } from "@/lib/options"

interface WelfareData {
  dukungan_keluarga: string
  kondisi_rumah: string
  kebutuhan_mendesak: string[]
  hobi_minat: string
  kondisi_psikologis: string
}

interface WelfareDataSectionProps {
  data: WelfareData
  onChange: (field: string, value: any) => void
  onArrayChange: (field: string, value: string, checked: boolean) => void
}

const WelfareDataSection = React.memo(({ data, onChange, onArrayChange }: WelfareDataSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Kesejahteraan</CardTitle>
        <CardDescription>Informasi kondisi kesejahteraan lansia</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dukungan_keluarga">Kondisi Dukungan Keluarga</Label>
            <Select value={data.dukungan_keluarga} onValueChange={(value) => onChange("dukungan_keluarga", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kondisi Dukungan Keluarga" />
              </SelectTrigger>
              <SelectContent>
                {dukunganOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="kondisi_rumah">Kondisi Rumah</Label>
            <Select value={data.kondisi_rumah} onValueChange={(value) => onChange("kondisi_rumah", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kondisi Rumah" />
              </SelectTrigger>
              <SelectContent>
                {rumahOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Kebutuhan Mendesak</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {kebutuhanMendesakOptions.map((kebutuhan) => (
              <div key={kebutuhan} className="flex items-center space-x-2">
                <Checkbox
                  id={kebutuhan}
                  checked={data.kebutuhan_mendesak.includes(kebutuhan)}
                  onCheckedChange={(checked) => onArrayChange("kebutuhan_mendesak", kebutuhan, checked as boolean)}
                />
                <Label htmlFor={kebutuhan} className="text-sm">
                  {kebutuhan}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hobi_minat">Hobi atau Minat</Label>
            <Select value={data.hobi_minat} onValueChange={(value) => onChange("hobi_minat", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih hobi/minat" />
              </SelectTrigger>
              <SelectContent>
                {hobiOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="kondisi_psikologis">Kondisi Psikologis</Label>
            <Select value={data.kondisi_psikologis} onValueChange={(value) => onChange("kondisi_psikologis", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kondisi Psikologis" />
              </SelectTrigger>
              <SelectContent>
                {psikologisOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

WelfareDataSection.displayName = "WelfareDataSection"

export default WelfareDataSection
