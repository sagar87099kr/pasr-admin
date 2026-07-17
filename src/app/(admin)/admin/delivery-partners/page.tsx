import DataList from '@/components/DataList';
import { fetchAdminData } from '@/lib/fetchData';

export default async function Page() {
  const { stats, requests } = await fetchAdminData('delivery');
  
  return (
    <DataList 
      tabName="delivery"
      title="Delivery Partners"
      description="Verify and manage delivery partners."
      stats={stats}
      requests={requests}
    />
  );
}
