import { Home, Zap, BarChart4 } from 'lucide-react';
import type { SidebarItem } from '@/components/sidebar-layout';

export const navigationItems: SidebarItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
    type: 'item',
  },
  {
    name: 'Automations',
    href: '/automations',
    icon: Zap,
    type: 'item',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart4,
    type: 'item',
  },
];

export default navigationItems;
