"use client";

import { adminRoutes } from "@/lib/admin-path";
import AdminGuard from "../_components/AdminGuard";
import AdminShell from "../_components/AdminShell";
import DataCatalogManager from "./_components/DataCatalogManager";

export default function AdminControlsPage() {
  return (
    <AdminGuard>
      <AdminShell
        active={adminRoutes.controls}
        title="Controls"
        subtitle="Manage listing options shown across the platform"
      >
        <DataCatalogManager />
      </AdminShell>
    </AdminGuard>
  );
}
