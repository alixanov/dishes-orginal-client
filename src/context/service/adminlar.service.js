import { apiSlice } from "./api.service";

// `adminApi` xizmatini yaratamiz va endpointlarni qo'shamiz
export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signUpAsAdmin: builder.mutation({
      query: (credentials) => ({
        url: "/users/register",
        method: "POST",
        body: credentials,
      }),
    }),
    signInAsAdmin: builder.mutation({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getUsers: builder.query({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
    }),
    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/users/admin/${id}`,
        method: "DELETE",
      }),
    }),
    updateAdmin: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/admin/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useSignUpAsAdminMutation,
  useSignInAsAdminMutation,
  useGetUsersQuery,
  useDeleteAdminMutation,
  useUpdateAdminMutation,
} = adminApi;
