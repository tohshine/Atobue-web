import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "./baseQuery";
import { apiTagTypes } from "./tags";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: apiTagTypes,
  endpoints: () => ({}),
});
