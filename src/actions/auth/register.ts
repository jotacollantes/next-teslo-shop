"use server";

import prisma from "@/lib/prisma";
import bcryptjs from "bcryptjs";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email.toLowerCase(),
        password: bcryptjs.hashSync(password),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
 console.log('user', JSON.stringify(user, null, 2))
    return {
      ok: true,
      user: user,
      message: "Usuario creado",
    };
  } catch (error) {
    console.log(error);

    return {
      ok: false,
      message: "No se pudo crear el usuario",
    };
  }
};
