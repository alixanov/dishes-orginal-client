import { apiSlice } from "./api.service";

// `saleApi` xizmatini yaratamiz va endpointlarni qo'shamiz
export const saleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    recordSale: builder.mutation({
      query: (sale) => ({
        url: "/sales",
        method: "POST",
        body: sale,
      }),
    }),
    getSalesHistory: builder.query({
      query: () => ({
        url: "/sales",
        method: "GET",
      }),
    }),
  }),
});

export const { useRecordSaleMutation, useGetSalesHistoryQuery } = saleApi;
