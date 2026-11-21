// SIMULATED DATA. Replace with the real backend via lib/crm/services/workspaces.ts.
import type { CrmUser, Workspace } from '../types';

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'ws-jewels', websiteUrl: 'https://www.satyasell.com/store/aura-jewels-mumbai', name: 'Aura Jewels Mumbai', branch: 'Mumbai Flagship', industry: 'Jewellery',
    templates: ['retail_shop', 'appointments'], businessTypes: ['fine-jewellery'], branches: ['Mumbai Flagship', 'Bandra Showroom'], plan: 'PRO', aiUsagePct: 96.4, instagramConnected: true, badges: { whatsapp: '3' },
    notifications: [
      { id: 'n1', title: 'New WhatsApp quote request from Pooja Rathore', time: '2m ago' },
      { id: 'n2', title: 'UPI payment confirmed for order #ORD-8942-IN', time: '14m ago' },
      { id: 'n3', title: 'Bandra Showroom appointment booked for Oct 26', time: '32m ago' },
    ],
  },
  {
    id: 'ws-resort', websiteUrl: 'https://www.satyasell.com/store/palm-valley-resort', name: 'Palm Valley Resort', branch: 'Main Property', industry: 'Hospitality',
    templates: ['resort_hotel', 'restaurant', 'events', 'retail_shop'], businessTypes: ['resort', 'restaurant'], branches: ['Main Property', 'Beach Villas'], plan: 'PRO', aiUsagePct: 41.2, instagramConnected: false, badges: { whatsapp: '7' },
    notifications: [{ id: 'n1', title: 'New booking request for 3 rooms', time: '5m ago' }],
  },
  {
    id: 'ws-salon', websiteUrl: 'https://www.satyasell.com/store/glow-salon', name: 'Glow Salon', branch: 'Indiranagar', industry: 'Appointments',
    templates: ['appointments'], businessTypes: ['salon'], branches: ['Indiranagar'], plan: 'FREE', aiUsagePct: 12.8, instagramConnected: false, badges: {}, notifications: [],
  },
  {
    id: 'ws-realty', websiteUrl: 'https://www.satyasell.com/store/sri-homes', name: 'Sri Homes', branch: 'Hyderabad', industry: 'Real estate',
    templates: ['real_estate'], branches: ['Hyderabad'], plan: 'PRO', aiUsagePct: 63.0, instagramConnected: false, badges: { whatsapp: '2' }, notifications: [],
  },
  {
    id: 'ws-clothing', websiteUrl: 'https://www.satyasell.com/store/urban-threads', name: 'Urban Threads', branch: 'Online store', industry: 'Fashion',
    templates: ['clothing'], businessTypes: ['mens-clothing', 'womens-clothing'], branches: ['Online store'], plan: 'PRO', aiUsagePct: 55.0, instagramConnected: true, badges: { whatsapp: '4' }, notifications: [],
  },
  {
    id: 'ws-pickles', websiteUrl: 'https://www.satyasell.com/store/amma-pickles', name: "Amma's Pickles", branch: 'Kitchen', industry: 'Food & Beverages',
    templates: ['retail_shop'], businessTypes: ['pickles', 'snacks'], branches: ['Kitchen'], plan: 'FREE', aiUsagePct: 20.0, instagramConnected: false, badges: {}, notifications: [],
  },
  {
    id: 'ws-bakery', websiteUrl: 'https://www.satyasell.com/store/sweet-crumbs', name: 'Sweet Crumbs Bakery', branch: 'Jubilee Hills', industry: 'Food & Beverages',
    templates: ['retail_shop'], businessTypes: ['bakery-cakes'], branches: ['Jubilee Hills'], plan: 'PRO', aiUsagePct: 35.0, instagramConnected: false, badges: {}, notifications: [],
  },
  {
    id: 'ws-new', websiteUrl: '', name: 'New Signup (no business chosen yet)', branch: 'Main', industry: '',
    templates: ['legacy_retail'], needsSetup: true, branches: ['Main'], plan: 'FREE', aiUsagePct: 0, instagramConnected: false, badges: {}, notifications: [],
  },
  {
    id: 'ws-legacy', websiteUrl: 'https://www.satyasell.com/store/sharma-garments', name: 'Sharma Garments (existing client)', branch: 'Main store', industry: 'Retail',
    templates: ['legacy_retail'], branches: ['Main store'], plan: 'PRO', aiUsagePct: 30.0, instagramConnected: false, badges: {}, notifications: [],
  },
];

export const MOCK_USER: CrmUser = { name: 'Ananya S.', initials: 'AS', role: 'owner' };
