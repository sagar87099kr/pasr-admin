import DataList from '@/components/DataList';
import { fetchAdminData } from '@/lib/fetchData';

export default async function Page() {
  const { stats, requests } = await fetchAdminData('bazaars');
  
  return (
    <DataList 
      tabName="bazaars"
      title="Bazaars"
      description="Manage product bazaars."
      stats={stats}
      requests={requests}
    />
  );
}
