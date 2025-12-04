import { apiCall } from "@/lib/api"

export const dataAPI = {
  getLansia: () => apiCall("/api/lansia"),
  getLansiaDetail: (id: number) => apiCall(`/api/lansia/${id}`),
}
