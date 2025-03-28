import { apiSlice } from "./api.service";

// `omborApi` xizmatini yaratamiz va endpointlarni qo'shamiz
export const omborApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addWarehouse: builder.mutation({
      query: (warehouseData) => ({
        url: "/warehouses/add",
        method: "POST",
        body: warehouseData,
      }),
    }),
    getWarehouses: builder.query({
      query: () => ({
        url: "/warehouses",
        method: "GET",
      }),
    }),
    updateWarehouse: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/warehouses/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteWarehouse: builder.mutation({
      query: (id) => ({
        url: `/warehouses/${id}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddWarehouseMutation,
  useGetWarehousesQuery,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = omborApi;
