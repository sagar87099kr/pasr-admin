'use server';

import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

const MONGODB_URI = process.env.MONGODB_URI || '';

async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGODB_URI);
  }
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');
  return { db };
}

export async function assignBazaar(entityId: string, bazaarId: string, type: 'providers' | 'shops') {
  try {
    const { db } = await connectToDatabase();
    
    // Use the native mongodb driver to update
    const result = await db.collection(type).updateOne(
      { _id: new mongoose.Types.ObjectId(entityId) },
      { $set: { bazaar: new mongoose.Types.ObjectId(bazaarId), verified: true } }
    );
    
    if (result.matchedCount === 0) {
      throw new Error(`${type === 'shops' ? 'Shop' : 'Provider'} not found`);
    }
    
    // Revalidate the page to show the latest changes immediately
    revalidatePath(type === 'shops' ? '/shops/verify' : '/provider/verify');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error assigning bazaar:', error);
    return { success: false, error: error.message || 'Failed to assign bazaar' };
  }
}

export async function assignDeliveryCategory(productId: string, category: string) {
  try {
    const { db } = await connectToDatabase();
    
    const result = await db.collection('products').updateOne(
      { _id: new mongoose.Types.ObjectId(productId) },
      { $set: { deliveryCategory: category, verified: true } }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Product not found');
    }
    
    // Revalidate the page
    revalidatePath('/product/verify');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error assigning delivery category:', error);
    return { success: false, error: error.message || 'Failed to assign delivery category' };
  }
}

export async function assignItemDeliveryCategory(itemId: string, category: string) {
  try {
    const { db } = await connectToDatabase();
    
    const result = await db.collection('items').updateOne(
      { _id: new mongoose.Types.ObjectId(itemId) },
      { $set: { deliveryCategory: category, isVerified: true } }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Item not found');
    }
    
    // Revalidate the page
    revalidatePath('/items/verify');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error assigning item delivery category:', error);
    return { success: false, error: error.message || 'Failed to assign item delivery category' };
  }
}

export async function deleteRecord(collectionName: string, recordId: string) {
  try {
    const { db } = await connectToDatabase();
    
    const result = await db.collection(collectionName).deleteOne(
      { _id: new mongoose.Types.ObjectId(recordId) }
    );
    
    if (result.deletedCount === 0) {
      throw new Error('Record not found');
    }
    
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
    const { db } = await connectToDatabase();
    
    const result = await db.collection(collectionName).updateOne(
      { _id: new mongoose.Types.ObjectId(recordId) },
      { $set: { price: Number(newPrice) } }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Record not found');
    }
    
    if (collectionName === 'products') revalidatePath('/product/verify');
    if (collectionName === 'items') revalidatePath('/items/verify');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating price:', error);
    return { success: false, error: error.message || 'Failed to update price' };
  }
}
