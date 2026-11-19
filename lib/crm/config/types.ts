// Configuration engine types (Stage C1). SIMULATED: templates are seeded here and will be
// served from the database (edited in /superadmin/studio) in a later stage.
import type { BusinessModel } from '../types';

/** Stable internal module key. Never renamed. Labels come from the template. */
export type ModuleKey =
  | 'dashboard' | 'inbox' | 'customers' | 'team' | 'settings' | 'business-setup'
  | 'instagram' | 'whatsapp' | 'phone' | 'website'
  | 'products' | 'add-product' | 'menu' | 'packages' | 'services' | 'events' | 'properties' | 'courses'
  | 'orders' | 'food-orders' | 'bookings' | 'appointments' | 'tickets' | 'leads' | 'quotations'
  | 'ai' | 'automations' | 'payments' | 'shipping' | 'returns' | 'marketing' | 'analytics' | 'plans';

export type TemplateKey =
  | 'legacy_retail' | 'clothing' | 'retail_shop' | 'resort_hotel' | 'restaurant' | 'events' | 'appointments' | 'real_estate';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export interface WorkflowStatus { key: string; label: string; tone: StatusTone; next: string[] }
export interface WorkflowDef {
  key: string; label: string;
  /** Module whose records move through this workflow. */
  module: ModuleKey;
  statuses: WorkflowStatus[];
  /** Presentation only. Domain services still validate every transition (e.g. room availability). */
  note?: string;
}

export type FieldType = 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'time' | 'dropdown' | 'multiselect' | 'toggle' | 'images' | 'url';
export interface FieldDef { key: string; label: string; type: FieldType; required?: boolean; section: string; options?: string[] }
export interface FieldGroup { module: ModuleKey; label: string; fields: FieldDef[] }

export interface TemplateModule { label?: string }

export interface BusinessTemplate {
  key: TemplateKey;
  name: string;
  industry: string;
  category: string;
  description: string;
  version: number;
  /** Business models this template activates (drives quick actions and storefront needs). */
  businessModels: BusinessModel[];
  modules: Partial<Record<ModuleKey, TemplateModule>>;
  workflows: WorkflowDef[];
  fieldGroups: FieldGroup[];
  storefrontMenu: string[];
}
