import DataList from '@/components/DataList';
import { fetchAdminData, fetchActiveBazaars } from '@/lib/fetchData';

export default async function Page() {
  const { stats, requests } = await fetchAdminData('shops');
  const bazaarsList = await fetchActiveBazaars();
  
  return (
    <DataList 
      tabName="shops"
      title="Shops Verification"
      description="Verify newly registered shops."
      stats={stats}
      requests={requests}
      bazaarsList={bazaarsList}
    />
  );
}
