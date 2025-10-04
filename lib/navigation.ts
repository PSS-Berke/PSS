import { LayoutDashboard, Zap, BarChart4, Settings } from 'lucide-react';
import type { SidebarItem } from '@/components/sidebar-layout';

export const navigationItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    type: 'item',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart4,
    type: 'item',
  },
  {
    name: 'Automations',
    href: '/automations',
    icon: Zap,
    type: 'item',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    type: 'item',
  },
];

export default navigationItems;
