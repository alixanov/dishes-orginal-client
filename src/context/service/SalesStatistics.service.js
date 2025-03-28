import { apiSlice } from "./api.service";

// `salesStatisticsApi` xizmatini yaratamiz va endpointlarni qo'shamiz
export const salesStatisticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDailySales: builder.query({
      query: () => ({
        url: "/sales/daily",
        method: "GET",
      }),
    }),
    getWeeklySales: builder.query({
      query: () => ({
        url: "/sales/weekly",
        method: "GET",
      }),
    }),
    getMonthlySales: builder.query({
      query: () => ({
        url: "/sales/monthly",
        method: "GET",
      }),
    }),
    getYearlySales: builder.query({
      query: () => ({
        url: "/sales/yearly",
        method: "GET",
      }),
    }),
    compareStockLevels: builder.query({
      query: () => ({
        url: "/stock/compare",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetDailySalesQuery,
  useGetWeeklySalesQuery,
  useGetMonthlySalesQuery,
  useGetYearlySalesQuery,
  useCompareStockLevelsQuery,
} = salesStatisticsApi;
// 