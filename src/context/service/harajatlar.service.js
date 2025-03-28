import { apiSlice } from "./api.service"; // API xizmatini import qilish

// Backend API URL
export const harajatlarApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Xarajat qo'shish uchun POST so'rovi
    addExpense: builder.mutation({
      query: (newExpense) => ({
        url: "harajat/expenses", // Backend endpoint
        method: "POST",
        body: newExpense,
      }),
    }),
    // Xarajatlarni olish uchun GET so'rovi
    getExpenses: builder.query({
      query: () => "harajat/expenses", // Backend endpoint
    }),
  }),
});

export const { useAddExpenseMutation, useGetExpensesQuery } = harajatlarApi; // hook'larni eksport qilish
