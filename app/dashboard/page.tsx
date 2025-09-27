import { Metadata } from "next";
import { LinkedInModule } from "@/components/linkedin/linkedin-module";
import { LinkedInProvider } from "@/lib/xano/linkedin-context";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 pt-6 px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your multi-tenant dashboard. Manage your campaigns and content.
        </p>
      </div>

      {/* Other dashboard content */}
      <div>
        <h2 className="text-xl font-semibold">Overview</h2>
        <p className="text-muted-foreground">Some general dashboard content here...</p>
      </div>

      {/* LinkedIn section only */}
      <section>
        <LinkedInProvider>
          <LinkedInModule />
        </LinkedInProvider>
      </section>

      {/* More modules */}
      <section>
        <h2 className="text-xl font-semibold">Other Module</h2>
        <p className="text-muted-foreground">Other integrations or data here...</p>
      </section>
    </div>
  );
}
