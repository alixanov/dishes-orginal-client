import { apiSlice } from "./api.service";

export const clientApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createClient: builder.mutation({
      query: (clientData) => ({
        url: "/clients",
        method: "POST",
        body: clientData,
      }),
    }),
    getClients: builder.query({
      query: () => ({
        url: "/clients",
        method: "GET",
      }),
    }),
    getClientHistory: builder.query({
      query: (clientId) => ({
        url: `/clients/${clientId}/history`,
        method: "GET",
      }),
    }),
    updateClient: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/clients/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteClient: builder.mutation({
      query: (id) => ({
        url: `/clients/${id}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateClientMutation,
  useGetClientsQuery,
  useGetClientHistoryQuery,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientApi;
