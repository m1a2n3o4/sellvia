import { InstagramEntry } from '@/components/crm/channels/instagram-entry';
import { getInstagramChannel } from '@/lib/crm/services/insights';

export default async function InstagramChannelPage() {
  const { profile, posts } = await getInstagramChannel();
  return <InstagramEntry profile={profile} posts={posts} />;
}
