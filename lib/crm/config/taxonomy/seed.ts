// Seed taxonomy, field library, mappings and variant axes (SIMULATED; see types.ts).
import type { MenuConfig, TaxonomyNode, TaxonomyModel, FieldDefinition, FieldMapping, VariantAxis, FieldOption } from './types';
import type { TemplateKey } from '../types';

const n = (id: string, parentId: string | null, level: 1 | 2 | 3, name: string, businessModel: TaxonomyModel,
  defaultTemplates: TemplateKey[] = []): TaxonomyNode => ({ id, parentId, level, name, businessModel, defaultTemplates, active: true });

const BASE: TaxonomyNode[] = [
  n('retail', null, 1, 'Retail & E-commerce', 'product'),
  n('fashion', 'retail', 2, 'Fashion & Clothing', 'product'),
  n('mens-clothing', 'fashion', 3, "Men's Clothing", 'product', ['clothing']),
  n('womens-clothing', 'fashion', 3, "Women's Clothing", 'product', ['clothing']),
  n('kids-clothing', 'fashion', 3, 'Kids Clothing', 'product', ['clothing']),
  n('food', 'retail', 2, 'Food & Beverages', 'product'),
  n('pickles', 'food', 3, 'Pickles', 'product', ['retail_shop']),
  n('bakery-cakes', 'food', 3, 'Bakery & Cakes', 'product', ['retail_shop']),
  n('snacks', 'food', 3, 'Snacks', 'product', ['retail_shop']),
  n('grocery', 'food', 3, 'Grocery', 'product', ['retail_shop']),
  n('electronics', 'retail', 2, 'Electronics', 'product'),
  n('mobiles', 'electronics', 3, 'Mobiles', 'product', ['retail_shop']),
  n('computers', 'electronics', 3, 'Computers', 'product', ['retail_shop']),
  n('electronic-accessories', 'electronics', 3, 'Accessories', 'product', ['retail_shop']),
  n('jewellery', 'retail', 2, 'Jewellery', 'product'),
  n('fine-jewellery', 'jewellery', 3, 'Fine Jewellery', 'product', ['retail_shop']),
  n('fashion-jewellery', 'jewellery', 3, 'Fashion Jewellery', 'product', ['retail_shop']),

  n('hospitality', null, 1, 'Hospitality', 'booking'),
  n('stays', 'hospitality', 2, 'Stays', 'booking'),
  n('hotel', 'stays', 3, 'Hotel', 'booking', ['resort_hotel']),
  n('resort', 'stays', 3, 'Resort', 'booking', ['resort_hotel', 'restaurant', 'events']),
  n('homestay', 'stays', 3, 'Homestay', 'booking', ['resort_hotel']),
  n('dining', 'hospitality', 2, 'Dining', 'product'),
  n('restaurant', 'dining', 3, 'Restaurant', 'product', ['restaurant']),
  n('cafe', 'dining', 3, 'Cafe', 'product', ['restaurant']),

  n('services', null, 1, 'Services', 'service'),
  n('beauty', 'services', 2, 'Beauty & Wellness', 'service'),
  n('salon', 'beauty', 3, 'Salon', 'service', ['appointments']),
  n('spa', 'beauty', 3, 'Spa', 'service', ['appointments']),
  n('home-services', 'services', 2, 'Home Services', 'service'),
  n('cleaning', 'home-services', 3, 'Cleaning', 'service', ['appointments']),
  n('plumbing', 'home-services', 3, 'Plumbing', 'service', ['appointments']),

  n('events-industry', null, 1, 'Events', 'booking'),
  n('organisers', 'events-industry', 2, 'Organisers', 'booking'),
  n('concerts', 'organisers', 3, 'Concerts', 'booking', ['events']),
  n('weddings', 'organisers', 3, 'Weddings', 'booking', ['events']),

  n('real-estate', null, 1, 'Real Estate', 'service'),
  n('re-agents', 'real-estate', 2, 'Agents & Builders', 'service'),
  n('re-agent', 're-agents', 3, 'Real estate agent', 'service', ['real_estate']),
];

