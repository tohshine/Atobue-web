"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { AddAdminDataRequest, AdminDataSection, RemoveAdminDataRequest } from "@/lib/types";
import {
  useAddAdminDataMutation,
  useGetAmenitiesQuery,
  useGetFeaturesQuery,
  useGetRentDurationsQuery,
  useGetServicesQuery,
  useGetUnitCategoriesQuery,
  useRemoveAdminDataMutation,
} from "@/lib/api";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

type CatalogTab = {
  id: AdminDataSection;
  label: string;
  description: string;
  kind: "strings" | "booleans";
};

const TABS: CatalogTab[] = [
  {
    id: "unit_categories",
    label: "Unit Categories",
    description: "Property types available when listing units.",
    kind: "strings",
  },
  {
    id: "rent_durations",
    label: "Rent Durations",
    description: "Billing periods tenants can choose from.",
    kind: "strings",
  },
  {
    id: "features",
    label: "Features",
    description: "Utility and infrastructure options for listings.",
    kind: "strings",
  },
  {
    id: "services",
    label: "Services",
    description: "Optional compound services landlords can offer.",
    kind: "booleans",
  },
  {
    id: "amenities",
    label: "Amenities",
    description: "In-unit amenities available on property forms.",
    kind: "booleans",
  },
];

