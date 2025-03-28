import { apiSlice } from "./api.service";

// `storeApi` xizmatini yaratamiz va endpointlarni qo'shamiz
export const storeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addProductToStore: builder.mutation({
      query: (storeData) => ({
        url: "/store/add",
        method: "POST",
        body: storeData,
      }),
    }),
    createProductToStore: builder.mutation({
      query: (storeData) => ({
        url: "/store/product/create",
        method: "POST",
        body: storeData,
      }),
    }),
    updateQuantity: builder.mutation({
      query: ({ quantity, id }) => ({
        url: `/store/quantity/${id}`,
        method: "POST",
        body: { quantity: quantity },
      }),
      invalidatesTags: [""]
    }),
    vazvratTovar: builder.mutation({
      query: (body) => ({
        url: "/store/return",
        method: "POST",
        body,
      }),
    }),
    getStoreProducts: builder.query({
      query: () => ({
        url: "/store",
        method: "GET",
      }),
    }),
    removeProductFromStore: builder.mutation({
      query: (id) => ({
        url: `/store/${id}`,
        method: "DELETE",
      }),
    }),
    sellProductFromStore: builder.mutation({
      query: (saleData) => ({
        url: "/store/sell",
        method: "POST",
        body: saleData,
      }),
    }),
  }),
});

export const {
  useAddProductToStoreMutation,
  useVazvratTovarMutation,
  useCreateProductToStoreMutation,
  useGetStoreProductsQuery,
  useRemoveProductFromStoreMutation,
  useSellProductFromStoreMutation,
  useUpdateQuantityMutation,
} = storeApi;
