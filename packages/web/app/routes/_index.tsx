import { redirect } from 'react-router';

export async function clientLoader() {
  // TODO: 認証周りを作成した後修正を行う
  const isLoggedIn = true;

  if (isLoggedIn) throw redirect('/dashboard');
  else throw redirect('/login');
}
