import { apiSlice } from "./api.service";

export const salesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sellProduct: builder.mutation({
      query: (saleData) => ({
        url: "/sales/sell",
        method: "POST",
        body: saleData,
      }),
      invalidatesTags: ["Sale", "Product"],
    }),
    getSalesHistory: builder.query({
      query: () => ({
        url: "/sales/history",
        method: "GET",
      }),
      providesTags: ["Sale"],
    }),
    getClientHistory: builder.query({
      query: (clientId) => ({
        url: `/clients/${clientId}/history`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useSellProductMutation,
  useGetSalesHistoryQuery,
  useGetClientHistoryQuery,
} = salesApi;
