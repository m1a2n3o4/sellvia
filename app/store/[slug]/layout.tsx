import { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { StoreLayoutClient } from './store-layout-client';

interface Props {
  children: React.ReactNode;
  params: { slug: string };
}

async function getStoreInfo(slug: string) {
  const info = await prisma.businessInfo.findUnique({
    where: { storeSlug: slug },
    include: { tenant: { select: { status: true } } },
  });

  if (!info || info.tenant.status !== 'active') return null;
  return info;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const store = await getStoreInfo(params.slug);
  if (!store) {
    return { title: 'Store Not Found | SatyaSell' };
  }

  const title = `${store.storeName || 'Store'} | SatyaSell`;
  const description = store.storeDescription || store.description || `Shop at ${store.storeName}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(store.storeBanner ? { images: [{ url: store.storeBanner }] } : {}),
      type: 'website',
    },
  };
}

export default async function StoreLayout({ children, params }: Props) {
  const store = await getStoreInfo(params.slug);

  if (!store) {
    notFound();
  }

  if (!store.storeEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4"
            style={{ backgroundColor: store.storeThemeColor || '#2563eb' }}
          >
            {store.storeName?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{store.storeName}</h1>
          <p className="text-gray-500 mt-2">This store is temporarily unavailable.</p>
          {store.shareOwnerPhone && store.ownerPhone && (
            <a
              href={`https://wa.me/${store.ownerPhone.replace(/^\+?/, '')}?text=Hi`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
            >
              Contact on WhatsApp
            </a>
          )}
        </div>
      </div>
    );
  }

  // Build whatsapp number
  let whatsappNumber: string | null = null;
  if (store.shareOwnerPhone && store.ownerPhone) {
    whatsappNumber = store.ownerPhone.replace(/^\+?/, '');
  }

  const storeData = {
    tenantId: store.tenantId,
    storeName: store.storeName || 'Store',
    storeSlug: store.storeSlug!,
    storeLogo: store.storeLogo,
    storeBanner: store.storeBanner,
    storeThemeColor: store.storeThemeColor || '#2563eb',
    storeDescription: store.storeDescription || store.description,
    deliveryFee: Number(store.deliveryFee),
    minOrderAmount: Number(store.minOrderAmount),
    codEnabled: store.codEnabled,
    onlinePayEnabled: store.onlinePayEnabled,
    whatsappNumber,
  };

  return <StoreLayoutClient store={storeData}>{children}</StoreLayoutClient>;
}
