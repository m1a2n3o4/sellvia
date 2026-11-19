// Service boundary for CRM screens (Customers, Inbox, Catalogue, Orders). UI never imports ../mock directly.
import { MOCK_CUSTOMERS, type Customer } from '../mock/customers';
import { MOCK_PRODUCTS, MOCK_ORDERS, type Product, type Order } from '../mock/catalogue';
import { MOCK_THREADS, type Thread } from '../mock/inbox';

export async function getCustomers(): Promise<Customer[]> { return MOCK_CUSTOMERS; }
export async function getThreads(): Promise<Thread[]> { return MOCK_THREADS; }
export async function getProducts(): Promise<Product[]> { return MOCK_PRODUCTS; }
export async function getOrders(): Promise<Order[]> { return MOCK_ORDERS; }

import { MOCK_ROOM_TYPES, MOCK_BOOKINGS, type RoomType, type Booking } from '../mock/hospitality';
import { MOCK_EVENTS, MOCK_TICKET_BOOKINGS, type EventItem, type TicketBooking } from '../mock/events';
export async function getRoomTypes(): Promise<RoomType[]> { return MOCK_ROOM_TYPES; }
export async function getBookings(): Promise<Booking[]> { return MOCK_BOOKINGS; }
export async function getEvents(): Promise<EventItem[]> { return MOCK_EVENTS; }
export async function getTicketBookings(): Promise<TicketBooking[]> { return MOCK_TICKET_BOOKINGS; }