/** Recognition keywords per node (lowercase). Phrases allowed. */
const KEYWORDS: Record<string, string[]> = {
  'mens-clothing': ["men's wear", 'menswear', 'mens wear', 'gents', 'shirts', 't-shirts', 'tshirts', 'trousers', 'men fashion'],
  'womens-clothing': ["women's wear", 'womenswear', 'ladies wear', 'sarees', 'saree', 'kurtis', 'kurti', 'lehenga', 'dresses', 'boutique', 'ethnic wear'],
  'kids-clothing': ['kids wear', 'kidswear', 'baby clothes', 'children clothing', 'kids fashion'],
  pickles: ['pickle', 'pickles', 'achar', 'avakaya', 'homemade pickles', 'mango pickle'],
  'bakery-cakes': ['bakery', 'cakes', 'cake', 'pastries', 'cupcakes', 'custom cakes', 'birthday cakes', 'desserts', 'brownies'],
  snacks: ['snacks', 'namkeen', 'chips', 'sweets', 'mixture', 'murukku', 'savouries'],
  grocery: ['grocery', 'kirana', 'supermarket', 'provisions', 'staples'],
  mobiles: ['mobiles', 'smartphones', 'mobile phones', 'phone store'],
  computers: ['laptops', 'computers', 'desktops', 'pc store', 'it hardware'],
  'electronic-accessories': ['accessories', 'chargers', 'earphones', 'headphones', 'cables', 'gadgets'],
  'fine-jewellery': ['gold jewellery', 'diamond', 'silver jewellery', 'jewellers', 'jewelers', 'fine jewellery', 'bullion'],
  'fashion-jewellery': ['artificial jewellery', 'imitation jewellery', 'fashion jewellery', 'oxidised', 'costume jewellery'],
  hotel: ['hotel', 'rooms', 'lodging', 'stay'],
  resort: ['resort', 'villas', 'getaway', 'beach resort', 'retreat'],
  homestay: ['homestay', 'home stay', 'guest house', 'bnb'],
  restaurant: ['restaurant', 'dine-in', 'dining', 'biryani', 'menu', 'kitchen', 'food delivery'],
  cafe: ['cafe', 'coffee', 'bistro', 'tea house'],
  salon: ['salon', 'hair', 'haircut', 'beauty parlour', 'makeup', 'bridal makeup', 'barber'],
  spa: ['spa', 'massage', 'wellness', 'ayurveda'],
  cleaning: ['cleaning', 'housekeeping', 'deep cleaning'],
  plumbing: ['plumber', 'plumbing', 'pipe', 'leak'],
  concerts: ['concert', 'live music', 'festival', 'tickets', 'gig'],
  weddings: ['wedding planner', 'wedding planning', 'event planner', 'event management', 'decor'],
  're-agent': ['real estate', 'properties', 'plots', 'flats', 'apartments', 'villas for sale', 'realtor', 'builder'],
};

const o = (...labels: string[]): FieldOption[] => labels.map((l) => ({ value: l.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''), label: l }));

const f = (key: string, label: string, type: FieldDefinition['type'], extra: Partial<FieldDefinition> = {}): FieldDefinition =>
  ({ id: `fd_${key}`, key, label, type, entity: 'product', active: true, ...extra });

