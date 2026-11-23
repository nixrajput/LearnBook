import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // Read locale from cookie (set by useLocaleSync or settings page)
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "en";

  // Map full locale codes (en-US) to language codes (en) for message files
  const lang = locale.split("-")[0] ?? "en";

  let messages;
  try {
    messages = (await import(`../../messages/${lang}.json`)).default;
  } catch {
    messages = (await import("../../messages/en.json")).default;
  }

  return { locale: lang, messages };
});
