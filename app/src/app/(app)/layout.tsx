import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { SearchDialog } from "@/components/search/search-dialog";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <>
      <AppShell user={session.user}>{children}</AppShell>
      <SearchDialog />
    </>
  );
}
