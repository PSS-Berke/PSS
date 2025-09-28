import { Metadata } from "next";
import { LinkedInModule } from "@/components/linkedin/linkedin-module";
import { LinkedInProvider } from "@/lib/xano/linkedin-context";
import { SocialMediaModule } from "@/components/social/social-media-module";
import { SocialMediaProvider } from "@/lib/xano/social-media-context";

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

      
      {/* LinkedIn section */}
      <section>
        <LinkedInProvider>
          <LinkedInModule />
        </LinkedInProvider>
      </section>

      {/* Social Media Copilot section */}
      <section>
        <SocialMediaProvider>
          <SocialMediaModule />
        </SocialMediaProvider>
      </section>

      {/* More modules */}
    </div>
  );
}
