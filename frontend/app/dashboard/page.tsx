"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Heart,
  Home,
  TrendingUp,
  MapPin,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Loader2,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from "recharts"
import { dataAPI } from "@/lib/api"
import RouteGuard from "@/components/route-guard"
import RWMap from "@/components/map"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

interface UrgentNeedDetail {
  id: number
  nama_lengkap: string
  nik: string
  alamat_lengkap: string
  rt: string
  rw: string
  kebutuhan: string[]
}

function DashboardContent() {
  const [demographics, setDemographics] = useState<any>(null)
  const [healthStats, setHealthStats] = useState<any>(null)
  const [socialWelfare, setSocialWelfare] = useState<any>(null)
  const [needsPotential, setNeedsPotential] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [urgentNeedDetails, setUrgentNeedDetails] = useState<UrgentNeedDetail[]>([])
  const [isUrgentNeedModalOpen, setIsUrgentNeedModalOpen] = useState(false)
  const [selectedUrgentNeed, setSelectedUrgentNeed] = useState<string>("")
  const [isLoadingUrgentNeeds, setIsLoadingUrgentNeeds] = useState(false)
  const [urgentNeedError, setUrgentNeedError] = useState<string>("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [demoRes, healthRes, socialRes, needsRes] = await Promise.all([
        dataAPI.getDemographics(),
        dataAPI.getHealthStats(),
        dataAPI.getSocialWelfare(),
        dataAPI.getNeedsPotential(),
      ])

      setDemographics(await demoRes.json())
      setHealthStats(await healthRes.json())
      setSocialWelfare(await socialRes.json())
      setNeedsPotential(await needsRes.json())
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUrgentNeedDetails = async (needType: string) => {
    setIsLoadingUrgentNeeds(true)
    setUrgentNeedError("")

    try {
      console.log("Fetching urgent need details for:", needType)
      const response = await dataAPI.getUrgentNeedDetails(needType)

      if (response.ok) {
        const data = await response.json()
        console.log("Received data:", data)
        setUrgentNeedDetails(data)
        setSelectedUrgentNeed(needType)
        setIsUrgentNeedModalOpen(true)
      } else {
        const errorData = await response.json()
        setUrgentNeedError(errorData.error || "Terjadi kesalahan saat mengambil data")
        console.error("API Error:", errorData)
      }
    } catch (error) {
      console.error("Error fetching urgent need details:", error)
      setUrgentNeedError("Terjadi kesalahan jaringan")
    } finally {
      setIsLoadingUrgentNeeds(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitoring dan analisis data kesejahteraan lansia</p>
        </div>

        <Tabs defaultValue="demographics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="demographics" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Profil Demografi</span>
              <span className="sm:hidden">Demografi</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Kondisi Kesehatan</span>
              <span className="sm:hidden">Kesehatan</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Kesejahteraan Sosial</span>
              <span className="sm:hidden">Sosial</span>
            </TabsTrigger>
            <TabsTrigger value="needs" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Kebutuhan & Potensi</span>
              <span className="sm:hidden">Potensi</span>
            </TabsTrigger>
          </TabsList>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Lansia</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demographics?.total_lansia || 0}</div>
                  <p className="text-xs text-muted-foreground">Terdaftar di wilayah</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Laki-laki</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {demographics?.by_gender?.find((g: any) => g.gender === "Laki-laki")?.count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Lansia laki-laki</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Perempuan</CardTitle>
                  <Users className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {demographics?.by_gender?.find((g: any) => g.gender === "Perempuan")?.count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Lansia perempuan</p>
                </CardContent>
              </Card>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribusi Kelompok Usia</CardTitle>
                  <CardDescription>Pembagian lansia berdasarkan kelompok usia</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={demographics?.by_age_group || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="group" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* <Card>
                <CardHeader>
                  <CardTitle>Sebaran per RT/RW</CardTitle>
                  <CardDescription>Konsentrasi lansia di setiap wilayah</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {demographics?.by_location?.map((location: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            RT {location.rt} / RW {location.rw}
                          </span>
                        </div>
                        <Badge variant="secondary">{location.count} orang</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card> */}
              <Card>
                <RWMap />
              </Card>
            </div>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sehat Mandiri</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {healthStats?.health_conditions?.find((h: any) => h.condition === "Sehat")?.count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Kondisi sehat mandiri</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Butuh Bantuan</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {healthStats?.help_needed || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Membutuhkan bantuan</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ketergantungan</CardTitle>
                  <Heart className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {healthStats?.dependence_condition?.find((h: any) => h.condition === "Ketergantungan total")?.count ||
                      0}
                  </div>
                  <p className="text-xs text-muted-foreground">Ketergantungan total</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prevalensi Penyakit Kronis</CardTitle>
                  <CardDescription>Penyakit kronis yang umum diderita lansia</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={healthStats?.chronic_diseases || []}
                      margin={{ top: 30, right: 30, left: 10, bottom: 80 }}
                    >
                      {/* Efek gradasi warna batang */}
                      <defs>
                        <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#f87171" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      
                      {/* Label X miring agar semua terlihat */}
                      <XAxis
                        dataKey="disease"
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                        height={80}
                        tick={{ fill: "#374151", fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: "#374151", fontSize: 12 }} />
                      
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                        }}
                        formatter={(value: number) => [`${value} kasus`, "Jumlah"]}
                      />

                      {/* Bar dengan label di atas */}
                      <Bar
                        dataKey="count"
                        fill="url(#barColor)"
                        radius={[6, 6, 0, 0]}
                        animationDuration={1000}
                      >
                        <LabelList
                          dataKey="count"
                          position="top"
                          fill="#111827"
                          fontSize={12}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Gizi</CardTitle>
                  <CardDescription>Distribusi status gizi lansia</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={healthStats?.nutrition_status || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percent }: any) => `${status} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                      >
                        {(healthStats?.nutrition_status || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Welfare Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tinggal Sendiri</CardTitle>
                  <Home className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    
                    {socialWelfare?.housing_conditions?.find((l: any) => l.condition === "Tinggal Sendiri")?.count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Lansia hidup sendiri</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rumah Layak</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {socialWelfare?.housing_conditions?.find((h: any) => h.condition === "Layak Huni")?.count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Kondisi rumah layak</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Butuh Bantuan</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{socialWelfare?.urgent_needs?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Jenis kebutuhan mendesak</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kondisi Tempat Tinggal</CardTitle>
                  <CardDescription>Status kondisi rumah lansia</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={socialWelfare?.housing_conditions || []}
                      margin={{ top: 30, right: 30, left: 10, bottom: 80 }}
                    >
                      {/* Efek gradasi warna batang */}
                      <defs>
                        <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#f87171" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      
                      {/* Label X miring agar semua terlihat */}
                      <XAxis
                        dataKey="condition"
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                        height={80}
                        tick={{ fill: "#374151", fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: "#374151", fontSize: 12 }} />
                      
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                        }}
                        formatter={(value: number) => [`${value} kasus`, "Jumlah"]}
                      />

                      {/* Bar dengan label di atas */}
                      <Bar
                        dataKey="count"
                        fill="url(#barColor)"
                        radius={[6, 6, 0, 0]}
                        animationDuration={1000}
                      >
                        <LabelList
                          dataKey="count"
                          position="top"
                          fill="#111827"
                          fontSize={12}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {/* <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={socialWelfare?.housing_conditions || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="condition" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer> */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kebutuhan Mendesak</CardTitle>
                  <CardDescription>Bantuan yang dibutuhkan lansia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {socialWelfare?.urgent_needs?.map((need: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="font-medium">{need.need}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive">{need.count} kasus</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchUrgentNeedDetails(need.need)}
                            disabled={isLoadingUrgentNeeds}
                          >
                            {isLoadingUrgentNeeds ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Needs & Potential Tab */}
          <TabsContent value="needs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktif BKL</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {needsPotential?.participation?.reduce((sum: number, p: any) => sum + p.count, 0) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Berpartisipasi dalam BKL</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Jenis Kegiatan</CardTitle>
                  <Activity className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{needsPotential?.activities?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Variasi kegiatan</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Partisipasi Kelompok</CardTitle>
                  <CardDescription>Keterlibatan dalam kelompok lansia</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={needsPotential?.participation || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ group, percent }: any) => `${group} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="group"
                      >
                        {(needsPotential?.participation || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kegiatan Populer</CardTitle>
                  <CardDescription>Jenis kegiatan yang paling diminati</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {needsPotential?.activities?.slice(0, 5).map((activity: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{activity.activity}</span>
                        </div>
                        <Badge variant="secondary">{activity.count} peserta</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Urgent Need Details Modal */}
        <Dialog open={isUrgentNeedModalOpen} onOpenChange={setIsUrgentNeedModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Kebutuhan Mendesak: {selectedUrgentNeed}</DialogTitle>
              <DialogDescription>
                Daftar lansia yang membutuhkan bantuan {selectedUrgentNeed.toLowerCase()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {urgentNeedError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{urgentNeedError}</AlertDescription>
                </Alert>
              )}

              {isLoadingUrgentNeeds ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2">Memuat data...</span>
                </div>
              ) : urgentNeedDetails.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Nama</th>
                        <th className="text-left p-3 font-semibold">NIK</th>
                        <th className="text-left p-3 font-semibold">Alamat</th>
                        <th className="text-left p-3 font-semibold">RT/RW</th>
                        <th className="text-left p-3 font-semibold">Kebutuhan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {urgentNeedDetails.map((person) => (
                        <tr key={person.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{person.nama_lengkap}</td>
                          <td className="p-3 font-mono text-sm">{person.nik}</td>
                          <td className="p-3 max-w-xs truncate">{person.alamat_lengkap}</td>
                          <td className="p-3">
                            RT {person.rt} / RW {person.rw}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {person.kebutuhan.map((need, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                  {need}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : !isLoadingUrgentNeeds && !urgentNeedError ? (
                <p className="text-center text-gray-500 py-8">Tidak ada data yang tersedia</p>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardContent />
    </RouteGuard>
  )
}
