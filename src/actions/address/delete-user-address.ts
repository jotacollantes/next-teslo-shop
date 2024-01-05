'use server';

import prisma from '@/lib/prisma';


//Como la tabla UserAddress tiene una relacion 1 a 1 con User se puede usar el userId
export const deleteUserAddress = async( userId: string ) => {

  try {

    const deleted = await prisma.userAddress.delete({
      where: { userId }
    });

    return { ok: true };
    
  } catch (error) {
    console.log(error);
  
    return {
      ok: false,
      message: 'No se pudo eliminar la direccion'
    }


}
}