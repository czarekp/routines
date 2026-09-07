import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => ({
  locale: "pl",
  messages: (await import("../../messages/pl.json")).default,
}));
