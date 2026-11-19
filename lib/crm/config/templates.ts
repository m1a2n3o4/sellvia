// SIMULATED seed templates (Stage C1). Source of truth later: Platform Admin / database.
import type { BusinessTemplate, ModuleKey, TemplateKey, TemplateModule, WorkflowDef, WorkflowStatus, StatusTone } from './types';

/** Core modules are available in every template regardless of configuration. */
export const CORE_MODULES: ModuleKey[] = [
  'dashboard', 'inbox', 'customers', 'team', 'settings', 'business-setup', 'instagram', 'whatsapp', 'phone',
];

const common: Partial<Record<ModuleKey, TemplateModule>> = {
  website: {}, ai: {}, automations: {}, payments: {}, marketing: {}, analytics: {}, plans: {},
};

const s = (key: string, label: string, tone: StatusTone, next: string[] = []): WorkflowStatus => ({ key, label, tone, next });

const orderFlow = (module: ModuleKey): WorkflowDef => ({
  key: `${module}-flow`, label: 'Order workflow', module,
  statuses: [
    s('new', 'New', 'info', ['confirmed', 'cancelled']), s('confirmed', 'Confirmed', 'info', ['processing', 'cancelled']),
    s('processing', 'Processing', 'warning', ['packed']), s('packed', 'Packed', 'warning', ['shipped']),
    s('shipped', 'Shipped', 'info', ['delivered']), s('delivered', 'Delivered', 'success', ['refunded']),
    s('cancelled', 'Cancelled', 'danger'), s('refunded', 'Refunded', 'neutral'),
  ],
});

const T = (t: BusinessTemplate) => t;

