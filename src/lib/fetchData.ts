const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://www.pasr.in';

export async function fetchAdminData(tab: string, filterParam?: string) {
  try {
    let url = `${API_URL}/api/admin/data?tab=${tab}`;
    if (filterParam) {
      url += `&filterParam=${filterParam}`;
    }

    const response = await fetch(url, {
      cache: 'no-store', // Always fetch fresh data for admin
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const json = await response.json();
    if (!json.success) {
      throw new Error(json.message || 'Failed to fetch data');
    }

    return { stats: json.stats, requests: json.requests };
  } catch (error: any) {
    console.error('fetchAdminData error:', error);
    return { 
      stats: { pending: 0, verified: 0, rejected: 0 }, 
      requests: [{ id: 'ERROR', title: String(error.message || error), raw: {} }] 
    };
  }
}

export async function fetchActiveBazaars() {
  try {
    const response = await fetch(`${API_URL}/api/admin/bazaars/active`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) return [];
    
    const json = await response.json();
    return json.success && Array.isArray(json.bazaars) ? json.bazaars : [];
  } catch (error) {
    console.error('Error fetching bazaars:', error);
    return [];
  }
}