export const FIELD_LIBRARY: FieldDefinition[] = [
  // Core (system) fields: mapped globally, cannot be disabled lower down.
  f('name', 'Product name', 'text', { isSystem: true, validation: { minLength: 2, maxLength: 120 } }),
  f('description', 'Description', 'textarea', { isSystem: true, validation: { maxLength: 2000 } }),
  f('images', 'Images', 'images', { isSystem: true }),
  f('price', 'Price', 'number', { isSystem: true, unit: '₹', validation: { min: 0 } }),
  f('sku', 'SKU', 'text', { isSystem: true, validation: { maxLength: 60 } }),
  f('stock', 'Stock quantity', 'number', { isSystem: true, validation: { min: 0, integerOnly: true } }),
  // Shared
  f('brand', 'Brand', 'text', { validation: { maxLength: 80 } }),
  f('material', 'Material / fabric', 'select', { options: o('Cotton', 'Linen', 'Silk', 'Polyester', 'Wool', 'Denim', 'Blend') }),
  f('care_instructions', 'Care instructions', 'textarea', { validation: { maxLength: 500 } }),
  f('fit_type', 'Fit', 'select', { options: o('Regular', 'Slim', 'Relaxed', 'Oversized') }),
  f('sleeve_type', 'Sleeve', 'select', { options: o('Half', 'Full', 'Sleeveless') }),
  f('neck_type', 'Neck', 'select', { options: o('Round', 'V-neck', 'Polo', 'Collar') }),
  f('pattern', 'Pattern', 'select', { options: o('Solid', 'Printed', 'Checked', 'Striped') }),
  f('occasion', 'Occasion', 'multi_select', { options: o('Casual', 'Party', 'Wedding', 'Office', 'Festive') }),
  f('age_group', 'Age group', 'select', { options: o('0-2 yrs', '3-5 yrs', '6-9 yrs', '10-14 yrs') }),
  // Food
  f('ingredients', 'Ingredients', 'textarea', { validation: { maxLength: 800 } }),
  f('storage_instructions', 'Storage instructions', 'textarea', { validation: { maxLength: 500 } }),
  f('allergen_info', 'Allergen information', 'textarea', { validation: { maxLength: 500 } }),
  f('spice_level', 'Spice level', 'select', { options: o('Mild', 'Medium', 'Hot') }),
  f('oil_type', 'Oil type', 'select', { options: o('Groundnut', 'Sesame', 'Mustard', 'Sunflower', 'Other') }),
  f('shelf_life', 'Shelf life', 'measurement', { validation: { min: 1, units: ['days', 'months'] } }),
  f('homemade', 'Homemade', 'toggle'),
  f('flavour', 'Flavour', 'select', { options: o('Chocolate', 'Vanilla', 'Butterscotch', 'Red velvet', 'Black forest', 'Fruit') }),
  f('egg_type', 'Egg or eggless', 'radio', { options: o('Egg', 'Eggless') }),
  f('lead_time_hours', 'Preparation time', 'number', { unit: 'hours', validation: { min: 0, integerOnly: true } }),
  // Electronics
  f('model', 'Model', 'text', { validation: { maxLength: 80 } }),
  f('warranty_months', 'Warranty', 'number', { unit: 'months', validation: { min: 0, max: 120, integerOnly: true } }),
  f('connectivity', 'Connectivity', 'multi_select', { options: o('Wi-Fi', 'Bluetooth', '4G', '5G', 'USB-C') }),
  f('screen_size', 'Screen size', 'measurement', { validation: { min: 1, units: ['inch'] } }),
  f('processor', 'Processor', 'text', { validation: { maxLength: 80 } }),
  f('manual_url', 'Manual / datasheet link', 'url'),
  // Jewellery
  f('metal', 'Metal', 'select', { options: o('Gold', 'Silver', 'Platinum', 'Brass', 'Alloy') }),
  f('purity', 'Purity', 'select', { options: o('24K', '22K', '18K', '925 Silver', 'Not applicable') }),
  f('net_weight', 'Net weight', 'measurement', { validation: { min: 0, units: ['g'] } }),
  f('gemstone', 'Gemstone', 'text', { validation: { maxLength: 80 } }),
  // Services
  f('duration_minutes', 'Duration', 'number', { unit: 'minutes', validation: { min: 5, max: 600, integerOnly: true } }),
  f('service_for', 'Service for', 'select', { options: o('Women', 'Men', 'Kids', 'Everyone') }),
];

let ord = 0;
const m = (fieldId: string, scope: FieldMapping['scope'], scopeId: string | undefined, section: string, extra: Partial<FieldMapping> = {}): FieldMapping =>
  ({ fieldId: `fd_${fieldId}`, scope, scopeId, section, order: ++ord, ...extra });
const g = (id: string, section: string, extra: Partial<FieldMapping> = {}) => m(id, 'global', undefined, section, extra);
const c = (cat: string, id: string, section: string, extra: Partial<FieldMapping> = {}) => m(id, 'category', cat, section, extra);
const s = (sub: string, id: string, section: string, extra: Partial<FieldMapping> = {}) => m(id, 'subcategory', sub, section, extra);

