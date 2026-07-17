import DataList from '@/components/DataList';
import { fetchAdminData } from '@/lib/fetchData';

export default async function Page() {
  const { stats, requests } = await fetchAdminData('kisan-sabha');
  
  return (
    <DataList 
      tabName="kisan-sabha"
      title="Kisan Sabha"
      description="Manage Kisan Sabha postings."
      stats={stats}
      requests={requests}
    />
  );
}
