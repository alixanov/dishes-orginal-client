import { apiSlice } from "./api.service";

// `budgetApi` xizmatini yaratamiz va endpointlarni qo'shamiz
export const budgetApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBudget: builder.query({
      query: () => ({
        url: "/budget",
        method: "GET",
      }),
    }),
    updateBudget: builder.mutation({
      query: (amount) => ({
        url: "/budget",
        method: "PUT",
        body: { amount },
      }),
    }),
  }),
});

export const { useGetBudgetQuery, useUpdateBudgetMutation } = budgetApi;
