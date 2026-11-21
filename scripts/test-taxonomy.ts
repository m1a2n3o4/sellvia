// Run: npx tsx scripts/test-taxonomy.ts   (uses node:test; no extra dependencies)
import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED, resolveFormSchema, flatFields, validateValues, ancestorChain, buildVariantCombos, findDuplicateVariants, type ConfigSource } from '../lib/crm/config/taxonomy/resolve-form';

const keys = (id: string) => flatFields(resolveFormSchema(id)).map((f) => f.key);

test('every seeded business type resolves', () => {
  for (const t of SEED.taxonomy.filter((x) => x.level === 3)) assert.doesNotThrow(() => resolveFormSchema(t.id), t.id);
});
test('pickles = global + food + pickles fields', () => {
  const k = keys('pickles');
  for (const x of ['name', 'price', 'ingredients', 'storage_instructions', 'spice_level', 'shelf_life', 'homemade']) assert.ok(k.includes(x), x);
  assert.ok(!k.includes('fit_type'));
});
test('mens clothing has fashion + subcategory fields, not food', () => {
  const k = keys('mens-clothing');
  for (const x of ['brand', 'material', 'fit_type', 'sleeve_type']) assert.ok(k.includes(x), x);
  assert.ok(!k.includes('ingredients'));
});
test('source level is recorded', () => {
  const f = flatFields(resolveFormSchema('pickles'));
  assert.equal(f.find((x) => x.key === 'name')!.source, 'global');
  assert.equal(f.find((x) => x.key === 'ingredients')!.source, 'category');
  assert.equal(f.find((x) => x.key === 'spice_level')!.source, 'subcategory');
});
test('subcategory can hide an inherited non-system field', () => {
  assert.ok(keys('pickles').includes('storage_instructions'));
  assert.ok(!keys('bakery-cakes').includes('storage_instructions'));
});
test('core fields cannot be hidden', () => {
  const src: ConfigSource = { ...SEED, mappings: [...SEED.mappings, { fieldId: 'fd_name', scope: 'subcategory', scopeId: 'pickles', enabled: false, section: 'Basics' }] };
  const s = resolveFormSchema('pickles', src);
  assert.ok(flatFields(s).some((f) => f.key === 'name'));
  assert.ok(s.warnings.some((w) => w.includes('cannot be hidden')));
});
test('override precedence: most specific wins, no duplicates', () => {
  const src: ConfigSource = { ...SEED, mappings: [...SEED.mappings, { fieldId: 'fd_ingredients', scope: 'subcategory', scopeId: 'snacks', required: false, section: 'Food details' }] };
  const snacks = flatFields(resolveFormSchema('snacks', src));
  assert.equal(snacks.find((f) => f.key === 'ingredients')!.required, false);
  assert.equal(flatFields(resolveFormSchema('pickles', src)).find((f) => f.key === 'ingredients')!.required, true);
  const k = snacks.map((f) => f.key); assert.equal(new Set(k).size, k.length);
});
test('cycles and bad levels are rejected', () => {
  const cyc: ConfigSource = { ...SEED, taxonomy: SEED.taxonomy.map((t) => (t.id === 'food' ? { ...t, parentId: 'pickles' } : t)) };
  assert.throws(() => ancestorChain('pickles', cyc), /Circular|deeper/);
  assert.throws(() => resolveFormSchema('fashion'), /not a business type/);
  assert.throws(() => resolveFormSchema('nope'), /Unknown/);
});
test('variant axes: nearest level wins', () => {
  assert.deepEqual(resolveFormSchema('mens-clothing').variants.axes.map((a) => a.key), ['size', 'colour']);
  assert.deepEqual(resolveFormSchema('kids-clothing').variants.axes[0].options.map((o) => o.value), ['xs', 's', 'm', 'l']);
  assert.deepEqual(resolveFormSchema('pickles').variants.axes.map((a) => a.key), ['pack_size']);
  assert.equal(resolveFormSchema('salon').variants.enabled, false);
});
test('validation: required, types, options, unknown keys', () => {
  const s = resolveFormSchema('pickles');
  const bad = validateValues(s, { name: 'A', price: -1, spice_level: 'extreme', evil: 1, shelf_life: { value: 3, unit: 'years' } });
  assert.equal(bad.ok, false);
  for (const k of ['name', 'price', 'spice_level', 'evil', 'shelf_life', 'ingredients']) assert.ok(bad.errors[k], k);
  const good = validateValues(s, { name: 'Mango pickle', price: '199', ingredients: 'Mango, oil', spice_level: 'hot', shelf_life: { value: 6, unit: 'months' }, homemade: true });
  assert.equal(good.ok, true, JSON.stringify(good.errors));
  assert.equal(good.values.price, 199);
});
test('validation: toggle defaults false, integer stock', () => {
  const s = resolveFormSchema('pickles');
  const r = validateValues(s, { name: 'Lime pickle', price: 99, ingredients: 'Lime', spice_level: 'mild', shelf_life: { value: 30, unit: 'days' }, stock: 2.5 });
  assert.ok(r.errors.stock);
  assert.equal(validateValues(s, { name: 'Lime pickle', price: 99, ingredients: 'x', spice_level: 'mild', shelf_life: { value: 30, unit: 'days' } }).values.homemade, false);
});
test('variant combinations and duplicates', () => {
  const axes = resolveFormSchema('mens-clothing').variants.axes;
  const combos = buildVariantCombos(axes, { size: ['s', 'm'], colour: ['black', 'blue', 'bogus'] });
  assert.equal(combos.length, 4);
  assert.deepEqual(buildVariantCombos(axes, {}), []);
  assert.equal(findDuplicateVariants([...combos, combos[0]]).length, 1);
});

