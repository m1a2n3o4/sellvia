import {
  BarChart3, BedDouble, Bot, Briefcase, Building2, CalendarCheck, CalendarClock, FileText, Globe,
  GraduationCap, Inbox, Instagram, LayoutDashboard, Megaphone, MessageCircle, Package, PackagePlus,
  PartyPopper, Phone, Settings, ShoppingBag, Target, Ticket, Truck, Undo2, UserCog, Users, Wallet, Zap,
  CreditCard, SlidersHorizontal, type LucideIcon,
} from 'lucide-react';
import type { ModuleKey, TemplateKey } from './config/types';
import { resolveModules } from './config/resolve';

export const CRM_BASE = '/app';
const p = (path: string) => `${CRM_BASE}/${path}`;

export interface NavItem {
  /** Stable module key. Label is only the default; a template may override it. */
  key: ModuleKey; label: string; icon: LucideIcon; href: string;
  tag?: string; exact?: boolean;
}
export interface NavSection { key: string; label: string; items: NavItem[] }

/** Flat, grouped sidebar from the Stitch design. Items appear only when a matching business model is enabled. */
export const NAV: NavSection[] = [
  { key: 'overview', label: 'Overview', items: [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: CRM_BASE, exact: true },
    { key: 'inbox', label: 'Inbox', icon: Inbox, href: p('inbox') },
  ]},
  { key: 'channels', label: 'Channels', items: [
    { key: 'instagram', label: 'Instagram', icon: Instagram, href: p('channels/instagram') },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, href: p('channels/whatsapp') },
    { key: 'website', label: 'E-com Website', icon: Globe, href: p('channels/website') },
    { key: 'phone', label: 'Phone Calls', icon: Phone, href: p('channels/phone') },
  ]},
  { key: 'catalogue', label: 'Inventory & Catalogue', items: [
    { key: 'products', label: 'Products', icon: Package, href: p('catalogue/products') },
    { key: 'menu', label: 'Menu', icon: Package, href: p('catalogue/menu') },
    { key: 'add-product', label: 'Add Product', icon: PackagePlus, href: p('catalogue/products/new'), exact: true },
    { key: 'services', label: 'Services', icon: Briefcase, href: p('catalogue/services') },
    { key: 'packages', label: 'Rooms & Packages', icon: BedDouble, href: p('catalogue/packages') },
    { key: 'events', label: 'Events', icon: PartyPopper, href: p('catalogue/events') },
    { key: 'properties', label: 'Properties', icon: Building2, href: p('catalogue/properties') },
    { key: 'courses', label: 'Courses', icon: GraduationCap, href: p('catalogue/courses') },
    { key: 'customers', label: 'Customers', icon: Users, href: p('customers') },
  ]},
  { key: 'sales', label: 'Sales & Commerce', items: [
    { key: 'orders', label: 'Orders & Sales', icon: ShoppingBag, href: p('sales/orders') },
    { key: 'food-orders', label: 'Restaurant Orders', icon: ShoppingBag, href: p('sales/food-orders') },
    { key: 'bookings', label: 'Bookings', icon: CalendarCheck, href: p('sales/bookings') },
    { key: 'appointments', label: 'Appointments', icon: CalendarClock, href: p('sales/appointments') },
    { key: 'tickets', label: 'Tickets', icon: Ticket, href: p('sales/tickets') },
    { key: 'leads', label: 'Leads', icon: Target, href: p('sales/leads') },
    { key: 'quotations', label: 'Quotations', icon: FileText, href: p('sales/quotations') },
    { key: 'ai', label: 'AI Sales Flow', icon: Bot, href: p('ai'), tag: 'AI' },
    { key: 'automations', label: 'Automations', icon: Zap, href: p('automations') },
  ]},
  { key: 'finance', label: 'Finance & Operations', items: [
    { key: 'payments', label: 'Payments & Tracking', icon: Wallet, href: p('payments') },
    { key: 'shipping', label: 'Shipping & Delivery', icon: Truck, href: p('operations/shipping') },
    { key: 'returns', label: 'Returns & Exchange', icon: Undo2, href: p('operations/returns') },
  ]},
  { key: 'growth', label: 'Growth', items: [
    { key: 'marketing', label: 'Marketing & Campaigns', icon: Megaphone, href: p('marketing') },
    { key: 'analytics', label: 'Analytics', icon: BarChart3, href: p('analytics') },
  ]},
  { key: 'system', label: 'System', items: [
    { key: 'team', label: 'Team Members', icon: UserCog, href: p('team') },
    { key: 'plans', label: 'Plans & Credits', icon: CreditCard, href: p('plans') },
    { key: 'business-setup', label: 'Business setup', icon: SlidersHorizontal, href: p('settings/business') },
    { key: 'settings', label: 'Settings', icon: Settings, href: p('settings'), exact: true },
  ]},
];

export interface VisibleSection { key: string; label: string; items: NavItem[] }

/** Sidebar is computed from the tenant's active templates (see lib/crm/config). Same keys, template labels. */
export function getVisibleNav(templates: TemplateKey[]): VisibleSection[] {
  const mods = resolveModules(templates);
  return NAV.map((sec) => ({
    key: sec.key, label: sec.label,
    items: sec.items.filter((i) => mods.has(i.key)).map((i) => ({ ...i, label: mods.get(i.key)?.label ?? i.label })),
  })).filter((sec) => sec.items.length > 0);
}

/** Item whose href is the longest match for the pathname (so /products/new lights "Add Product", not "Products"). */
export function getActiveKey(pathname: string, sections: VisibleSection[]): string | null {
  let best: { key: string; len: number } | null = null;
  for (const s of sections) for (const i of s.items) {
    const hit = i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(`${i.href}/`);
    if (hit && (!best || i.href.length > best.len)) best = { key: i.key, len: i.href.length };
  }
  return best?.key ?? null;
}

/** Breadcrumb / placeholder-page lookup. */
export function findNavByPath(pathname: string) {
  let best: { section: string; title: string; len: number } | null = null;
  for (const s of NAV) for (const i of s.items) {
    const hit = i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(`${i.href}/`);
    if (hit && (!best || i.href.length > best.len)) best = { section: s.label, title: i.label, len: i.href.length };
  }
  return best ? { section: best.section, title: best.title } : null;
}

export interface QuickAction { label: string; href: string; module?: ModuleKey }
export const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Add customer', href: p('customers/new') },
  { label: 'Add product', href: p('catalogue/products/new'), module: 'products' },
  { label: 'Add menu item', href: p('catalogue/menu/new'), module: 'menu' },
  { label: 'Create order', href: p('sales/orders/new'), module: 'orders' },
  { label: 'Create food order', href: p('sales/food-orders/new'), module: 'food-orders' },
  { label: 'Create booking', href: p('sales/bookings/new'), module: 'bookings' },
  { label: 'Create appointment', href: p('sales/appointments/new'), module: 'appointments' },
  { label: 'Create ticket', href: p('sales/tickets/new'), module: 'tickets' },
  { label: 'Add lead', href: p('sales/leads/new'), module: 'leads' },
  { label: 'Create payment link', href: p('payments/links/new'), module: 'payments' },
];
export const visibleQuickActions = (templates: TemplateKey[]) => {
  const mods = resolveModules(templates);
  return QUICK_ACTIONS.filter((a) => !a.module || mods.has(a.module));
};
