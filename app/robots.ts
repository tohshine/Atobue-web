import type { MetadataRoute } from "next";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: [`${ADMIN_BASE_PATH}/`],
    },
  };
}
