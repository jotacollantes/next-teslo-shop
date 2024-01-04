'use client';

import { SessionProvider } from 'next-auth/react';


interface Props {
  children: React.ReactNode;
}

//Para verificaciones de la session de lado del frontend es necesario crear el provider para SessionProvider y es necesario crear el enpoint http://localhost:3000/api/auth/session
export const Provider = ({ children }: Props) => {


  return (
    
    <SessionProvider>
      {/* Podemos incluir mas Provider para que solo sea usao el Provider principal en un unico layout en este caso el rootLayout */}
      { children }
    </SessionProvider>
  )
}