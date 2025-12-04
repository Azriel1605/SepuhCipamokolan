"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adlOptions, adlGetOptions } from "@/lib/options"

interface ADLData {
  bab: number
  bak: number
  membersihkan_diri: number
  toilet: number
  makan: number
  pindah_tempat: number
  mobilitas: number
  berpakaian: number
  naik_turun_tangga: number
  mandi:number
}

interface ADLSectionProps {
  data: ADLData
  onChange: (field: string, value: any) => void
}

const ADLSection = React.memo(({ data, onChange }: ADLSectionProps) => {
  const totalScore = useMemo(() => {
    return Object.values(data).reduce((total, value) => total + (value || 0), 0)
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Kehidupan Sehari-hari (ADL)</CardTitle>
        <CardDescription>
          Penilaian kemampuan melakukan aktivitas sehari-hari (0=Tidak Mampu, 1=Bantuan, 2=Mandiri)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {adlOptions.map((item) => (
            <div key={item.key}>
              <Label htmlFor={item.key}>{item.label}</Label>
              <Select
                value={data[item.key as keyof ADLData]?.toString() || "0"}
                onValueChange={(value) => onChange(item.key, Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {adlGetOptions(item.key).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <Label className="font-semibold">Total Skor ADL:</Label>
          <p className="text-lg font-bold text-blue-600">{totalScore} / 20</p>
        </div>
      </CardContent>
    </Card>
  )
})

ADLSection.displayName = "ADLSection"

export default ADLSection
