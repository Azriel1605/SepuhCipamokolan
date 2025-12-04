"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  genderOptions,
  perkawinanOptions,
  agamaOptions,
  pendidikanOptions,
  pekerjaanOptions,
  penghasilanOptions,
} from "@/lib/options"

interface PersonalData {
  nama_lengkap: string
  nik: string
  jenis_kelamin: string
  tanggal_lahir: string
  alamat_lengkap: string
  koordinat: string
  rt: string
  rw: string
  status_perkawinan: string
  agama: string
  pendidikan_terakhir: string
  pekerjaan_terakhir: string
  sumber_penghasilan: string
}

interface PersonalDataSectionProps {
  data: PersonalData
  onChange: (field: string, value: any) => void
}

const PersonalDataSection = React.memo(({ data, onChange }: PersonalDataSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Pribadi</CardTitle>
        <CardDescription>Informasi dasar identitas lansia</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nama_lengkap">Nama Lengkap *</Label>
            <Input
              id="nama_lengkap"
              value={data.nama_lengkap}
              onChange={(e) => onChange("nama_lengkap", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="nik">NIK *</Label>
            <Input
              id="nik"
              value={data.nik}
              onChange={(e) => onChange("nik", e.target.value)}
              minLength={16}
              maxLength={16}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
            <Select value={data.jenis_kelamin} onValueChange={(value) => onChange("jenis_kelamin", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jenis Kelamin" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
            <Input
              id="tanggal_lahir"
              type="date"
              value={data.tanggal_lahir}
              onChange={(e) => onChange("tanggal_lahir", e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="alamat_lengkap">Alamat Lengkap</Label>
          <Textarea
            id="alamat_lengkap"
            value={data.alamat_lengkap}
            onChange={(e) => onChange("alamat_lengkap", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="koordinat">Koordinat (Latitude, Longitude)</Label>
          <Input
            id="koordinat"
            value={data.koordinat}
            onChange={(e) => onChange("koordinat", e.target.value)}
            placeholder="Contoh: -6.2088, 106.8456"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rt">RT</Label>
            <Input id="rt" value={data.rt} onChange={(e) => onChange("rt", e.target.value)} required/>
          </div>
          <div>
            <Label htmlFor="rw">RW</Label>
            <Input id="rw" value={data.rw} onChange={(e) => onChange("rw", e.target.value)} required/>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="status_perkawinan">Status Perkawinan</Label>
            <Select value={data.status_perkawinan} onValueChange={(value) => onChange("status_perkawinan", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                {perkawinanOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="agama">Agama</Label>
            <Select value={data.agama} onValueChange={(value) => onChange("agama", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih agama" />
              </SelectTrigger>
              <SelectContent>
                {agamaOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pendidikan_terakhir">Pendidikan Terakhir</Label>
            <Select value={data.pendidikan_terakhir} onValueChange={(value) => onChange("pendidikan_terakhir", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih pendidikan" />
              </SelectTrigger>
              <SelectContent>
                {pendidikanOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div>
            <Label htmlFor="pekerjaan_terakhir">Pekerjaan Terakhir</Label>
            <Select value={data.pekerjaan_terakhir} onValueChange={(value) => onChange("pekerjaan_terakhir", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Pekerjaan" />
              </SelectTrigger>
              <SelectContent>
                {pekerjaanOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sumber_penghasilan">Sumber Penghasilan</Label>
            <Select value={data.sumber_penghasilan} onValueChange={(value) => onChange("sumber_penghasilan", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Penghasilan" />
              </SelectTrigger>
              <SelectContent>
                {penghasilanOptions.map((option) => (
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

PersonalDataSection.displayName = "PersonalDataSection"

export default PersonalDataSection
