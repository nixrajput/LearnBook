import React from "react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "../../messages/en.json";

/**
 * Wraps a component with NextIntlClientProvider for tests.
 * Uses English messages by default.
 */
export function IntlWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
