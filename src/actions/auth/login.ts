'use server';


import { signIn } from '@/auth.config';
import { sleep } from '@/utils';
 
// ...
 
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {

    // await sleep(2);
    console.log(Object.fromEntries(formData))
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      //Para no disparar la redireccion
      redirect: false,
    });

    return 'Success';


  } catch (error) {
    console.log(error);
    //Error que vamos a regresar
    return 'CredentialsSignin'


  }
}


export const login = async(email:string, password: string) => {

  try {

    await signIn('credentials',{ email, password })

    return {ok: true};
    
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: 'No se pudo iniciar sesión'
    }
    
  }


}

