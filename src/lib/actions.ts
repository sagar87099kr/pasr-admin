'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://www.pasr.in';

async function sendAction(action: string, payload: any) {
  const response = await fetch(`${API_URL}/api/admin/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ action, payload })
  });
  
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API returned ${response.status}: ${errorBody}`);
  }
  
  const json = await response.json();
  if (!json.success) {
    throw new Error(json.message || 'Action failed');
  }
  return json;
}

export async function assignBazaar(entityId: string, bazaarId: string, type: 'providers' | 'shops') {
  try {
    await sendAction('ASSIGN_BAZAAR', { entityId, bazaarId, type });
    revalidatePath(type === 'shops' ? '/shops/verify' : '/provider/verify');
    return { success: true };
  } catch (error: any) {
    console.error('Error assigning bazaar:', error);
    return { success: false, error: error.message || 'Failed to assign bazaar' };
  }
}

export async function assignDeliveryCategory(productId: string, category: string) {
  try {
    await sendAction('ASSIGN_DELIVERY_CATEGORY', { id: productId, category, collection: 'products' });
    revalidatePath('/product/verify');
    return { success: true };
  } catch (error: any) {
    console.error('Error assigning delivery category:', error);
    return { success: false, error: error.message || 'Failed to assign delivery category' };
  }
}

export async function assignItemDeliveryCategory(itemId: string, category: string) {
  try {
    await sendAction('ASSIGN_DELIVERY_CATEGORY', { id: itemId, category, collection: 'items' });
    revalidatePath('/items/verify');
    return { success: true };
  } catch (error: any) {
    console.error('Error assigning item delivery category:', error);
    return { success: false, error: error.message || 'Failed to assign item delivery category' };
  }
}

export async function deleteRecord(collectionName: string, recordId: string) {
  try {
    await sendAction('DELETE', { id: recordId, tab: collectionName });
    if (collectionName === 'products') revalidatePath('/product/verify');
    if (collectionName === 'items') revalidatePath('/items/verify');
    if (collectionName === 'shops') revalidatePath('/shops/verify');
    if (collectionName === 'providers') revalidatePath('/provider/verify');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting record:', error);
    return { success: false, error: error.message || 'Failed to delete record' };
  }
}

export async function updateRecordPrice(collectionName: string, recordId: string, newPrice: number) {
  try {
    await sendAction('UPDATE_PRICE', { id: recordId, collectionName, newPrice });
    if (collectionName === 'products') revalidatePath('/product/verify');
    if (collectionName === 'items') revalidatePath('/items/verify');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating price:', error);
    return { success: false, error: error.message || 'Failed to update price' };
  }
}
