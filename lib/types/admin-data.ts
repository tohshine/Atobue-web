export type BooleanOptionMap = Record<string, boolean>;

export type AdminPlatformData = {
  _id: string;
  id: string;
  unit_categories: string[];
  rent_durations: string[];
  features: string[];
  services: BooleanOptionMap;
  amenities: BooleanOptionMap;
  __v?: number;
};

export type AddAdminDataRequest = Partial<{
  unit_categories: string[];
  rent_durations: string[];
  features: string[];
  services: BooleanOptionMap;
  amenities: BooleanOptionMap;
}>;

export type RemoveAdminDataRequest = Partial<{
  unit_categories: string[];
  rent_durations: string[];
  features: string[];
  services: Record<string, 1>;
  amenities: Record<string, 1>;
}>;

export type AdminDataSection =
  | "unit_categories"
  | "rent_durations"
  | "features"
  | "services"
  | "amenities";
