import DataList from '@/components/DataList';
import { fetchAdminData } from '@/lib/fetchData';

export default async function Page() {
  const { stats, requests } = await fetchAdminData('payouts');
  
  return (
    <DataList 
      tabName="payouts"
      title="Payouts"
      description="Manage vendor payouts and settlements."
      stats={stats}
      requests={requests}
    />
  );
}
