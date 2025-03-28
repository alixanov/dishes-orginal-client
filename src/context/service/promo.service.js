import { apiSlice } from "./api.service";

export const promoApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createPromo: builder.mutation({
            query: (promoData) => ({
                url: "/promo",
                method: "POST",
                body: promoData,
            }),
            invalidatesTags: ["Promo"]
        }),
        getPromos: builder.query({
            query: () => ({
                url: "/promo",
                method: "GET",
            }),
            providesTags: ["Promo"]
        }),
        updatePromo: builder.mutation({
            query: (promoData) => ({
                url: `/promo/${promoData.id}`,
                method: "PUT",
                body: promoData,
            }),
            invalidatesTags: ["Promo"]
        }),
        deletePromo: builder.mutation({
            query: (promoId) => ({
                url: `/promo/${promoId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Promo"]
        }),
    })
})

export const {
    useCreatePromoMutation,
    useGetPromosQuery,
    useUpdatePromoMutation,
    useDeletePromoMutation,
} = promoApi;