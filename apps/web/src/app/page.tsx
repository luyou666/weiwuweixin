import { redirect } from 'next/navigation';

// Root page simply redirects to default locale
export default function RootPage() {
  redirect('/zh');
}