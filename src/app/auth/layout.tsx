import { auth } from '@/auth.config';
import { redirect } from 'next/navigation';


export default async function ShopLayout( { children }: {
  children: React.ReactNode;
} ) {

  // el auth es exportado desde el authConfig
  const session = await auth();

 //Si existe una sesion valida lo redireccionamos al / caso contrario le mostamos la pagina de login o de new account
  if ( session?.user ) {
    redirect('/');
  }
  


  return (

    <main className="flex justify-center">
      <div className="w-full sm:w-[350px] px-10">

        { children }

      </div>
    </main>
  );
}