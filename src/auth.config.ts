import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { z } from "zod";

import prisma from "./lib/prisma";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/new-account",
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      //console.log({ auth });
      // const isLoggedIn = !!auth?.user;

      // const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      // if (isOnDashboard) {
      //   if (isLoggedIn) return true;
      //   return false; // Redirect unauthenticated users to login page
      // } else if (isLoggedIn) {
      //   return Response.redirect(new URL('/dashboard', nextUrl));
      // }
      return true;
    },
    //Se desestructuran de params
    jwt({ token, user }) {
      //si el usuario existe asignamos el valor de user a la propiedad token.data que ya estara disponible en la session
      if (user) {
        token.data = user;
      }
      // el user tiene la informacion que se envia desde el metodo providers[authorize()]
      //console.log("metodo jwt", JSON.stringify({ token }, null, 2));
      return token;
    },
    //Se desestructuran de params
    session({ session, token, user }) {
      //El tipado para session. user esta en el archivo nextauth.d.ts
      session.user = token.data as any;
      //console.log("metodo session", JSON.stringify({ session }, null, 2));
      return session;
    },
  },

  providers: [
    Credentials({
      async authorize(credentials) {
        // Validamos el formato de email y password con Zod
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
        // Si la validacion no es valida devolvemos null caso contrario continuamos
        if (!parsedCredentials.success) return null;

        //Obtenemos el email y password
        const { email, password } = parsedCredentials.data;
        //console.log("auth.config.ts");
        //console.log({ email, password });
        // Buscar el correo en la BD
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        //si no existe
        if (!user) return null;

        // Comparar las contraseñas
        if (!bcryptjs.compareSync(password, user.password)) return null;

        // Regresar el usuario sin el password (se uso _ para renombrarlo porque ya esta desestructurado en parsedCredentials)
        const { password: _, ...rest } = user;
        // Aqui se retorna la informacion que se utilizaran en los demas callbacks de NextAuth
        //No envio la clave
        return rest;
      },
    }),
  ],
};

//Exportamos los metodos
export const { signIn, signOut, auth, handlers } = NextAuth(authConfig);
