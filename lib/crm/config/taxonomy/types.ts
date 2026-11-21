// Taxonomy + field library types (Stage T1). SIMULATED: seeded in code, served from the database
// (edited in /superadmin/studio) in a later stage. Spec: docs/modules/BUSINESS_TAXONOMY_AND_FIELDS.md
import type { ModuleKey, TemplateKey } from '../types';

/** Industry (1) > Category (2) > Subcategory = business type (3). */
export type TaxonomyLevel = 1 | 2 | 3;
/** Default hint from the owner spec. Not the same as the CRM's BusinessModel gate. */
export type TaxonomyModel = 'product' | 'service' | 'booking' | 'hybrid';
export interface TaxonomyNode {
  id: string; // stable id, also the slug in the seed
  parentId: string | null;
  level: TaxonomyLevel;
  name: string;
  description?: string;
  /** A default hint only. Never a gate: a resort can run rooms, restaurant and events together. */
  businessModel: TaxonomyModel;
  defaultTemplates: TemplateKey[];
  /** Words used by business recognition (Instagram bio, manual entry). Edited in Studio. */
  keywords?: string[];
  /** Plain-language bullets shown to owners choosing this business type ("What you can do"). Optional; derived from the menu if empty. */
  highlights?: string[];
  active: boolean;
}

export type DataType =
  | 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'multi_select'
  | 'date' | 'toggle' | 'url' | 'measurement' | 'image' | 'file'
  /** Core-only: the existing product images feature. Not offered to admins. */
  | 'images';

export interface FieldOption { value: string; label: string }
export interface Validation {
  min?: number; max?: number; step?: number; integerOnly?: boolean;
  minLength?: number; maxLength?: number; maxSelected?: number;
  minDate?: string; maxDate?: string;
  /** Safe presets only. Admin-typed regex is not allowed in the MVP. */
  preset?: 'email' | 'phone' | 'pincode';
  units?: string[];
}

export interface FieldDefinition {
  id: string;
  /** snake_case, globally unique, immutable once used by product data. */
  key: string;
  label: string;
  type: DataType;
  entity: 'product';
  description?: string;
  placeholder?: string;
  helpText?: string;
  unit?: string;
  options?: FieldOption[];
  validation?: Validation;
  /** Platform core fields can never be disabled below the global level. */
  isSystem?: boolean;
  active: boolean;
}

export type MappingScope = 'global' | 'category' | 'subcategory';
export interface FieldMapping {
  fieldId: string;
  scope: MappingScope;
  /** Taxonomy node id; omitted for global. */
  scopeId?: string;
  enabled?: boolean; // default true; false hides an inherited non-system field
  required?: boolean;
  order?: number;
  section?: string;
  placeholder?: string;
  helpText?: string;
  validation?: Validation;
  options?: FieldOption[];
}

export interface VariantAxis { key: string; label: string; options: FieldOption[] }

export type FieldSource = 'global' | 'category' | 'subcategory';
export interface ResolvedField {
  id: string; key: string; label: string; type: DataType;
  required: boolean; section: string; order: number;
  placeholder?: string; helpText?: string; unit?: string;
  options?: FieldOption[]; validation?: Validation;
  isSystem: boolean;
  /** Which level last set this field (shown to admins for debugging). */
  source: FieldSource;
}
export interface ResolvedSection { name: string; fields: ResolvedField[] }
export interface ResolvedFormSchema {
  businessTypeId: string;
  version: number;
  /** Ancestor chain, root first. */
  chain: string[];
  sections: ResolvedSection[];
  variants: { enabled: boolean; axes: VariantAxis[] };
  warnings: string[];
}

/** Per-node menu overrides on top of the default templates. Nearest level wins; the primary business type wins over later ones. */
export interface MenuItemOverride {
  /** false hides a module; true adds a module the templates do not include. Core modules cannot be hidden. */
  enabled?: boolean;
  /** Replaces the label (for example Customers -> Guests, Leads -> Enquiries). */
  label?: string;
  /** Sort position inside its section (lower first). */
  order?: number;
}
export interface MenuConfig {
  items?: Partial<Record<ModuleKey, MenuItemOverride>>;
  /** Section title overrides, keyed by section key (catalogue, sales, ...). */
  sections?: Record<string, string>;
}
