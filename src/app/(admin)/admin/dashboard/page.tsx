import DataList from '@/components/DataList';
import { fetchAdminData } from '@/lib/fetchData';

export default async function Page() {
  const { stats, requests } = await fetchAdminData('dashboard');
  
  return (
    <DataList 
      tabName="dashboard"
      title="Admin Dashboard"
      description="Overview of delivery performance, orders, and revenue."
      stats={stats}
      requests={requests}
    />
  );
}
