// context/service/report.service.js
import { apiSlice } from "./api.service";

export const reportApi = apiSlice.injectEndpoints({
     endpoints: (builder) => ({
          getReports: builder.query({
               query: (id) => `/reports?id=${id}`, // Изменяем параметр на более общий "id"
               transformResponse: (response) => {
                    if (Array.isArray(response?.data)) return response.data;
                    if (Array.isArray(response)) return response;
                    return [];
               },
               providesTags: (result) =>
                    result ? [...result.map(({ _id }) => ({ type: "Report", id: _id })), "Report"] : ["Report"],
          }),
          createReport: builder.mutation({
               query: (reportData) => ({
                    url: "/reports/add",
                    method: "POST",
                    body: reportData,
               }),
               invalidatesTags: ["Report"],
          }),
          updateReport: builder.mutation({
               query: ({ id, ...reportData }) => ({
                    url: `/reports/${id}`,
                    method: "PUT",
                    body: reportData,
               }),
               invalidatesTags: (_, __, { id }) => [{ type: "Report", id }],
          }),
          deleteReport: builder.mutation({
               query: (id) => ({
                    url: `/reports/${id}`,
                    method: "DELETE",
               }),
               invalidatesTags: (_, __, id) => [{ type: "Report", id }],
          }),
     }),
});

export const {
     useGetReportsQuery,
     useCreateReportMutation,
     useUpdateReportMutation,
     useDeleteReportMutation,
} = reportApi;