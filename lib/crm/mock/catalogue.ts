// SIMULATED products and orders. Replace via lib/crm/services/crm-data.ts.
export type ProductStatus = 'live' | 'draft' | 'out_of_stock';
export interface Product { id: string; name: string; category: string; sku: string; price: number; stock: number; variants: number; status: ProductStatus; source: 'Instagram' | 'Manual' | 'Website' }
export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Royal Polki Choker Set (22k)', category: 'Necklaces', sku: 'NK-POL-001', price: 85000, stock: 3, variants: 1, status: 'live', source: 'Instagram' },
  { id: 'p2', name: 'Kundan Jhumka Pair', category: 'Earrings', sku: 'ER-KUN-014', price: 18500, stock: 12, variants: 3, status: 'live', source: 'Instagram' },
  { id: 'p3', name: 'Temple Gold Bangles (set of 4)', category: 'Bangles', sku: 'BG-TMP-007', price: 64000, stock: 0, variants: 2, status: 'out_of_stock', source: 'Manual' },
  { id: 'p4', name: 'Diamond Solitaire Ring', category: 'Rings', sku: 'RG-DIA-022', price: 132000, stock: 2, variants: 5, status: 'live', source: 'Website' },
  { id: 'p5', name: 'Pearl Drop Necklace', category: 'Necklaces', sku: 'NK-PRL-031', price: 24000, stock: 9, variants: 1, status: 'live', source: 'Instagram' },
  { id: 'p6', name: 'Bridal Maang Tikka', category: 'Bridal', sku: 'BR-MNG-004', price: 38500, stock: 4, variants: 1, status: 'draft', source: 'Instagram' },
  { id: 'p7', name: 'Silver Anklet Pair', category: 'Anklets', sku: 'AN-SLV-019', price: 6200, stock: 25, variants: 2, status: 'live', source: 'Manual' },
  { id: 'p8', name: 'Rose Gold Stud Earrings', category: 'Earrings', sku: 'ER-RGS-040', price: 14800, stock: 1, variants: 1, status: 'live', source: 'Website' },
];

export interface OrderLine { name: string; qty: number; price: number }
export interface Order { id: string; customer: string; date: string; channel: 'WhatsApp' | 'Instagram' | 'Website' | 'Walk-in'; paid: boolean; status: string; lines: OrderLine[] }
export const MOCK_ORDERS: Order[] = [
  { id: 'ORD-8942', customer: 'Vikramaditya K.', date: 'Today, 10:42 AM', channel: 'WhatsApp', paid: true, status: 'confirmed', lines: [{ name: 'Royal Polki Choker Set (22k)', qty: 1, price: 85000 }] },
  { id: 'ORD-8941', customer: 'Meera Joshi', date: 'Today, 9:18 AM', channel: 'WhatsApp', paid: true, status: 'processing', lines: [{ name: 'Kundan Jhumka Pair', qty: 2, price: 18500 }] },
  { id: 'ORD-8938', customer: 'Kabir Singh', date: 'Yesterday', channel: 'Instagram', paid: true, status: 'packed', lines: [{ name: 'Diamond Solitaire Ring', qty: 1, price: 132000 }] },
  { id: 'ORD-8935', customer: 'Aditi Malhotra', date: 'Yesterday', channel: 'Walk-in', paid: true, status: 'shipped', lines: [{ name: 'Pearl Drop Necklace', qty: 1, price: 24000 }, { name: 'Silver Anklet Pair', qty: 1, price: 6200 }] },
  { id: 'ORD-8930', customer: 'Naveen Kumar', date: '2 days ago', channel: 'Website', paid: true, status: 'delivered', lines: [{ name: 'Rose Gold Stud Earrings', qty: 3, price: 14800 }] },
  { id: 'ORD-8927', customer: 'Rahul Mehta', date: '3 days ago', channel: 'Website', paid: true, status: 'delivered', lines: [{ name: 'Temple Gold Bangles (set of 4)', qty: 1, price: 64000 }] },
  { id: 'ORD-8921', customer: 'Sunita Rao', date: '4 days ago', channel: 'WhatsApp', paid: false, status: 'new', lines: [{ name: 'Kundan Jhumka Pair', qty: 1, price: 18500 }] },
  { id: 'ORD-8915', customer: 'Farah Khan', date: '5 days ago', channel: 'WhatsApp', paid: true, status: 'refunded', lines: [{ name: 'Pearl Drop Necklace', qty: 1, price: 24000 }] },
  { id: 'ORD-8910', customer: 'Tarun Gupta', date: '6 days ago', channel: 'Instagram', paid: false, status: 'cancelled', lines: [{ name: 'Silver Anklet Pair', qty: 2, price: 6200 }] },
];
