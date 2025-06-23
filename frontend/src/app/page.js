
import { redirect } from 'next/navigation';

export default function Home() {
  //redirect to /upload on initial load
  redirect('/upload');

  return null; // no content needed as we redirect
}
