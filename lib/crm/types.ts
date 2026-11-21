export type BusinessModel =
  | 'products' | 'bookings' | 'events' | 'appointments'
  | 'leads' | 'quotations' | 'courses' | 'services';

export const BUSINESS_MODEL_LABELS: Record<BusinessModel, string> = {
  products: 'Products', bookings: 'Bookings', events: 'Events & tickets', appointments: 'Appointments',
  leads: 'Leads', quotations: 'Quotations', courses: 'Courses', services: 'Services',
};

import type { TemplateKey } from './config/types';

export interface CrmNotification { id: string; title: string; time: string }

export interface Workspace {
  id: string;
  name: string;
  /** Branch / store label shown as the header chip. */
  branch: string;
  industry: string;
  /** Public storefront URL for this business (dummy until the real site exists). */
  websiteUrl: string;
  /** Active business templates (first is the primary). One tenant can run several. */
  templates: TemplateKey[];
  /** Taxonomy business types (subcategory ids), primary first. Absent = legacy form (no dynamic fields). */
  businessTypes?: string[];
  /** Branches / locations inside the tenant (not separate tenants). */
  branches: string[];
  plan: 'FREE' | 'PRO';
  aiUsagePct: number;
  /** Whether the sample business has Instagram connected (drives which Instagram page shows). */
  instagramConnected: boolean;
  /** Count badges by nav key, e.g. unread WhatsApp chats. */
  badges: Record<string, string>;
  notifications: CrmNotification[];
}

export interface CrmUser { name: string; initials: string; role: 'owner' | 'admin' | 'manager' | 'staff' }
