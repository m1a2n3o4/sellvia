// Service boundary for dashboard + channel data. Swap mocks for real queries later.
import { MOCK_DASHBOARD, type DashboardData } from '../mock/dashboard';
import { MOCK_IG, MOCK_POSTS, type IgPost } from '../mock/instagram';
import { MOCK_WA, type WaData } from '../mock/whatsapp';

export async function getDashboard(): Promise<DashboardData> { return MOCK_DASHBOARD; }
export async function getInstagramChannel(): Promise<{ profile: typeof MOCK_IG; posts: IgPost[] }> {
  return { profile: MOCK_IG, posts: MOCK_POSTS };
}

export async function getWhatsApp(): Promise<WaData> { return MOCK_WA; }
