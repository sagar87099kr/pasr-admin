import DataList from '@/components/DataList';
import { fetchAdminData } from '@/lib/fetchData';

export default async function Page({ searchParams }: { searchParams: { date?: string } }) {
  const dateParam = searchParams?.date;
  const { stats, requests } = await fetchAdminData('orders', dateParam);
  
  return (
    <DataList 
      tabName="orders"
      title={dateParam === 'today' ? "Today's Orders" : "Orders"}
      description="Manage and verify platform orders."
      stats={stats}
      requests={requests}
    />
  );
}
