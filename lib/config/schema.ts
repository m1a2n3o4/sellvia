import { z } from 'zod';

const opt = z.object({ value: z.string().max(80), label: z.string().max(120) });
const validation = z.object({
  min: z.number().optional(), max: z.number().optional(), step: z.number().optional(), integerOnly: z.boolean().optional(),
  minLength: z.number().optional(), maxLength: z.number().optional(), maxSelected: z.number().optional(),
  minDate: z.string().optional(), maxDate: z.string().optional(), preset: z.enum(['email', 'phone', 'pincode']).optional(),
  units: z.array(z.string().max(20)).max(20).optional(),
}).strict();
const dataType = z.enum(['text', 'textarea', 'number', 'select', 'radio', 'checkbox', 'multi_select', 'date', 'toggle', 'url', 'measurement', 'image', 'file', 'images']);
const tpl = z.enum(['legacy_retail', 'clothing', 'retail_shop', 'resort_hotel', 'restaurant', 'events', 'appointments', 'real_estate']);

export const configSchema = z.object({
  taxonomy: z.array(z.object({
    id: z.string().min(1).max(80), parentId: z.string().nullable(), level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    name: z.string().min(1).max(80), description: z.string().max(400).optional(), businessModel: z.enum(['product', 'service', 'booking', 'hybrid']),
    defaultTemplates: z.array(tpl).max(8), keywords: z.array(z.string().max(60)).max(80).optional(),
    highlights: z.array(z.string().max(140)).max(12).optional(), active: z.boolean(),
  })).max(600),
  fields: z.array(z.object({
    id: z.string().min(1).max(100), key: z.string().max(60), label: z.string().min(1).max(100), type: dataType, entity: z.literal('product'),
    description: z.string().max(300).optional(), placeholder: z.string().max(120).optional(), helpText: z.string().max(300).optional(), unit: z.string().max(30).optional(),
    options: z.array(opt).max(200).optional(), validation: validation.optional(), isSystem: z.boolean().optional(), active: z.boolean(),
  })).max(600),
  mappings: z.array(z.object({
    fieldId: z.string().max(100), scope: z.enum(['global', 'category', 'subcategory']), scopeId: z.string().max(80).optional(),
    enabled: z.boolean().optional(), required: z.boolean().optional(), order: z.number().optional(), section: z.string().max(80).optional(),
    placeholder: z.string().max(120).optional(), helpText: z.string().max(300).optional(), validation: validation.optional(), options: z.array(opt).max(200).optional(),
  })).max(4000),
  axes: z.record(z.array(z.object({ key: z.string().max(40), label: z.string().max(60), options: z.array(opt).max(100) })).max(8)),
  menus: z.record(z.object({
    items: z.record(z.object({ enabled: z.boolean().optional(), label: z.string().max(60).optional(), order: z.number().optional() })).optional(),
    sections: z.record(z.string().max(60)).optional(),
  })).optional(),
});
