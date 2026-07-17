import DataList from '@/components/DataList';
import { fetchAdminData } from '@/lib/fetchData';

export default async function Page() {
  const { stats, requests: itemsData } = await fetchAdminData('items');
  const { requests: bazaars } = await fetchAdminData('bazaars');
  const bazaarsList = (bazaars || []).map((b: any) => ({ id: b.raw?._id?.toString() || b.id || 'error', name: b.title || 'Unknown' }));
  
  return (
    <DataList 
      tabName="items"
      title="Shop Items Verification"
      description="Verify individual shop items and assign delivery categories."
      stats={stats}
      requests={itemsData}
      bazaarsList={bazaarsList}
    />
  );
}
