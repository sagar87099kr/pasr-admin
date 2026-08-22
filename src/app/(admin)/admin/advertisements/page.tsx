import AdvertisementView from '@/components/AdvertisementView';
import { fetchAdminData } from '@/lib/fetchData';

export default async function Page() {
  const { stats, requests } = await fetchAdminData('advertisements');

  return (
    <AdvertisementView 
      title="Advertisements"
      description="Manage application advertisements."
      stats={stats}
      requests={requests}
    />
  );
}
