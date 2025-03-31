import { apiSlice } from './api.service';

export const actPartnerApi = apiSlice.injectEndpoints({
     endpoints: (builder) => ({
          getActPartners: builder.query({
               query: () => '/actpartner',
               providesTags: ['ActPartner'],
          }),
          createActPartner: builder.mutation({
               query: (partner) => ({
                    url: '/actpartner/add',
                    method: 'POST',
                    body: partner,
               }),
               invalidatesTags: ['ActPartner'],
          }),
          updateActPartner: builder.mutation({
               query: ({ id, ...partner }) => ({
                    url: `/actpartner/${id}`,
                    method: 'PUT',
                    body: partner,
               }),
               invalidatesTags: ['ActPartner'],
          }),
          deleteActPartner: builder.mutation({
               query: (id) => ({
                    url: `/actpartner/${id}`,
                    method: 'DELETE',
               }),
               invalidatesTags: ['ActPartner'],
          }),
     }),
});

export const {
     useGetActPartnersQuery,
     useCreateActPartnerMutation,
     useUpdateActPartnerMutation,
     useDeleteActPartnerMutation,
} = actPartnerApi;