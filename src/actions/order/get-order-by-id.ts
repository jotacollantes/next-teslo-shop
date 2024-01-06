'use server';

import { auth } from '@/auth.config';
import prisma from '@/lib/prisma';



export const getOrderById = async( id: string ) => {

  const session = await auth();

  if ( !session?.user ) {
    return {
      ok: false,
      message: 'Debe de estar autenticado'
    }
  }


  try {
    
    const order = await prisma.order.findUnique({
      where: { id },
      //! Con include puedo recuperar los datos de las relaciones
      include: {
        OrderAddress: true,
        //! sigo el orden de las relaciones
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            size: true,
            //! sigo el orden de las relaciones
            product: {
              select: {
                title: true,
                slug: true,
                //! sigo el orden de las relaciones
                ProductImage: {
                  select: {
                    url: true
                  },
                  //! solo una imagen
                  take: 1
                }
              }
            }
          }
        }
      }
    });
     //! si la orden no existe
    if( !order ) throw `${ id } no existe`;
    //! valido si la orden corresponde al usario que la consulta, el administrador puedes ver todas las ordenes
    if ( session.user.role === 'user' ) {
      if ( session.user.id !== order.userId ) {
        throw `${ id } no es de ese usuario`
      }
    }



    return {
      ok: true,
      order: order,
    }


  } catch (error) {

    console.log(error);

    return {
      ok: false,
      message: 'Orden no existe'
    }


  }




}