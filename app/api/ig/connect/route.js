import { getUser } from '@/lib';
export const dynamic = 'force-dynamic';
export async function GET() {
  if (!(await getUser())) return Response.redirect(process.env.APP_URL + '/');
  const p = new URLSearchParams({ client_id: process.env.IG_APP_ID, redirect_uri: process.env.APP_URL + '/api/ig/callback', response_type: 'code', scope: 'instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages' });
  return Response.redirect('https://www.instagram.com/oauth/authorize?' + p);
}
