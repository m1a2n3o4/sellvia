import { redirect } from 'next/navigation';

// Short link: satyasell.com/instagram -> the Instagram page in the CRM (the CRM layout sends logged-out visitors to /client/login).
export default function InstagramShortLink() {
  redirect('/app/channels/instagram');
}
