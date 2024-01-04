import { auth } from '@/auth.config';
import { redirect } from 'next/navigation';

export default async function CheckoutLayout({children}: {
 children: React.ReactNode;
}) {
   
  //Protegemos la ruta de esta forma ya que por via middleware no funciona
  const session = await auth();

  if (!session?.user) {
    // redirect('/auth/login?returnTo=/perfil');
    redirect("/auth/login?redirectTo=/checkout/address");
  }

  
  return (
    <>
    { children }
    </>
  );
}