export const FIELD_MAPPINGS: FieldMapping[] = [
  g('name', 'Basics', { required: true }), g('description', 'Basics'), g('images', 'Media'),
  g('price', 'Pricing', { required: true }), g('sku', 'Inventory'), g('stock', 'Inventory'),

  // Fashion
  c('fashion', 'brand', 'Details'), c('fashion', 'material', 'Details'), c('fashion', 'care_instructions', 'Details'),
  s('mens-clothing', 'fit_type', 'Style', { required: true }), s('mens-clothing', 'sleeve_type', 'Style'), s('mens-clothing', 'neck_type', 'Style'), s('mens-clothing', 'pattern', 'Style'),
  s('womens-clothing', 'neck_type', 'Style'), s('womens-clothing', 'sleeve_type', 'Style'), s('womens-clothing', 'pattern', 'Style'), s('womens-clothing', 'occasion', 'Style'),
  s('kids-clothing', 'age_group', 'Style', { required: true }), s('kids-clothing', 'pattern', 'Style'),

  // Food
  c('food', 'ingredients', 'Food details', { required: true }), c('food', 'storage_instructions', 'Food details'), c('food', 'allergen_info', 'Food details'),
  s('pickles', 'spice_level', 'Pickle details', { required: true }), s('pickles', 'oil_type', 'Pickle details'), s('pickles', 'shelf_life', 'Pickle details', { required: true }), s('pickles', 'homemade', 'Pickle details'),
  s('snacks', 'spice_level', 'Snack details'), s('snacks', 'shelf_life', 'Snack details'),
  s('grocery', 'shelf_life', 'Grocery details'),
  s('bakery-cakes', 'flavour', 'Cake details', { required: true }), s('bakery-cakes', 'egg_type', 'Cake details', { required: true }), s('bakery-cakes', 'lead_time_hours', 'Cake details'),
  // A bakery does not need a "storage instructions" field the way a pickle does: hidden here, still defined in the library.
  s('bakery-cakes', 'storage_instructions', 'Food details', { enabled: false }),

  // Electronics
  c('electronics', 'brand', 'Details', { required: true }), c('electronics', 'model', 'Details'), c('electronics', 'warranty_months', 'Details'),
  s('mobiles', 'connectivity', 'Specifications'), s('mobiles', 'screen_size', 'Specifications'),
  s('computers', 'processor', 'Specifications'), s('computers', 'screen_size', 'Specifications'),
  s('electronic-accessories', 'manual_url', 'Specifications'),

  // Jewellery
  c('jewellery', 'metal', 'Jewellery details', { required: true }), c('jewellery', 'purity', 'Jewellery details'), c('jewellery', 'net_weight', 'Jewellery details'), c('jewellery', 'gemstone', 'Jewellery details'),
  s('fashion-jewellery', 'purity', 'Jewellery details', { enabled: false }),

  // Services
  c('beauty', 'duration_minutes', 'Service details', { required: true }), c('beauty', 'service_for', 'Service details'),
];

const sizes: VariantAxis = { key: 'size', label: 'Size', options: o('S', 'M', 'L', 'XL', 'XXL') };
const colour: VariantAxis = { key: 'colour', label: 'Colour', options: o('Black', 'White', 'Blue', 'Red', 'Green', 'Yellow') };
const pack = (...l: string[]): VariantAxis => ({ key: 'pack_size', label: 'Pack size', options: o(...l) });

/** Variant axes per node; the nearest level wins (subcategory over category). */
export const VARIANT_AXES: Record<string, VariantAxis[]> = {
  fashion: [sizes, colour],
  'kids-clothing': [{ key: 'size', label: 'Size', options: o('XS', 'S', 'M', 'L') }, colour],
  pickles: [pack('250g', '500g', '1kg')],
  snacks: [pack('100g', '250g', '500g')],
  grocery: [pack('500g', '1kg', '5kg')],
  'bakery-cakes': [{ key: 'weight', label: 'Weight', options: o('0.5 kg', '1 kg', '2 kg') }],
  mobiles: [{ key: 'storage', label: 'Storage', options: o('64GB', '128GB', '256GB') }, colour],
  computers: [{ key: 'storage', label: 'Storage', options: o('256GB', '512GB', '1TB') }],
};

export const TAXONOMY: TaxonomyNode[] = BASE.map((t) => (KEYWORDS[t.id] ? { ...t, keywords: KEYWORDS[t.id] } : t));

/** Menu overrides per node (SIMULATED seed). Everything else comes from the default templates. */
export const MENUS: Record<string, MenuConfig> = {
  resort: {
    sections: { catalogue: 'Rooms & Pricing', sales: 'Bookings & Enquiries' },
    items: { packages: { label: 'Rooms' }, bookings: { label: 'Bookings' }, leads: { enabled: true, label: 'Enquiries' }, customers: { label: 'Guests' } },
  },
  hotel: { items: { packages: { label: 'Rooms' }, bookings: { label: 'Reservations' }, customers: { label: 'Guests' } } },
  'bakery-cakes': { items: { orders: { label: 'Cake Orders' }, products: { label: 'Cakes & Bakes' }, 'add-product': { label: 'Add Cake' } } },
  pickles: { items: { products: { label: 'Products' }, orders: { label: 'Orders' } } },
};
