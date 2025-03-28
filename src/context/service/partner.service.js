// context/service/productPartnerService.js
import { apiSlice } from "./api.service";

export const productPartnerApi = apiSlice.injectEndpoints({
     endpoints: (builder) => ({
          addProductPartner: builder.mutation({
               query: (productData) => ({
                    url: "/partner/add",
                    method: "POST",
                    body: productData,
               }),
               invalidatesTags: ["ProductPartner"],
          }),
          getProductsPartner: builder.query({
               query: () => ({
                    url: "/partner",
                    method: "GET",
               }),
               providesTags: ["ProductPartner"],
          }),
          getProductsByWarehousePartner: builder.query({
               query: (warehouseId) => ({
                    url: `/partner/warehouse/${warehouseId}`,
                    method: "GET",
               }),
               providesTags: ["ProductPartner"],
          }),
          updateProductPartner: builder.mutation({
               query: ({ id, data }) => ({
                    url: `/partner/${id}`,
                    method: "PUT",
                    body: data,
               }),
               invalidatesTags: ["ProductPartner"],
          }),
          deleteProductPartner: builder.mutation({
               query: (id) => ({
                    url: `/partner/${id}`,
                    method: "DELETE",
               }),
               invalidatesTags: ["ProductPartner"],
          }),
     }),
     overrideExisting: false,
});

export const {
     // useAddProductMutation: useAddProductPartnerMutation, // Добавляем префикс Partner
     // useGetProductsQuery: useGetProductsPartnerQuery,
     // useGetProductsByWarehouseQuery: useGetProductsByWarehousePartnerQuery,
     // useUpdateProductMutation: useUpdateProductPartnerMutation,
     // useDeleteProductMutation: useDeleteProductPartnerMutation,
     useAddProductPartnerMutation,
     useGetProductsPartnerQuery,
     useGetProductsByWarehousePartnerQuery,
     useDeleteProductPartnerMutation,
     useUpdateProductPartnerMutation,

} = productPartnerApi;