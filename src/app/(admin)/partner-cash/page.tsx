import PartnerCashList from '@/components/PartnerCashList';
import { fetchAdminData } from '@/lib/fetchData';

export default async function Page() {
  const { stats, requests } = await fetchAdminData('partner-cash');
  
  return (
    <PartnerCashList 
      stats={stats}
      requests={requests}
    />
  );
}
