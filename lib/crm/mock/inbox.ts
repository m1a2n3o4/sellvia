// SIMULATED unified inbox: WhatsApp chats (from the WhatsApp mock) plus Instagram DMs.
import { MOCK_WA, type WaMessage } from './whatsapp';

export type Channel = 'WhatsApp' | 'Instagram';
export type ThreadState = 'ai' | 'needs_you' | 'resolved';
export interface Thread { id: string; channel: Channel; name: string; handle: string; last: string; time: string; unread: number; state: ThreadState; messages: WaMessage[] }

const m = (id: string, from: WaMessage['from'], text: string, time: string): WaMessage => ({ id, from, text, time });

const wa: Thread[] = MOCK_WA.chats.slice(0, 9).map((c) => ({
  id: c.id, channel: 'WhatsApp', name: c.name, handle: c.phone,
  last: c.messages[c.messages.length - 1]?.text ?? '', time: c.lastTime, unread: c.unread,
  state: c.tags.includes('wants_you') || c.tags.includes('complaint') ? 'needs_you' : c.tags.includes('order') ? 'resolved' : 'ai',
  messages: c.messages,
}));

const ig: Thread[] = [
  { id: 'ig1', channel: 'Instagram', name: 'riya.styles', handle: '@riya.styles', last: 'Is the polki set still available?', time: '11:02 AM', unread: 1, state: 'ai', messages: [
    m('1', 'customer', 'Is the polki set still available?', '11:02 AM'), m('2', 'ai', 'Yes, 3 pieces left. Want the order link?', '11:02 AM') ] },
  { id: 'ig2', channel: 'Instagram', name: 'kabir_singh', handle: '@kabir_singh', last: 'Can I get a discount on two rings?', time: '10:20 AM', unread: 1, state: 'needs_you', messages: [
    m('1', 'customer', 'Can I get a discount on two rings?', '10:20 AM'), m('2', 'ai', 'I cannot offer discounts. I have asked the owner to reply to you.', '10:20 AM') ] },
  { id: 'ig3', channel: 'Instagram', name: 'tarun.g', handle: '@tarun.g', last: 'Thanks, ordered!', time: 'Yesterday', unread: 0, state: 'resolved', messages: [
    m('1', 'customer', 'Anklet price?', '4:10 PM'), m('2', 'ai', '₹6,200 per pair. Link: satyasell.link/o/8910', '4:10 PM'), m('3', 'customer', 'Thanks, ordered!', '4:20 PM') ] },
];

export const MOCK_THREADS: Thread[] = [...wa, ...ig];
