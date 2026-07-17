'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function setAdminAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set('adminAuth', 'true', { 
    secure: process.env.NODE_ENV === 'production', 
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
}

export async function clearAdminAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('adminAuth');
  redirect('/');
}
