export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
export const dynamic = "force-dynamic";

// API helper function
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders = {
    "Content-Type": "application/json",
  }

  const config: RequestInit = {
    ...options,
    credentials: "include", // Important for session cookies
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    return response
  } catch (error) {
    console.error("API call failed:", error)
    throw error
  }
}

// Specific API functions
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    apiCall("/api/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    apiCall("/api/logout", {
      method: "POST",
    }),

  checkAuth: () => apiCall("/api/check-auth"),

  forgotPassword: (email: string) =>
    apiCall("/api/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiCall("/api/reset-password", {
      method: "PUT",
      headers: {
      "Content-Type": "application/json" // ⬅️ tambahkan ini
    },
      body: JSON.stringify({ token, password }),
    }),

  // resetPassword: (token: string, newPassword: string) =>
  //   apiCall(`/api/forgot-password/${encodeURIComponent(token)}`,{
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ password: newPassword })
  //   }),
  }

export const dataAPI = {
  getLansia: (page = 1, perPage = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...filters,
    })
    return apiCall(`/api/lansia?${params}`)
  },

  getLansiaDetail: (id: number) => apiCall(`/api/lansia/${id}`),

  createLansia: (data: any) =>
    apiCall("/api/lansia", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateLansia: (id: number, data: any) =>
    apiCall(`/api/lansia/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteLansia: (id: number) =>
    apiCall(`/api/lansia/${id}`, {
      method: "DELETE",
    }),

  bulkDeleteLansia: (ids: number[]) =>
    apiCall("/api/lansia/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),

  getFilterOptions: () => apiCall("/api/filter-options"),

  getDemographics: () => apiCall("/api/dashboard/demographics"),
  getHealthStats: () => apiCall("/api/dashboard/health"),
  getSocialWelfare: () => apiCall("/api/dashboard/social-welfare"),
  getNeedsPotential: () => apiCall("/api/dashboard/needs-potential"),
  getUrgentNeedDetails: (needType: string) =>
    apiCall(`/api/dashboard/urgent-need-details/${encodeURIComponent(needType)}`),

  exportTemplate: () => apiCall("/api/export-template"),
  uploadExcel: () => apiCall("api/upload-excel"),
}