export const TEMPLATES: Record<TemplateKey, BusinessTemplate> = {
  legacy_retail: T({
    key: 'legacy_retail', name: 'Legacy retail (compatibility)', industry: 'Retail', category: 'General retail',
    description: 'Matches the current /client dashboard behaviour. Existing tenants stay on this until they opt in to a new template.',
    version: 1, businessModels: ['products'], storefrontMenu: ['Home', 'Shop', 'Cart'],
    modules: { ...common, products: {}, 'add-product': {}, orders: {}, shipping: {}, returns: {} },
    workflows: [orderFlow('orders')], fieldGroups: [],
  }),
  clothing: T({
    key: 'clothing', name: 'Clothing / Fashion seller', industry: 'Retail', category: 'Fashion',
    description: 'Products with size and colour variants, stock per variant, and a full order workflow.',
    version: 1, businessModels: ['products'], storefrontMenu: ['Home', 'Shop', 'Categories', 'New Arrivals', 'About Us', 'Contact'],
    modules: { ...common, products: {}, 'add-product': {}, orders: {}, shipping: {}, returns: {} },
    workflows: [orderFlow('orders')],
    fieldGroups: [{ module: 'products', label: 'Product fields', fields: [
      { key: 'name', label: 'Product name', type: 'text', required: true, section: 'Basics' },
      { key: 'description', label: 'Description', type: 'textarea', section: 'Basics' },
      { key: 'images', label: 'Product images', type: 'images', section: 'Media' },
      { key: 'price', label: 'Price', type: 'currency', required: true, section: 'Pricing' },
      { key: 'discount', label: 'Discount', type: 'number', section: 'Pricing' },
      { key: 'sku', label: 'SKU', type: 'text', section: 'Inventory' },
      { key: 'sizes', label: 'Sizes', type: 'multiselect', section: 'Variants', options: ['XS', 'S', 'M', 'L', 'XL'] },
      { key: 'colours', label: 'Colours', type: 'multiselect', section: 'Variants', options: ['Red', 'Blue', 'Black', 'White', 'Green'] },
      { key: 'stock', label: 'Stock quantity', type: 'number', section: 'Inventory' },
      { key: 'weight', label: 'Shipping weight', type: 'number', section: 'Shipping' },
      { key: 'returns', label: 'Return policy', type: 'textarea', section: 'Policies' },
    ]}],
  }),
  retail_shop: T({
    key: 'retail_shop', name: 'Retail shop', industry: 'Retail', category: 'General retail',
    description: 'Simple product catalogue and orders for any shop (jewellery, gifts, cosmetics).',
    version: 1, businessModels: ['products'], storefrontMenu: ['Home', 'Shop', 'About', 'Contact'],
    modules: { ...common, products: {}, 'add-product': {}, orders: {}, shipping: {}, returns: {} },
    workflows: [orderFlow('orders')], fieldGroups: [],
  }),
  resort_hotel: T({
    key: 'resort_hotel', name: 'Resort / Hotel', industry: 'Hospitality', category: 'Resorts',
    description: 'Rooms with date-based availability and a booking workflow. Availability must use dedicated backend logic, not a stock number.',
    version: 1, businessModels: ['bookings'], storefrontMenu: ['Home', 'Rooms', 'Packages', 'Amenities', 'Gallery', 'Offers', 'Contact', 'Book Now'],
    modules: { ...common, website: { label: 'Website' }, customers: { label: 'Guests' }, packages: { label: 'Rooms' }, bookings: {} },
    workflows: [{
      key: 'bookings-flow', label: 'Booking workflow', module: 'bookings',
      note: 'Confirm is only allowed after the booking service verifies availability.',
      statuses: [
        s('pending', 'Pending', 'warning', ['confirmed', 'cancelled']), s('confirmed', 'Confirmed', 'info', ['checked_in', 'cancelled']),
        s('checked_in', 'Checked In', 'info', ['checked_out']), s('checked_out', 'Checked Out', 'success', ['refunded']),
        s('cancelled', 'Cancelled', 'danger', ['refunded']), s('refunded', 'Refunded', 'neutral'),
      ],
    }],
    fieldGroups: [{ module: 'packages', label: 'Room fields', fields: [
      { key: 'name', label: 'Room name', type: 'text', required: true, section: 'Basics' },
      { key: 'type', label: 'Room type', type: 'dropdown', required: true, section: 'Basics', options: ['Standard', 'Deluxe', 'Suite', 'Villa'] },
      { key: 'images', label: 'Room images', type: 'images', section: 'Media' },
      { key: 'amenities', label: 'Amenities', type: 'multiselect', section: 'Details', options: ['Wi-Fi', 'AC', 'Pool view', 'Breakfast', 'Balcony'] },
      { key: 'maxGuests', label: 'Maximum guests', type: 'number', required: true, section: 'Details' },
      { key: 'basePrice', label: 'Base price per night', type: 'currency', required: true, section: 'Pricing' },
      { key: 'weekendPrice', label: 'Weekend pricing', type: 'currency', section: 'Pricing' },
      { key: 'checkIn', label: 'Check-in time', type: 'time', section: 'Policies' },
      { key: 'checkOut', label: 'Check-out time', type: 'time', section: 'Policies' },
      { key: 'cancellation', label: 'Cancellation policy', type: 'textarea', section: 'Policies' },
    ]}],
  }),
  restaurant: T({
    key: 'restaurant', name: 'Restaurant', industry: 'Hospitality', category: 'Restaurants',
    description: 'Menu and food orders, kept separate from retail products.',
    version: 1, businessModels: ['products'], storefrontMenu: ['Home', 'Menu', 'Offers', 'Contact'],
    modules: { ...common, menu: {}, 'food-orders': {} },
    workflows: [{
      key: 'food-orders-flow', label: 'Food order workflow', module: 'food-orders',
      statuses: [s('new', 'New', 'info', ['preparing']), s('preparing', 'Preparing', 'warning', ['ready']),
        s('ready', 'Ready', 'info', ['delivered']), s('delivered', 'Delivered', 'success'), s('cancelled', 'Cancelled', 'danger')],
    }],
    fieldGroups: [],
  }),
  events: T({
    key: 'events', name: 'Event organiser', industry: 'Events', category: 'Event organisers',
    description: 'Events with ticket categories, sales windows and ticket bookings. QR validation comes in the backend phase.',
    version: 1, businessModels: ['events'], storefrontMenu: ['Home', 'Upcoming Events', 'Past Events', 'About', 'Contact'],
    modules: { ...common, website: { label: 'Website' }, customers: { label: 'Attendees' }, events: {}, tickets: { label: 'Ticket Bookings' } },
    workflows: [{
      key: 'tickets-flow', label: 'Ticket workflow', module: 'tickets',
      statuses: [s('pending', 'Pending', 'warning', ['confirmed', 'cancelled']), s('confirmed', 'Confirmed', 'info', ['checked_in', 'cancelled']),
        s('checked_in', 'Checked In', 'success'), s('cancelled', 'Cancelled', 'danger', ['refunded']), s('refunded', 'Refunded', 'neutral')],
    }],
    fieldGroups: [{ module: 'events', label: 'Event fields', fields: [
      { key: 'name', label: 'Event name', type: 'text', required: true, section: 'Basics' },
      { key: 'poster', label: 'Event poster', type: 'images', section: 'Media' },
      { key: 'venue', label: 'Venue', type: 'text', required: true, section: 'Where and when' },
      { key: 'startDate', label: 'Start date', type: 'date', required: true, section: 'Where and when' },
      { key: 'endDate', label: 'End date', type: 'date', section: 'Where and when' },
      { key: 'regOpen', label: 'Registration start', type: 'date', section: 'Registration' },
      { key: 'regClose', label: 'Registration end', type: 'date', section: 'Registration' },
      { key: 'terms', label: 'Terms and conditions', type: 'textarea', section: 'Policies' },
    ]}],
  }),
  appointments: T({
    key: 'appointments', name: 'Appointments & services', industry: 'Services', category: 'Appointment based',
    description: 'Services and time-slot appointments (salon, clinic, consultancy).',
    version: 1, businessModels: ['appointments', 'services'], storefrontMenu: ['Home', 'Services', 'Book Now', 'Contact'],
    modules: { ...common, website: { label: 'Website' }, services: {}, appointments: {} },
    workflows: [{
      key: 'appointments-flow', label: 'Appointment workflow', module: 'appointments',
      statuses: [s('requested', 'Requested', 'warning', ['confirmed', 'cancelled']), s('confirmed', 'Confirmed', 'info', ['completed', 'cancelled']),
        s('completed', 'Completed', 'success'), s('cancelled', 'Cancelled', 'danger')],
    }],
    fieldGroups: [],
  }),
  real_estate: T({
    key: 'real_estate', name: 'Real estate', industry: 'Real estate', category: 'Agencies',
    description: 'Properties, leads and quotations.',
    version: 1, businessModels: ['leads', 'quotations'], storefrontMenu: ['Home', 'Properties', 'About', 'Contact'],
    modules: { ...common, website: { label: 'Website' }, customers: { label: 'Clients' }, properties: {}, leads: {}, quotations: {} },
    workflows: [{
      key: 'leads-flow', label: 'Lead stages', module: 'leads',
      statuses: [s('new', 'New', 'info', ['contacted']), s('contacted', 'Contacted', 'warning', ['visit']), s('visit', 'Site visit', 'info', ['won', 'lost']),
        s('won', 'Won', 'success'), s('lost', 'Lost', 'danger')],
    }],
    fieldGroups: [],
  }),
};

/** Fallback product form for templates that do not define their own fields. */
export const DEFAULT_PRODUCT_FIELDS = [
  { key: 'name', label: 'Product name', type: 'text', required: true, section: 'Basics' },
  { key: 'description', label: 'Description', type: 'textarea', section: 'Basics' },
  { key: 'images', label: 'Images', type: 'images', section: 'Media' },
  { key: 'price', label: 'Price', type: 'currency', required: true, section: 'Pricing' },
  { key: 'sku', label: 'SKU', type: 'text', section: 'Inventory' },
  { key: 'stock', label: 'Stock quantity', type: 'number', section: 'Inventory' },
] as const;
