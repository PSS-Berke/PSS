import { Home, Zap, BarChart4 } from 'lucide-react';
import type { SidebarItem } from '@/components/sidebar-layout';

export const navigationItems: SidebarItem[] = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: Home,
    type: 'item',
  },
  {
    name: 'Automations',
    href: '/dashboard/automations',
    icon: Zap,
    type: 'item',
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart4,
    type: 'item',
  },
];

export default navigationItems;
