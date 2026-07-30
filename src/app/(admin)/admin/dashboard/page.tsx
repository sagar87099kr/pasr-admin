import DashboardView from '@/components/DashboardView';
import { fetchAdminData } from '@/lib/fetchData';

export default async function Page() {
  const { dashboardData } = await fetchAdminData('dashboard');
  
  return (
    <DashboardView 
      title="Admin Dashboard"
      description="Overview of daily performance, orders, coins used, and revenue."
      dashboardData={dashboardData}
    />
  );
}