function formatLabel(value: string) {
  return value
    .split(/[,_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeInput(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function toSnakeKey(value: string) {
  return normalizeInput(value).toLowerCase().replace(/\s+/g, "_");
}

function StringCatalogPanel({
  items,
  isLoading,
  isError,
  isBusy,
  onRetry,
  onAdd,
  onRequestRemove,
}: {
  items: string[];
  isLoading: boolean;
  isError: boolean;
  isBusy: boolean;
  onRetry: () => void;
  onAdd: (value: string) => Promise<void>;
  onRequestRemove: (value: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return items;
    }

    return items.filter((item) => item.toLowerCase().includes(needle));
  }, [items, query]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const value = normalizeInput(draft);
    if (!value) {
      return;
    }

    await onAdd(value);
    setDraft("");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/60">
          {items.length} item{items.length === 1 ? "" : "s"} configured
        </p>
        <label className="relative w-full sm:max-w-xs">
          <span className="sr-only">Filter items</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter items..."
            className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 pr-3 pl-9 text-sm text-white/90 outline-none transition placeholder:text-white/35 focus:border-(--brand)/50 focus:ring-2 focus:ring-(--brand)/20"
          />
          <svg
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </label>
      </div>

      <div className="min-h-[220px] rounded-2xl border border-white/10 bg-black/20 p-4">
        {isLoading ? (
          <div className="flex h-[188px] items-center justify-center text-sm text-white/50">Loading catalog...</div>
        ) : isError ? (
          <div className="flex h-[188px] flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-rose-100">Unable to load this section.</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85 transition hover:bg-white/10"
            >
              Retry
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex h-[188px] flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-white/70">{query ? "No matches for your filter." : "No items yet."}</p>
            <p className="text-xs text-white/45">Add a value below to make it available across the platform.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredItems.map((item) => (
              <span
                key={item}
                className="group inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-sm text-cyan-50"
              >
                <span className="truncate">{item}</span>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onRequestRemove(item)}
                  className="rounded-full p-0.5 text-cyan-100/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                  aria-label={`Remove ${item}`}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M18 6 6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add new value..."
          disabled={isBusy}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 outline-none transition placeholder:text-white/35 focus:border-(--brand)/50 focus:ring-2 focus:ring-(--brand)/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isBusy || !normalizeInput(draft)}
          className="rounded-xl bg-(--brand) px-5 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Add Item
        </button>
      </form>
    </div>
  );
}

function BooleanCatalogPanel({
  items,
  isLoading,
  isError,
  isBusy,
  onRetry,
  onAdd,
  onRequestRemove,
}: {
  items: Record<string, boolean>;
  isLoading: boolean;
  isError: boolean;
  isBusy: boolean;
  onRetry: () => void;
  onAdd: (key: string) => Promise<void>;
  onRequestRemove: (key: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");

  const entries = useMemo(() => Object.keys(items).sort(), [items]);

  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return entries;
    }

    return entries.filter(
      (key) => key.toLowerCase().includes(needle) || formatLabel(key).toLowerCase().includes(needle),
    );
  }, [entries, query]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const key = toSnakeKey(draft);
    if (!key) {
      return;
    }

    await onAdd(key);
    setDraft("");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/60">
          {entries.length} option{entries.length === 1 ? "" : "s"} configured
        </p>
        <label className="relative w-full sm:max-w-xs">
          <span className="sr-only">Filter options</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter options..."
            className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 pr-3 pl-9 text-sm text-white/90 outline-none transition placeholder:text-white/35 focus:border-(--brand)/50 focus:ring-2 focus:ring-(--brand)/20"
          />
          <svg
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </label>
      </div>

      <div className="min-h-[220px] rounded-2xl border border-white/10 bg-black/20 p-3">
        {isLoading ? (
          <div className="flex h-[196px] items-center justify-center text-sm text-white/50">Loading catalog...</div>
        ) : isError ? (
          <div className="flex h-[196px] flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-rose-100">Unable to load this section.</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85 transition hover:bg-white/10"
            >
              Retry
            </button>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex h-[196px] flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-white/70">{query ? "No matches for your filter." : "No options yet."}</p>
            <p className="text-xs text-white/45">New keys are registered with a default value of false.</p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredEntries.map((key) => (
              <article
                key={key}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/5 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white/90">{formatLabel(key)}</p>
                  <p className="truncate text-[11px] text-white/45">{key}</p>
                </div>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onRequestRemove(key)}
                  className="shrink-0 rounded-lg border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-rose-100 transition hover:bg-rose-400/20 disabled:opacity-40"
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add option key (e.g. bench press)"
          disabled={isBusy}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 outline-none transition placeholder:text-white/35 focus:border-(--brand)/50 focus:ring-2 focus:ring-(--brand)/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isBusy || !toSnakeKey(draft)}
          className="rounded-xl bg-(--brand) px-5 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Add Option
        </button>
      </form>
    </div>
  );
}

export default function DataCatalogManager() {
  const [activeTab, setActiveTab] = useState<AdminDataSection>("unit_categories");
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [loadedTabs, setLoadedTabs] = useState<Set<AdminDataSection>>(() => new Set(["unit_categories"]));
  const [pendingDelete, setPendingDelete] = useState<{ itemLabel: string; confirm: () => Promise<boolean> } | null>(
    null,
  );

  useEffect(() => {
    setLoadedTabs((current) => {
      if (current.has(activeTab)) {
        return current;
      }

      const next = new Set(current);
      next.add(activeTab);
      return next;
    });
    setPendingDelete(null);
  }, [activeTab]);

  const shouldLoad = (section: AdminDataSection) => loadedTabs.has(section);

  const unitCategoriesQuery = useGetUnitCategoriesQuery(undefined, {
    skip: !shouldLoad("unit_categories"),
  });
  const durationsQuery = useGetRentDurationsQuery(undefined, {
    skip: !shouldLoad("rent_durations"),
  });
  const featuresQuery = useGetFeaturesQuery(undefined, {
    skip: !shouldLoad("features"),
  });
  const servicesQuery = useGetServicesQuery(undefined, {
    skip: !shouldLoad("services"),
  });
  const amenitiesQuery = useGetAmenitiesQuery(undefined, {
    skip: !shouldLoad("amenities"),
  });

  const [addAdminData, addState] = useAddAdminDataMutation();
  const [removeAdminData, removeState] = useRemoveAdminDataMutation();

  const isBusy = addState.isLoading || removeState.isLoading;
  const activeTabMeta = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  const counts = useMemo(
    () => ({
      unit_categories: unitCategoriesQuery.data?.length ?? 0,
      rent_durations: durationsQuery.data?.length ?? 0,
      features: featuresQuery.data?.length ?? 0,
      services: Object.keys(servicesQuery.data ?? {}).length,
      amenities: Object.keys(amenitiesQuery.data ?? {}).length,
    }),
    [unitCategoriesQuery.data, durationsQuery.data, featuresQuery.data, servicesQuery.data, amenitiesQuery.data],
  );

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const runAdd = async (body: AddAdminDataRequest, successMessage: string) => {
    setFeedback(null);

    try {
      await addAdminData(body).unwrap();
      setFeedback({ tone: "success", message: successMessage });
    } catch {
      setFeedback({ tone: "error", message: "Unable to update catalog. Please try again." });
    }
  };

  const runRemove = async (body: RemoveAdminDataRequest, successMessage: string) => {
    setFeedback(null);

    try {
      await removeAdminData(body).unwrap();
      setFeedback({ tone: "success", message: successMessage });
      return true;
    } catch {
      setFeedback({ tone: "error", message: "Unable to update catalog. Please try again." });
      return false;
    }
  };

  const addStringItem = async (section: Extract<AdminDataSection, "unit_categories" | "rent_durations" | "features">, value: string) => {
    const body: AddAdminDataRequest = { [section]: [value] };
    await runAdd(body, `"${value}" added to ${activeTabMeta.label.toLowerCase()}.`);
  };

  const removeStringItem = async (
    section: Extract<AdminDataSection, "unit_categories" | "rent_durations" | "features">,
    value: string,
  ) => {
    const body: RemoveAdminDataRequest = { [section]: [value] };
    return runRemove(body, `"${value}" removed from ${activeTabMeta.label.toLowerCase()}.`);
  };

  const addBooleanItem = async (section: Extract<AdminDataSection, "services" | "amenities">, key: string) => {
    const body: AddAdminDataRequest = { [section]: { [key]: false } };
    await runAdd(body, `"${formatLabel(key)}" added to ${activeTabMeta.label.toLowerCase()}.`);
  };

  const removeBooleanItem = async (section: Extract<AdminDataSection, "services" | "amenities">, key: string) => {
    const body: RemoveAdminDataRequest = { [section]: { [key]: 1 } };
    return runRemove(body, `"${formatLabel(key)}" removed from ${activeTabMeta.label.toLowerCase()}.`);
  };

  const requestRemoveStringItem = (
    section: Extract<AdminDataSection, "unit_categories" | "rent_durations" | "features">,
    value: string,
  ) => {
    setPendingDelete({
      itemLabel: value,
      confirm: () => removeStringItem(section, value),
    });
  };

  const requestRemoveBooleanItem = (section: Extract<AdminDataSection, "services" | "amenities">, key: string) => {
    setPendingDelete({
      itemLabel: formatLabel(key),
      confirm: () => removeBooleanItem(section, key),
    });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    const success = await pendingDelete.confirm();
    if (success) {
      setPendingDelete(null);
    }
  };

  const sectionQueries = {
    unit_categories: unitCategoriesQuery,
    rent_durations: durationsQuery,
    features: featuresQuery,
    services: servicesQuery,
    amenities: amenitiesQuery,
  } as const;

  const activeQuery = sectionQueries[activeTab];
  const showCount = (section: AdminDataSection) =>
    loadedTabs.has(section) ? counts[section] : "—";

  return (
    <section className="card-soft overflow-hidden rounded-3xl">
      <div className="border-b border-white/10 bg-linear-to-r from-(--brand)/10 via-transparent to-violet-400/10 px-5 py-6 md:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-(--brand)">Platform Catalog</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Listing Data Controls</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              Manage the options tenants and landlords see when creating or browsing listings. Changes apply
              platform-wide immediately.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {TABS.map((tab) => (
              <div key={tab.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-white/45">{tab.label.split(" ")[0]}</p>
                <p className="mt-1 text-lg font-semibold text-white">{showCount(tab.id)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeQuery.isError ? (
        <div className="border-b border-rose-400/20 bg-rose-400/10 px-5 py-3 text-sm text-rose-100 md:px-7">
          Could not load {activeTabMeta.label.toLowerCase()}. Use retry below or switch tabs and come back.
        </div>
      ) : null}

      {feedback ? (
        <div
          className={[
            "border-b px-5 py-3 text-sm md:px-7",
            feedback.tone === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
              : "border-rose-400/20 bg-rose-400/10 text-rose-100",
          ].join(" ")}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="border-b border-white/10 p-3 lg:border-r lg:border-b-0 lg:p-4">
          <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {TABS.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <li key={tab.id} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      "w-full rounded-2xl px-4 py-3 text-left transition",
                      active
                        ? "bg-(--brand)/15 text-white ring-1 ring-(--brand)/30"
                        : "text-white/65 hover:bg-white/5 hover:text-white/90",
                    ].join(" ")}
                  >
                    <p className="text-sm font-medium">{tab.label}</p>
                    <p className="mt-1 text-[11px] text-white/45">{showCount(tab.id)} entries</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-5 md:p-7">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-white/95">{activeTabMeta.label}</h3>
            <p className="mt-1 text-sm text-white/60">{activeTabMeta.description}</p>
          </div>

          {activeTab === "unit_categories" ? (
            <StringCatalogPanel
              items={unitCategoriesQuery.data ?? []}
              isLoading={unitCategoriesQuery.isLoading}
              isError={Boolean(unitCategoriesQuery.isError)}
              isBusy={isBusy}
              onRetry={() => unitCategoriesQuery.refetch()}
              onAdd={(value) => addStringItem("unit_categories", value)}
              onRequestRemove={(value) => requestRemoveStringItem("unit_categories", value)}
            />
          ) : null}

          {activeTab === "rent_durations" ? (
            <StringCatalogPanel
              items={durationsQuery.data ?? []}
              isLoading={durationsQuery.isLoading}
              isError={Boolean(durationsQuery.isError)}
              isBusy={isBusy}
              onRetry={() => durationsQuery.refetch()}
              onAdd={(value) => addStringItem("rent_durations", value)}
              onRequestRemove={(value) => requestRemoveStringItem("rent_durations", value)}
            />
          ) : null}

          {activeTab === "features" ? (
            <StringCatalogPanel
              items={featuresQuery.data ?? []}
              isLoading={featuresQuery.isLoading}
              isError={Boolean(featuresQuery.isError)}
              isBusy={isBusy}
              onRetry={() => featuresQuery.refetch()}
              onAdd={(value) => addStringItem("features", value)}
              onRequestRemove={(value) => requestRemoveStringItem("features", value)}
            />
          ) : null}

          {activeTab === "services" ? (
            <BooleanCatalogPanel
              items={servicesQuery.data ?? {}}
              isLoading={servicesQuery.isLoading}
              isError={Boolean(servicesQuery.isError)}
              isBusy={isBusy}
              onRetry={() => servicesQuery.refetch()}
              onAdd={(key) => addBooleanItem("services", key)}
              onRequestRemove={(key) => requestRemoveBooleanItem("services", key)}
            />
          ) : null}

          {activeTab === "amenities" ? (
            <BooleanCatalogPanel
              items={amenitiesQuery.data ?? {}}
              isLoading={amenitiesQuery.isLoading}
              isError={Boolean(amenitiesQuery.isError)}
              isBusy={isBusy}
              onRetry={() => amenitiesQuery.refetch()}
              onAdd={(key) => addBooleanItem("amenities", key)}
              onRequestRemove={(key) => requestRemoveBooleanItem("amenities", key)}
            />
          ) : null}
        </div>
      </div>

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        itemLabel={pendingDelete?.itemLabel ?? ""}
        sectionLabel={activeTabMeta.label}
        isBusy={removeState.isLoading}
        onCancel={() => {
          if (!removeState.isLoading) {
            setPendingDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
