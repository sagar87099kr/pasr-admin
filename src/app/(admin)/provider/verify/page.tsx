import DataList from '@/components/DataList';
import { fetchAdminData, fetchActiveBazaars } from '@/lib/fetchData';

export default async function Page() {
  const { stats, requests } = await fetchAdminData('providers');
  const bazaarsList = await fetchActiveBazaars();
  
  return (
    <DataList 
      tabName="providers"
      title="Providers Verification"
      description="Verify service providers."
      stats={stats}
      requests={requests}
      bazaarsList={bazaarsList}
    />
  );
}
