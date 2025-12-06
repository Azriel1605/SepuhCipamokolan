"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/dateselector"
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Heart,
  Home,
  Users,
  Save,
  X,
} from "lucide-react"
import { dataAPI } from "@/lib/api"
import {genderOptions, perkawinanOptions, agamaOptions, kesehatanOptions, penyakitOptions,
        obatOptions, alatBantuOptions, aktivitasOptions, giziOptions, imunisasiOptions,
        dukunganOptions, rumahOptions, kebutuhanMendesakOptions, hobiOptions,
        psikologisOptions, hubunganOptions, ketersediaanWaktuOptions,
        dataBKLOptions,
        riwayatBKLOptions,
        keterlibatanDanaOptions, adlGetOptions, bpjsOptions} from "@/lib/options"
import RouteGuard from "@/components/route-guard"
import { useAuth } from "@/hooks/use-auth"

interface LansiaData {
  id: number
  nama_lengkap: string
  nik: string
  jenis_kelamin: string
  usia: number
  rt: string
  rw: string
  kelompok_usia: string
  nilai_adl: string
  status_perkawinan: string
  created_at: string
}

interface LansiaDetail {
  id: number
  nama_lengkap: string
  nik: string
  jenis_kelamin: string
  tanggal_lahir: string
  usia: number
  koordinat: string
  kelompok_usia: string
  alamat_lengkap: string
  rt: string
  rw: string
  status_perkawinan: string
  agama: string
  pendidikan_terakhir: string
  pekerjaan_terakhir: string
  sumber_penghasilan: string
  kesehatan: any
  kesejahteraan: any
  keluarga: any
  daily_living: any
  created_at: string
}

interface FilterOptions {
  genders: string[]
  age_groups: string[]
  rws: string[]
}

