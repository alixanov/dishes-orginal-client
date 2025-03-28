import { apiSlice } from "./api.service";

// `brakApi` xizmatini yaratamiz va endpointlarni qo'shamiz
export const brakApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addBrak: builder.mutation({
      query: (brakData) => ({
        url: "/brak/add",
        method: "POST",
        body: brakData,
      }),
      invalidatesTags: ['brak']
    }),
    getBrakHistory: builder.query({
      query: () => ({
        url: "/brak/history",
        method: "GET",
      }),
      providesTags: ['brak']
    }),
    searchProducts: builder.query({
      query: (searchTerm) => ({
        url: `/products?search=${searchTerm}`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddBrakMutation,
  useGetBrakHistoryQuery,
  useSearchProductsQuery,
} = brakApi;
