import type {
  AddAdminDataRequest,
  AdminPlatformData,
  BooleanOptionMap,
  RemoveAdminDataRequest,
} from "@/lib/types";
import type { AdminDataApiResponse } from "@/lib/types/api-responses";
import { baseApi } from "./base";
import { apiRoutes } from "./routes";
import { apiTags } from "./tags";

type StringSectionKey = "unit_categories" | "rent_durations" | "features";
type BooleanSectionKey = "services" | "amenities";

const adminDataTags = [
  { type: apiTags.adminData, id: "UNIT_CATEGORIES" },
  { type: apiTags.adminData, id: "DURATIONS" },
  { type: apiTags.adminData, id: "SERVICES" },
  { type: apiTags.adminData, id: "AMENITIES" },
  { type: apiTags.adminData, id: "FEATURES" },
] as const;

const SECTION_TAG_IDS: Record<
  keyof AddAdminDataRequest,
  (typeof adminDataTags)[number]["id"]
> = {
  unit_categories: "UNIT_CATEGORIES",
  rent_durations: "DURATIONS",
  features: "FEATURES",
  services: "SERVICES",
  amenities: "AMENITIES",
};

function unwrapData(response: unknown): unknown {
  if (typeof response === "object" && response !== null && "data" in response) {
    return (response as AdminDataApiResponse).data;
  }

  return response;
}

function isPlatformData(value: unknown): value is AdminPlatformData {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    ("unit_categories" in value ||
      "rent_durations" in value ||
      "features" in value ||
      "services" in value ||
      "amenities" in value)
  );
}

function extractStringSection(
  response: unknown,
  section: StringSectionKey,
  allowArrayFallback = true,
): string[] {
  const data = unwrapData(response);

  if (isPlatformData(data) && Array.isArray(data[section])) {
    return data[section];
  }

  if (allowArrayFallback && Array.isArray(data)) {
    return data;
  }

  return [];
}

function extractBooleanSection(response: unknown, section: BooleanSectionKey): BooleanOptionMap {
  const data = unwrapData(response);

  if (isPlatformData(data) && typeof data[section] === "object" && data[section] !== null) {
    return data[section];
  }

  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    return data as BooleanOptionMap;
  }

  return {};
}

function normalizePlatformData(response: unknown): AdminPlatformData {
  const data = unwrapData(response);

  if (isPlatformData(data)) {
    return data;
  }

  return response as AdminPlatformData;
}

function tagsForPayload(payload: AddAdminDataRequest | RemoveAdminDataRequest) {
  const keys = Object.keys(payload) as Array<keyof AddAdminDataRequest>;
  if (keys.length === 0) {
    return [...adminDataTags];
  }

  return keys.map((key) => ({
    type: apiTags.adminData,
    id: SECTION_TAG_IDS[key],
  }));
}

export const adminDataApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUnitCategories: builder.query<string[], void>({
      query: () => apiRoutes.adminData.unitCategories,
      transformResponse: (response) => extractStringSection(response, "unit_categories"),
      providesTags: [{ type: apiTags.adminData, id: "UNIT_CATEGORIES" }],
    }),
    getRentDurations: builder.query<string[], void>({
      query: () => apiRoutes.adminData.durations,
      transformResponse: (response) => extractStringSection(response, "rent_durations"),
      providesTags: [{ type: apiTags.adminData, id: "DURATIONS" }],
    }),
    getFeatures: builder.query<string[], void>({
      query: () => apiRoutes.adminData.features,
      transformResponse: (response) => extractStringSection(response, "features"),
      providesTags: [{ type: apiTags.adminData, id: "FEATURES" }],
    }),
    getServices: builder.query<BooleanOptionMap, void>({
      query: () => apiRoutes.adminData.services,
      transformResponse: (response) => extractBooleanSection(response, "services"),
      providesTags: [{ type: apiTags.adminData, id: "SERVICES" }],
    }),
    getAmenities: builder.query<BooleanOptionMap, void>({
      query: () => apiRoutes.adminData.amenities,
      transformResponse: (response) => extractBooleanSection(response, "amenities"),
      providesTags: [{ type: apiTags.adminData, id: "AMENITIES" }],
    }),
    addAdminData: builder.mutation<AdminPlatformData, AddAdminDataRequest>({
      query: (body) => ({
        url: apiRoutes.adminData.add,
        method: "POST",
        body,
      }),
      transformResponse: normalizePlatformData,
      invalidatesTags: (_result, _error, body) => tagsForPayload(body),
    }),
    removeAdminData: builder.mutation<AdminPlatformData, RemoveAdminDataRequest>({
      query: (body) => ({
        url: apiRoutes.adminData.remove,
        method: "PUT",
        body,
      }),
      transformResponse: normalizePlatformData,
      invalidatesTags: (_result, _error, body) => tagsForPayload(body),
    }),
  }),
});

export const {
  useGetUnitCategoriesQuery,
  useGetRentDurationsQuery,
  useGetFeaturesQuery,
  useGetServicesQuery,
  useGetAmenitiesQuery,
  useAddAdminDataMutation,
  useRemoveAdminDataMutation,
} = adminDataApi;