import { recogniseBusiness } from '../lib/crm/config/taxonomy/recognise';
test('recognition: pickles by name is confident', () => {
  const r = recogniseBusiness({ name: "Amma's Pickles", text: 'Homemade mango pickle and avakaya. Order on WhatsApp.' });
  assert.equal(r.decision, 'confident'); assert.equal(r.suggestions[0].nodeId, 'pickles');
  assert.deepEqual(r.suggestions[0].path, ['Retail & E-commerce', 'Food & Beverages', 'Pickles']);
});
test('recognition: ambiguous or empty never auto-picks', () => {
  assert.equal(recogniseBusiness({ name: 'Sunrise', text: 'Resort with restaurant and spa' }).decision, 'ask');
  assert.equal(recogniseBusiness({ name: 'Zzz', text: 'we do things' }).decision, 'none');
  assert.equal(recogniseBusiness({}).decision, 'none');
});
test('recognition: word boundaries (no "hair" inside "chair")', () => {
  assert.ok(!recogniseBusiness({ text: 'Wooden chair maker' }).suggestions.some((s) => s.nodeId === 'salon'));
});

import { validateConfig, impactOf, sameConfig } from '../lib/crm/config/taxonomy/validate-config';
test('seed config is valid (no errors)', () => {
  const errs = validateConfig(SEED).filter((i) => i.level === 'error'); assert.deepEqual(errs, []);
});
test('validation catches bad keys, empty options, duplicate keys', () => {
  const bad: ConfigSource = { ...SEED, fields: [...SEED.fields,
    { id: 'x1', key: 'Bad Key', label: 'Bad', type: 'select', entity: 'product', active: true },
    { id: 'x2', key: 'brand', label: 'Brand again', type: 'text', entity: 'product', active: true }] };
  const m = validateConfig(bad).filter((i) => i.level === 'error').map((i) => i.message).join(' | ');
  assert.match(m, /snake_case/); assert.match(m, /at least one option/); assert.match(m, /used twice/);
});
test('impact: new required field and removal are reported', () => {
  const next: ConfigSource = { ...SEED, fields: [...SEED.fields, { id: 'fd_batch', key: 'batch_no', label: 'Batch number', type: 'text', entity: 'product', active: true }],
    mappings: [...SEED.mappings, { fieldId: 'fd_batch', scope: 'subcategory', scopeId: 'pickles', required: true, section: 'Pickle details' }] };
  const imp = impactOf(SEED, next);
  assert.equal(imp.length, 1); assert.deepEqual(imp[0].added, ['Batch number']); assert.deepEqual(imp[0].newlyRequired, ['Batch number']);
  assert.equal(impactOf(SEED, SEED).length, 0); assert.ok(sameConfig(SEED, SEED));
});

import { resolveMenu } from '../lib/crm/config/taxonomy/menu';
const labels = (ids: string[], cfg: ConfigSource = SEED) => Object.fromEntries(resolveMenu(ids, cfg).flatMap((s) => s.items.map((i) => [i.key, i.label])));
test('menu: pickles gets retail menu, resort gets booking menu with renamed items', () => {
  const p = labels(['pickles']); assert.ok(p.products && p.orders && p['add-product']); assert.ok(!p.bookings && !p.leads);
  const r = labels(['resort']);
  assert.equal(r.packages, 'Rooms'); assert.equal(r.bookings, 'Bookings'); assert.equal(r.leads, 'Enquiries'); assert.equal(r.customers, 'Guests');
  assert.ok(!r.products);
  assert.ok(resolveMenu(['resort']).some((s) => s.label === 'Rooms & Pricing'));
});
test('menu: bakery renames, primary type wins, core cannot be hidden', () => {
  assert.equal(labels(['bakery-cakes']).orders, 'Cake Orders');
  const two = labels(['resort', 'restaurant']); assert.equal(two.customers, 'Guests'); assert.ok(two.menu || two['food-orders']);
  const cfg: ConfigSource = { ...SEED, menus: { ...SEED.menus, pickles: { items: { inbox: { enabled: false }, orders: { enabled: false }, marketing: { enabled: true, label: 'Promote' } } } } };
  const m = labels(['pickles'], cfg); assert.ok(m.inbox); assert.ok(!m.orders); assert.equal(m.marketing, 'Promote');
});
test('menu validation: empty or long labels and unknown keys are errors', () => {
  const bad: ConfigSource = { ...SEED, menus: { pickles: { items: { orders: { label: '' }, nope: { label: 'x' } } as never, sections: { catalogue: 'x'.repeat(40) } } } };
  const m = validateConfig(bad).filter((i) => i.level === 'error').map((i) => i.message).join(' | ');
  assert.match(m, /1 to 32/); assert.match(m, /unknown menu item/);
  assert.deepEqual(validateConfig(SEED).filter((i) => i.level === 'error'), []);
});
