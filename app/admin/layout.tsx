import { requireAdmin } from "@/lib/auth/require-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard | MyFolio",
  description: "Internal platform management dashboard for MyFolio administrators.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let adminUser;

  try {
    const authResult = await requireAdmin();
    adminUser = authResult.user;
  } catch (error) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      redirect("/login?callbackUrl=/admin");
    }
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            403
          </div>
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-sm text-slate-400 mb-6">
            You do not have administrative privileges to access the MyFolio platform management console.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
          >
            Return to User Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      <AdminSidebar adminName={adminUser.name || undefined} adminEmail={adminUser.email} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
