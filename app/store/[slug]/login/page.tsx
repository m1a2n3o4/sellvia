import { redirect } from 'next/navigation';

// satyasell.com/store/<slug>/login -> shared client login (mobile + PIN)
export default function StoreLoginRedirect() {
  redirect('/client/login');
}
