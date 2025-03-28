// context/service/product.service.js
import { apiSlice } from "./api.service";

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addProduct: builder.mutation({
      query: (productData) => ({
        url: "/products/add",
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Product"],
    }),
    getProducts: builder.query({
      query: () => ({
        url: "/products",
        method: "GET",
      }),
      providesTags: ["Product"],
    }),
    getProductsByWarehouse: builder.query({
      query: (warehouseId) => ({
        url: `/products/warehouse/${warehouseId}`,
        method: "GET",
      }),
      providesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddProductMutation: useAddProductMutation, // Добавляем префикс Product
  useGetProductsQuery: useGetProductsQuery,
  useGetProductsByWarehouseQuery: useGetProductsByWarehouseQuery,
  useUpdateProductMutation: useUpdateProductMutation,
  useDeleteProductMutation: useDeleteProductMutation,
} = productApi;