function DataTableContent() {
  const { user } = useAuth()
  const isAllowEditRW = user?.role === "admin" || user?.role === "superadmin" || user?.role === "kelurahan"

  const [data, setData] = useState<LansiaData[]>([])
  const [selectedLansia, setSelectedLansia] = useState<LansiaDetail | null>(null)
  const [editingLansia, setEditingLansia] = useState<LansiaDetail | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ genders: [], age_groups: [], rws: [] })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [perPage, setPerPage] = useState(10)

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [ageGroupFilter, setAgeGroupFilter] = useState("all")
  const [rwFilter, setRwFilter] = useState("all")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedDateDownload, setSelectedDateDownload] = useState(new Date())

  // Sorting
  const [sortBy, setSortBy] = useState("nama_lengkap")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Debounce search
  const [searchDebounce, setSearchDebounce] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchFilterOptions()
    fetchData(true)
  }, [])

  useEffect(() => {
    if (!isInitialLoading) {
      setCurrentPage(1)
      fetchData()
    }
  }, [searchDebounce, selectedDate, genderFilter, ageGroupFilter, rwFilter, sortBy, sortOrder])

  useEffect(() => {
    if (!isInitialLoading) {
      fetchData()
    }
  }, [currentPage, perPage])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("")
        setError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message, error])

  const fetchFilterOptions = async () => {
    try {
      const response = await dataAPI.getFilterOptions()
      if (response.ok) {
        const options = await response.json()
        setFilterOptions(options)
      }
    } catch (error) {
      console.error("Error fetching filter options:", error)
    }
  }

  const fetchData = async (initial = false) => {
    if (initial) {
      setIsInitialLoading(true)
    } else {
      setIsTableLoading(true)
    }

    try {
      const filters = {
        search: searchDebounce,
        date: selectedDate.toISOString().slice(0, 10) ,
        gender: genderFilter === "all" ? "" : genderFilter,
        age_group: ageGroupFilter === "all" ? "" : ageGroupFilter,
        rw: rwFilter === "all" ? "" : rwFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      }

      const response = await dataAPI.getLansia(currentPage, perPage, filters)
      if (response.ok) {
        const result = await response.json()
        setData(result.data)
        setTotalPages(result.pages)
        setTotalItems(result.total)
        setSelectedIds([])
        setSelectAll(false)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Gagal memuat data")
    } finally {
      if (initial) {
        setIsInitialLoading(false)
      } else {
        setIsTableLoading(false)
      }
    }
  }

  const fetchDetailedData = async (id: number) => {
    try {
      const response = await dataAPI.getLansiaDetail(id)
      if (response.ok) {
        const data = await response.json()
        setSelectedLansia(data)
        setIsDetailOpen(true)
      }
    } catch (error) {
      console.error("Error fetching detailed data:", error)
      setError("Gagal memuat detail data")
    }
  }

  const fetchEditData = async (id: number) => {
    try {
      const response = await dataAPI.getLansiaDetail(id)
      if (response.ok) {
        const data = await response.json()
        setEditingLansia(data)
        setIsEditOpen(true)
        console.log("Edit", isEditOpen)
      }
    } catch (error) {
      console.error("Error fetching edit data:", error)
      setError("Gagal memuat data untuk edit")
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />
    return sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedDate(new Date())
    setGenderFilter("all")
    setAgeGroupFilter("all")
    setRwFilter("all")
    setCurrentPage(1)
  }

  const getStatusBadge = (kelompokUsia: string) => {
    const colors = {
      "Pra Lansia": "bg-blue-100 text-blue-800",
      "Lansia Muda": "bg-green-100 text-green-800",
      "Lansia Madya": "bg-yellow-100 text-yellow-800",
      "Lansia Tua": "bg-red-100 text-red-800",
    }
    return colors[kelompokUsia as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedIds(data.map((item) => item.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
      setSelectAll(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data?`)) return

    try {
      const response = await dataAPI.bulkDeleteLansia(selectedIds)
      if (response.ok) {
        setMessage(`${selectedIds.length} data berhasil dihapus`)
        fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Gagal menghapus data")
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menghapus data")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return

    try {
      const response = await dataAPI.deleteLansia(id)
      if (response.ok) {
        setMessage("Data berhasil dihapus")
        fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Gagal menghapus data")
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menghapus data")
    }
  }

  const handleSaveEdit = async () => {
    if (!editingLansia) return

    setIsSaving(true)
    try {
      const response = await dataAPI.updateLansia(editingLansia.id, editingLansia)
      if (response.ok) {
        setMessage("Data berhasil diperbarui")
        setIsEditOpen(false)
        setEditingLansia(null)
        fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Gagal memperbarui data")
      }
    } catch (error) {
      setError("Terjadi kesalahan saat memperbarui data")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditChange = (field: string, value: any) => {
    if (!editingLansia) return
    setEditingLansia({
      ...editingLansia,
      [field]: value,
    })
  }

  const handleEditNestedChange = (section: string, field: string, value: any) => {
    if (!editingLansia) return
    setEditingLansia({
      ...editingLansia,
      [section]: {
        ...editingLansia[section as keyof LansiaDetail],
        [field]: value,
      },
    })
  }

  

  const handleEditArrayChange = (
  section: string,
  field: string,
  value: string,
  checked: boolean
) => {
  if (!editingLansia) return;

  const currentArray = editingLansia[section as keyof LansiaDetail]?.[field] || [];
  const trimmedValue = value.trim();

  const updatedArray = checked
    ? [...currentArray.map((v: string) => v.trim()), trimmedValue]
        .filter((v, i, arr) => arr.indexOf(v) === i) // remove duplicates
    : currentArray.filter((v: string) => v.trim() !== trimmedValue);

  handleEditNestedChange(section, field, updatedArray);
};



  const TableSkeleton = () => (
    <div className="space-y-3">
      {[...Array(perPage)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  )

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Data Lansia</h1>
          <p className="mt-2 text-gray-600">Kelola dan lihat data lansia yang terdaftar</p>
        </div>

        {/* Messages */}
        {message && (
          <Alert className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Download Excel</CardTitle>
            <CardDescription>Data yang tertera akan disimpan dalam file excel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-content-end gap-2">
                  <DatePicker date={selectedDateDownload} onChange={(date: Date) => setSelectedDateDownload(date)} />
            </div>
          </CardContent>
        </Card>
        
        <br />
        <Card>
          <CardHeader>
            <CardTitle>Daftar Lansia</CardTitle>
            <CardDescription>Total {totalItems} data lansia terdaftar</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari nama, NIK, atau alamat..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <DatePicker date={selectedDate} onChange={(date: Date) => setSelectedDate(date)} />

                  <Select value={genderFilter} onValueChange={setGenderFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Jenis Kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {filterOptions.genders.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Kelompok Usia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {filterOptions.age_groups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={rwFilter} onValueChange={setRwFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="RW" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {filterOptions.rws.map((rw) => (
                        <SelectItem key={rw} value={rw}>
                          RW {rw}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto bg-transparent">
                    <Filter className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedIds.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700">{selectedIds.length} item dipilih</span>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Terpilih
                  </Button>
                </div>
              )}
            </div>

            {/* Data Table */}
            <div className="relative">
              {isTableLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                {isTableLoading ? (
                  <TableSkeleton />
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 w-12">
                          <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Select all" />
                        </th>
                        <th className="text-left p-4">
                          <Button variant="ghost" onClick={() => handleSort("nama_lengkap")} className="font-semibold">
                            Nama Lengkap
                            {getSortIcon("nama_lengkap")}
                          </Button>
                        </th>
                        <th className="text-left p-4">
                          <Button variant="ghost" onClick={() => handleSort("nik")} className="font-semibold">
                            NIK
                            {getSortIcon("nik")}
                          </Button>
                        </th>
                        <th className="text-left p-4">
                          <Button variant="ghost" onClick={() => handleSort("jenis_kelamin")} className="font-semibold">
                            Jenis Kelamin
                            {getSortIcon("jenis_kelamin")}
                          </Button>
                        </th>
                        <th className="text-left p-4">
                          <Button variant="ghost" onClick={() => handleSort("usia")} className="font-semibold">
                            Usia
                            {getSortIcon("usia")}
                          </Button>
                        </th>
                        <th className="text-left p-4">Kelompok Usia</th>
                        <th className="text-left p-4">
                          <Button variant="ghost" onClick={() => handleSort("rw")} className="font-semibold">
                            RT/RW
                            {getSortIcon("rw")}
                          </Button>
                        </th>
                        <th className="text-left p-4">Nilai ADL</th>
                        <th className="text-center p-4">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((lansia) => (
                        <tr key={lansia.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <Checkbox
                              checked={selectedIds.includes(lansia.id)}
                              onCheckedChange={(checked) => handleSelectItem(lansia.id, checked as boolean)}
                              aria-label={`Select ${lansia.nama_lengkap}`}
                            />
                          </td>
                          <td className="p-4 font-medium">{lansia.nama_lengkap}</td>
                          <td className="p-4 font-mono text-sm">{lansia.nik}</td>
                          <td className="p-4">{lansia.jenis_kelamin}</td>
                          <td className="p-4">{lansia.usia} tahun</td>
                          <td className="p-4">
                            <Badge className={getStatusBadge(lansia.kelompok_usia)}>{lansia.kelompok_usia}</Badge>
                          </td>
                          <td className="p-4">
                            RT {lansia.rt} / RW {lansia.rw}
                          </td>
                          <td className="p-4 max-w-xs truncate">{lansia.nilai_adl}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => fetchDetailedData(lansia.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => fetchEditData(lansia.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(lansia.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {isTableLoading ? (
                  <div className="space-y-4">
                    {[...Array(perPage)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  data.map((lansia) => (
                    <div key={lansia.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedIds.includes(lansia.id)}
                            onCheckedChange={(checked) => handleSelectItem(lansia.id, checked as boolean)}
                            aria-label={`Select ${lansia.nama_lengkap}`}
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{lansia.nama_lengkap}</h3>
                            <p className="text-sm text-gray-500 font-mono">{lansia.nik}</p>
                          </div>
                        </div>
                        <Badge className={getStatusBadge(lansia.kelompok_usia)}>{lansia.kelompok_usia}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Jenis Kelamin:</span>
                          <p className="font-medium">{lansia.jenis_kelamin}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Usia:</span>
                          <p className="font-medium">{lansia.usia} tahun</p>
                        </div>
                        <div>
                          <span className="text-gray-500">RT/RW:</span>
                          <p className="font-medium">
                            RT {lansia.rt} / RW {lansia.rw}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <p className="font-medium">{lansia.status_perkawinan}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-gray-500 text-sm">Nilai ADL:</span>
                        <p className="text-sm">{lansia.nilai_adl}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => fetchDetailedData(lansia.id)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => fetchEditData(lansia.id)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(lansia.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">
                  Menampilkan {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, totalItems)} dari{" "}
                  {totalItems} data
                </span>
                <Select value={perPage.toString()} onValueChange={(value) => setPerPage(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-gray-600">per halaman</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>

                <span className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Data Lansia</DialogTitle>
              <DialogDescription>Informasi lengkap data lansia</DialogDescription>
            </DialogHeader>
              
            
            {/* // TODO */}
            {selectedLansia && (
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">
                    <User className="h-4 w-4 mr-2" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="health">
                    <Heart className="h-4 w-4 mr-2" />
                    Kesehatan
                  </TabsTrigger>
                  <TabsTrigger value="social">
                    <Home className="h-4 w-4 mr-2" />
                    Sosial
                  </TabsTrigger>
                  <TabsTrigger value="family">
                    <Users className="h-4 w-4 mr-2" />
                    Keluarga
                  </TabsTrigger>
                </TabsList>


                <TabsList className="w-full mt-2">
                  <TabsTrigger value="adl" className="w-full justify-center">
                    <Users className="h-4 w-4 mr-2" />
                    Activity Daily Living
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Nama Lengkap</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.nama_lengkap}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">NIK</Label>
                      <p className="text-sm text-gray-600 font-mono">{selectedLansia.nik}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Jenis Kelamin</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.jenis_kelamin}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Tanggal Lahir</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.tanggal_lahir || "-"}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Usia</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.usia} tahun</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Kelompok Usia</Label>
                      <Badge className={getStatusBadge(selectedLansia.kelompok_usia)}>
                        {selectedLansia.kelompok_usia}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <Label className="font-semibold">Alamat Lengkap</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.alamat_lengkap}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">RT/RW</Label>
                      <p className="text-sm text-gray-600">
                        RT {selectedLansia.rt} / RW {selectedLansia.rw}
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold">Status Perkawinan</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.status_perkawinan || "-"}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Agama</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.agama || "-"}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Pendidikan Terakhir</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.pendidikan_terakhir || "-"}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Sumber Penghasilan</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.sumber_penghasilan || "-"}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Koordinat</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.koordinat || "-"}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="health" className="space-y-4">
                  {selectedLansia.kesehatan ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold">Kondisi Kesehatan Umum</Label>
                        <p className="text-sm text-gray-600">
                          {selectedLansia.kesehatan.kondisi_kesehatan_umum || "-"}
                        </p>
                      </div>
                      <div>
                        <Label className="font-semibold">Status Gizi</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.kesehatan.status_gizi || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="font-semibold">Riwayat Penyakit Kronis</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedLansia.kesehatan.riwayat_penyakit_kronis?.length > 0 ? (
                            selectedLansia.kesehatan.riwayat_penyakit_kronis.map((penyakit: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {penyakit}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">Tidak ada</p>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Label className="font-semibold">Alat Bantu</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedLansia.kesehatan.alat_bantu?.length > 0 ? (
                            selectedLansia.kesehatan.alat_bantu.map((alat: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {alat}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">Tidak ada</p>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Label className="font-semibold">Riwayat Imunisasi</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedLansia.kesehatan.riwayat_imunisasi?.length > 0 ? (
                            selectedLansia.kesehatan.riwayat_imunisasi.map((imunisasi: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {imunisasi}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">Tidak ada</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="font-semibold">Aktivitas Fisik</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.kesehatan.aktivitas_fisik || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Penggunaan Obat Rutin</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.kesehatan.penggunaan_obat_rutin || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Status BPJS</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.kesehatan.bpjs || "-"}</p>
                      </div>
                      
                    </div>
                  ) : (
                    <p className="text-gray-500">Data kesehatan belum tersedia</p>
                  )}
                </TabsContent>

                <TabsContent value="social" className="space-y-4">
                  {selectedLansia.kesejahteraan ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold">Dukungan Keluarga</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.kesejahteraan.dukungan_keluarga || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Kondisi Rumah</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.kesejahteraan.kondisi_rumah || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="font-semibold">Kebutuhan Mendesak</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedLansia.kesejahteraan.kebutuhan_mendesak?.length > 0 ? (
                            selectedLansia.kesejahteraan.kebutuhan_mendesak.map((kebutuhan: string, index: number) => (
                              <Badge key={index} variant="destructive">
                                {kebutuhan}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">Tidak ada</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="font-semibold">Kondisi Psikologis</Label>
                        <p className="text-sm text-gray-600">
                          {selectedLansia.kesejahteraan.kondisi_psikologis || "-"}
                        </p>
                      </div>
                      <div>
                        <Label className="font-semibold">Hobi & Minat</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.kesejahteraan.hobi_minat || "-"}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Data kesejahteraan sosial belum tersedia</p>
                  )}
                </TabsContent>

                <TabsContent value="family" className="space-y-4">
                  {selectedLansia.keluarga.memiliki_pendamping ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold">Hubungan dengan Lansia</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.keluarga.hubungan_dengan_lansia || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Ketersediaan Waktu</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.keluarga.ketersediaan_waktu || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Partisipasi Program BKL</Label>
                        <p className="text-sm text-gray-600">
                          {selectedLansia.keluarga.partisipasi_program_bkl || "-"}
                        </p>
                      </div>
                      <div>
                        <Label className="font-semibold">Riwayat Partisipasi BKL</Label>
                        <p className="text-sm text-gray-600">
                          {selectedLansia.keluarga.riwayat_partisipasi_bkl || "-"}
                        </p>
                      </div>
                      <div>
                        <Label className="font-semibold">Keterlibatan Dana</Label>
                        <p className="text-sm text-gray-600">
                          {selectedLansia.keluarga.keterlibatan_data || "-"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Data keluarga pendamping belum tersedia</p>
                  )}
                </TabsContent>

                <TabsContent value="adl" className="space-y-12">
                  {selectedLansia.daily_living ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold">Mengontrol BAB</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.daily_living.bab || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Mengontrol BAK</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.daily_living.bak || "-"}</p>
                      </div>

                      <div>
                        <Label className="font-semibold">Membersihkan Diri</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.daily_living.membersihkan_diri || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Penggunaan Toilet</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.daily_living.toilet || "-"}</p>
                      </div>

                      <div>
                        <Label className="font-semibold">Makan</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.daily_living.makan || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Berpindah tempat dari tidur ke duduk</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.daily_living.pindah_tempat || "-"}</p>
                      </div>

                      <div>
                        <Label className="font-semibold">Mobiitas/berjalan</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.daily_living.mobilitas || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Berpakaian (memakai baju)</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.daily_living.berpakaian || "-"}</p>
                      </div>

                      <div>
                        <Label className="font-semibold">Naik turun Tangga</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.daily_living.naik_turun_tangga || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Mandi</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.daily_living.mandi || "-"}</p>
                      </div>

                      <div>
                        <Label className="font-semibold">Total Score ADL</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.daily_living.total}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Status Ketergantungan</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.daily_living.total_desc || "-"}</p>
                      </div>
                      
                    </div>
                    
                  ) : (
                    <p className="text-gray-500">Data keluarga pendamping belum tersedia</p>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Data Lansia</DialogTitle>
              <DialogDescription>Ubah informasi data lansia</DialogDescription>
            </DialogHeader>

            {editingLansia && (
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">
                    <User className="h-4 w-4 mr-2" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="health">
                    <Heart className="h-4 w-4 mr-2" />
                    Kesehatan
                  </TabsTrigger>
                  <TabsTrigger value="social">
                    <Home className="h-4 w-4 mr-2" />
                    Sosial
                  </TabsTrigger>
                  <TabsTrigger value="family">
                    <Users className="h-4 w-4 mr-2" />
                    Keluarga
                  </TabsTrigger>
                </TabsList>

                <TabsList className="w-full mt-2">
                  <TabsTrigger value="adl" className="w-full justify-center">
                    <Users className="h-4 w-4 mr-2" />
                    Activity Daily Living
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-nama">Nama Lengkap</Label>
                      <Input
                        id="edit-nama"
                        value={editingLansia.nama_lengkap}
                        onChange={(e) => handleEditChange("nama_lengkap", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-nik">NIK</Label>
                      <Input
                        id="edit-nik"
                        value={editingLansia.nik}
                        onChange={(e) => handleEditChange("nik", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-gender">Jenis Kelamin</Label>
                      <Select
                        value={editingLansia.jenis_kelamin}
                        onValueChange={(value) => handleEditChange("jenis_kelamin", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                      <Label htmlFor="edit-birth">Tanggal Lahir</Label>
                      <Input
                        id="edit-birth"
                        type="date"
                        value={editingLansia.tanggal_lahir}
                        onChange={(e) => handleEditChange("tanggal_lahir", e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="edit-address">Koordinat</Label>
                      <Input
                        id="edit-koordinat"
                        value={editingLansia.koordinat}
                        placeholder="Contoh: -6.946822, 107.675628"
                        onChange={(e) => handleEditChange("koordinat", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="edit-address">Alamat Lengkap</Label>
                      <Textarea
                        id="edit-address"
                        value={editingLansia.alamat_lengkap}
                        onChange={(e) => handleEditChange("alamat_lengkap", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-rt">RT</Label>
                      <Input
                        id="edit-rt"
                        value={editingLansia.rt}
                        onChange={(e) => handleEditChange("rt", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-rw">RW</Label>
                      <Input
                        id="edit-rw"
                        value={editingLansia.rw}
                        onChange={(e) => handleEditChange("rw", e.target.value)}
                        readOnly={isAllowEditRW}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-marriage">Status Perkawinan</Label>
                      <Select
                        value={editingLansia.status_perkawinan}
                        onValueChange={(value) => handleEditChange("status_perkawinan", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                      <Label htmlFor="edit-religion">Agama</Label>
                      <Select value={editingLansia.agama} required onValueChange={(value) => handleEditChange("agama", value)}>
                        <SelectTrigger>
                          <SelectValue />
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
                  </div>
                </TabsContent>

                <TabsContent value="health" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-health-condition">Kondisi Kesehatan Umum</Label>
                      <Select
                        value={editingLansia.kesehatan?.kondisi_kesehatan_umum || ""}
                        required
                        onValueChange={(value) => handleEditNestedChange("kesehatan", "kondisi_kesehatan_umum", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kondisi kesehatan" />
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
                      <Label htmlFor="edit-nutrition">Status Gizi</Label>
                      <Select
                        value={editingLansia.kesehatan?.status_gizi || ""}
                        required
                        onValueChange={(value) => handleEditNestedChange("kesehatan", "status_gizi", value)}
                      >
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
                    <div>
                      <Label htmlFor="edit-medication">Penggunaan Obat Rutin</Label>
                      <Select
                        value={editingLansia.kesehatan?.penggunaan_obat_rutin || ""}
                        required
                        onValueChange={(value) => handleEditNestedChange("kesehatan", "penggunaan_obat_rutin", value)}
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
                      <Label htmlFor="edit-activity">Aktivitas Fisik</Label>
                      <Select
                        value={editingLansia.kesehatan?.aktivitas_fisik || ""}
                        required
                        onValueChange={(value) => handleEditNestedChange("kesehatan", "aktivitas_fisik", value)}
                      >
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
                    
                    <div className="col-span-2">
                      <Label>Riwayat Imunisasi</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {imunisasiOptions.map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${item}`}
                              checked={
                                Array.isArray(editingLansia.kesehatan?.riwayat_imunisasi)
                                  ? editingLansia.kesehatan.riwayat_imunisasi
                                      .map((val: string) => val.trim())
                                      .includes(item.trim())
                                  : false
                              }
                              onCheckedChange={(checked) =>
                                handleEditArrayChange("kesehatan", "riwayat_imunisasi", item, checked as boolean)
                              }
                            />

                            <Label htmlFor={`edit-${item}`} className="text-sm">
                              {item}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Label>Riwayat Penyakit Kronis</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {penyakitOptions.map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${item}`}
                              checked={
                                Array.isArray(editingLansia.kesehatan?.riwayat_penyakit_kronis)
                                  ? editingLansia.kesehatan.riwayat_penyakit_kronis
                                      .map((val: string) => val.trim())
                                      .includes(item.trim())
                                  : false
                              }
                              onCheckedChange={(checked) =>
                                handleEditArrayChange("kesehatan", "riwayat_penyakit_kronis", item, checked as boolean)
                              }
                            />

                            <Label htmlFor={`edit-${item}`} className="text-sm">
                              {item}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Label>Alat Bantu</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {alatBantuOptions.map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${item}`}
                              checked={
                                Array.isArray(editingLansia.kesehatan?.alat_bantu)
                                  ? editingLansia.kesehatan.alat_bantu
                                      .map((val: string) => val.trim())
                                      .includes(item.trim())
                                  : false
                              }
                              onCheckedChange={(checked) =>
                                handleEditArrayChange("kesehatan", "alat_bantu", item, checked as boolean)
                              }
                            />

                            <Label htmlFor={`edit-${item}`} className="text-sm">
                              {item}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-nutrition">Status BPJS</Label>
                      <Select
                        value={editingLansia.kesehatan?.bpjs || ""}
                        required
                        onValueChange={(value) => handleEditNestedChange("kesehatan", "bpjs", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status BPJS" />
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
                </TabsContent>

                <TabsContent value="social" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-family-support">Dukungan Keluarga</Label>
                      <Select
                        value={editingLansia.kesejahteraan?.dukungan_keluarga || ""}
                        required
                        onValueChange={(value) => handleEditNestedChange("kesejahteraan", "dukungan_keluarga", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tingkat dukungan" />
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
                      <Label htmlFor="edit-house-condition">Kondisi Rumah</Label>
                      <Select
                        value={editingLansia.kesejahteraan?.kondisi_rumah || ""}
                        required
                        onValueChange={(value) => handleEditNestedChange("kesejahteraan", "kondisi_rumah", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kondisi rumah" />
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
                    <div>
                      <Label htmlFor="edit-psychology">Kondisi Psikologis</Label>
                      <Select
                        value={editingLansia.kesejahteraan?.kondisi_psikologis || ""}
                        required
                        onValueChange={(value) => handleEditNestedChange("kesejahteraan", "kondisi_psikologis", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kondisi psikologis" />
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
                    <div>
                      <Label htmlFor="edit-hobbies">Hobi & Minat</Label>
                      <Select
                        value={editingLansia.kesejahteraan?.hobi_minat || ""}
                        required
                        onValueChange={(value) => handleEditNestedChange("kesejahteraan", "hobi_minat", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Hobi/Minat" />
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

                    <div className="col-span-2">
                      <Label>Kebutuhan Mendesak</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {kebutuhanMendesakOptions.map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${item}`}
                              checked={
                                Array.isArray(editingLansia.kesejahteraan?.kebutuhan_mendesak)
                                  ? editingLansia.kesejahteraan.kebutuhan_mendesak
                                      .map((val: string) => val.trim())
                                      .includes(item.trim())
                                  : false
                              }
                              onCheckedChange={(checked) =>
                                handleEditArrayChange("kesejahteraan", "kebutuhan_mendesak", item, checked as boolean)
                              }
                            />

                            <Label htmlFor={`edit-${item}`} className="text-sm">
                              {item}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </TabsContent>

                <TabsContent value="family" className="space-y-4">
                  <div className="space-y-4">
                    
                    {/* Checkbox Memiliki Pendamping */}
                    <div className="flex items-center space-x-2 p-4 bg-slate-50 rounded-md border">
                      <Checkbox
                        id="edit-memiliki-pendamping"
                        checked={editingLansia.keluarga?.memiliki_pendamping || false}
                        onCheckedChange={(checked) => handleEditNestedChange("keluarga", "memiliki_pendamping", checked)}
                      />
                      <Label htmlFor="edit-memiliki-pendamping" className="cursor-pointer">
                        Lansia Memiliki Pendamping / Keluarga yg Merawat?
                      </Label>
                    </div>

                    {/* Form Conditional jika memiliki pendamping */}
                    {editingLansia.keluarga?.memiliki_pendamping && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-relationship">Hubungan dengan Lansia</Label>
                          <Select
                            value={editingLansia.keluarga?.hubungan_dengan_lansia || ""}
                            onValueChange={(value) => handleEditNestedChange("keluarga", "hubungan_dengan_lansia", value)}
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
                          <Label htmlFor="edit-availability">Ketersediaan Waktu</Label>
                          <Select
                            value={editingLansia.keluarga?.ketersediaan_waktu || ""}
                            onValueChange={(value) => handleEditNestedChange("keluarga", "ketersediaan_waktu", value)}
                          >
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
                          <Label htmlFor="edit-bkl-participation">Partisipasi Program BKL</Label>
                          <Select
                            value={editingLansia.keluarga?.partisipasi_program_bkl || ""}
                            onValueChange={(value) => handleEditNestedChange("keluarga", "partisipasi_program_bkl", value)}
                          >
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
                          <Label htmlFor="edit-dana-participation">Keterlibatan Dana</Label>
                          <Select
                            value={editingLansia.keluarga?.keterlibatan_data || ""}
                            onValueChange={(value) => handleEditNestedChange("keluarga", "keterlibatan_data", value)}
                          >
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
                          <Label htmlFor="edit-bkl-history">Riwayat Partisipasi BKL</Label>
                          <Select
                            value={editingLansia.keluarga?.riwayat_partisipasi_bkl || ""}
                            onValueChange={(value) => handleEditNestedChange("keluarga", "riwayat_partisipasi_bkl", value)}
                          >
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

                  </div>
                </TabsContent>

                <TabsContent value="adl" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-family-support">BAB (Buang Air Besar)</Label>
                      <Select
                        value={editingLansia.daily_living?.score_bab?.toString() || "0"}
                        onValueChange={(value) => handleEditNestedChange("daily_living", "score_bab", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          {adlGetOptions("bab").map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-family-support">BAK (Buang Air Kecil)</Label>
                      <Select
                        value={editingLansia.daily_living?.score_bak?.toString() || "0"}
                        onValueChange={(value) => handleEditNestedChange("daily_living", "score_bak", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          {adlGetOptions("bak").map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-family-support">Membersihkan Diri</Label>
                      <Select
                        value={editingLansia.daily_living?.score_membersihkan_diri?.toString() || "0"}
                        onValueChange={(value) => handleEditNestedChange("daily_living", "score_membersihkan_diri", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          {adlGetOptions("membersihkan_diri").map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-family-support">Menggunakan Toilet</Label>
                      <Select
                        value={editingLansia.daily_living?.score_toilet?.toString() || "0"}
                        onValueChange={(value) => handleEditNestedChange("daily_living", "score_toilet", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          {adlGetOptions("toilet").map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-family-support">Makan</Label>
                      <Select
                        value={editingLansia.daily_living?.score_makan?.toString() || "0"}
                        onValueChange={(value) => handleEditNestedChange("daily_living", "score_makan", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          {adlGetOptions("makan").map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-family-support">Pindah Tempat</Label>
                      <Select
                        value={editingLansia.daily_living?.score_pindah_tempat?.toString() || "0"}
                        onValueChange={(value) => handleEditNestedChange("daily_living", "score_pindah_tempat", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          {adlGetOptions("pindah_tempat").map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-family-support">Mobilitas</Label>
                      <Select
                        value={editingLansia.daily_living?.score_mobilitas?.toString() || "0"}
                        onValueChange={(value) => handleEditNestedChange("daily_living", "score_mobilitas", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          {adlGetOptions("mobilitas").map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-family-support">Berpakaian</Label>
                      <Select
                        value={editingLansia.daily_living?.score_berpakaian?.toString() || "0"}
                        onValueChange={(value) => handleEditNestedChange("daily_living", "score_berpakaian", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          {adlGetOptions("berpakaian").map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-family-support">Naik Turun Tangga</Label>
                      <Select
                        value={editingLansia.daily_living?.score_naik_turun_tangga?.toString() || "0"}
                        onValueChange={(value) => handleEditNestedChange("daily_living", "score_naik_turun_tangga", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          {adlGetOptions("naik_turun_tangga").map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-family-support">Mandi</Label>
                      <Select
                        value={editingLansia.daily_living?.score_mandi?.toString() || "0"}
                        onValueChange={(value) => handleEditNestedChange("daily_living", "score_mandi", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          {adlGetOptions("mandi").map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                   
                    

                  </div>
                </TabsContent>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function DataTablePage() {
  return (
    <RouteGuard requireAuth={true}>
      <DataTableContent />
    </RouteGuard>
  )
}
