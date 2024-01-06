"use server";
import prisma from "@/lib/prisma";

import { auth } from "@/auth.config";
import type { Address, Size } from "@/interfaces";

interface ProductToOrder {
  productId: string;
  quantity: number;
  size: Size;
}

export const placeOrder = async (
  productIds: ProductToOrder[],
  address: Address
) => {
  //!obtenemos la session
  const session = await auth();
  const userId = session?.user.id;

  // Verificar sesión de usuario
  if (!userId) {
    return {
      ok: false,
      message: "No hay sesión de usuario",
    };
  }

  // Obtener la información de los productos
  // Nota: recuerden que podemos llevar 2+ productos con el mismo ID
  //! si hay 2 productos con el mismo id pero de diferente talla en el productsId, el query solo devolvera un registro por ambos
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds.map((p) => p.productId),
      },
    },
  });

  // Calcular los montos // Encabezado
  const itemsInOrder = productIds.reduce((count, p) => count + p.quantity, 0);

  // Los totales de tax, subtotal, y total
  const { subTotal, tax, total } = productIds.reduce(
    (totals, item) => {
      const productQuantity = item.quantity;
      const product = products.find((product) => product.id === item.productId);

      if (!product) throw new Error(`${item.productId} no existe - 500`);

      const subTotal = product.price * productQuantity;

      totals.subTotal += subTotal;
      totals.tax += subTotal * 0.15;
      totals.total += subTotal * 1.15;

      return totals;
    },
    { subTotal: 0, tax: 0, total: 0 }
  );
   console.log('totales', JSON.stringify({subTotal, tax, total}, null, 2))
  // Crear la transacción de base de datos
  try {

    const prismaTx = await prisma.$transaction(async (tx) => {
      //! 1. Actualizar el stock de los productos
      
      //! Creamos un array de promesas/transacciones
      const updatedProductsPromises = products.map(async(product) => {
        //  Acumular los valores
        const productQuantity = productIds
          .filter((p) => p.productId === product.id)
          .reduce((acc, item) => item.quantity + acc, 0);

        if (productQuantity === 0) {
          throw new Error(`${product.id} no tiene cantidad definida`);
        }

        return await tx.product.update({
          where: { id: product.id },
          data: {
            //!De este modo roduct.inStock - productQuantity, el product.inStock es un valor viejo que puede ser afectado por otro usuario en otra transaccion
            // inStock: product.inStock - productQuantity // no hacer
            inStock: {
              //! Lo correcto es actualizar el valor basado en el valor actual en la base de datos. puede caer en valor en negativo
              decrement: productQuantity,
            },
          },
        });
      });
      //! Ejecutamos en paralelo cada transaccion que esta dentro del array de promesas
      const updatedProducts = await Promise.all(updatedProductsPromises);
      console.log(updatedProducts)
      //! Verificar valores negativos en las existencia = no hay stock
      updatedProducts.forEach((product) => {
        if (product.inStock < 0) {
          //! Se hace el rollback
          throw new Error(`${product.title} no tiene inventario suficiente`);
        }
      });

      //! 2. Crear la orden - Encabezado - Detalles
      const order = await tx.order.create({
        data: {
          userId: userId,
          itemsInOrder: itemsInOrder,//total de items
          subTotal: subTotal,
          tax: tax,
          total: total,

          OrderItem: {
            createMany: {
              data: productIds.map((p) => ({
                quantity: p.quantity,
                size: p.size,
                productId: p.productId,
                price:
                  //!products lo creamos anteriormente en un prisma.product.findMany()
                  products.find((product) => product.id === p.productId)
                    ?.price ?? 0,
              })),
            },
          },
          //!En este punto tambien se puede grabar la  direccion.
        },
      });

      // Validar, si el price es cero, entonces, lanzar un error

      //! 3. Crear la direccion de la orden
      //! La direccion tambien se puede grabar en order.create
      // Address
      const { country, ...restAddress } = address;
      const orderAddress = await tx.orderAddress.create({
        data: {
          ...restAddress,
          countryId: country,
          orderId: order.id,
        },
      });
      //! SI llega a este return se hace el commit
      return {
        updatedProducts: updatedProducts,
        order: order,
        orderAddress: orderAddress,
      };
    });


    return {
      ok: true,
      order: prismaTx.order,
      prismaTx: prismaTx,
    }


  } catch (error: any) {
    return {
      ok: false,
      message: error?.message,
    };
  }
};
