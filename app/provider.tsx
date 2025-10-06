'use client';

import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/lib/contexts/sidebar-context";


export function Provider(props: { children?: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableColorScheme={true}>
      <SidebarProvider>
        {props.children}
      </SidebarProvider>
    </ThemeProvider>
  );
}