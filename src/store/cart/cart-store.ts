import type { CartProduct } from "@/interfaces";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  //la insterfas CartProduct no es la misma a Product
  cart: CartProduct[];

  getTotalItems: () => number;
  getSummaryInformation: () => {
    subTotal: number;
    tax: number;
    total: number;
    itemsInCart: number;
  };
  //Metodos para manipular el carrito de compras
  addProductTocart: (product: CartProduct) => void;
  updateProductQuantity: (product: CartProduct, quantity: number) => void;
  removeProduct: (product: CartProduct) => void;
}

//!Con persist podemos leer y grabar el state en el localstorage
export const useCartStore = create<State>()(
  persist(
    (set, get) => ({
      //COnfiguramos el cart como un arreglo vacio
      cart: [],

      // Methods
      getTotalItems: () => {
        //Para obtener el state actual del estado en zustand
        const { cart } = get();
        return cart.reduce((total, item) => total + item.quantity, 0);
      },

      getSummaryInformation: () => {
        //Para obtener el state actual del estado en zustand
        const { cart } = get();

        const subTotal = cart.reduce(
          (subTotal, product) => product.quantity * product.price + subTotal,
          0
        );
        const tax = subTotal * 0.15;
        const total = subTotal + tax;
        const itemsInCart = cart.reduce(
          (total, item) => total + item.quantity,
          0
        );

        return {
          subTotal,
          tax,
          total,
          itemsInCart,
        };
      },

      addProductTocart: (product: CartProduct) => {
        //Para obtener el state actual del estado en zustand
        const { cart } = get();

        // 1. Revisar si el producto existe en el carrito con la talla seleccionada
        //Con some se verifica al menos un solo elemento y ya no verifica los demas
        const productInCart = cart.some(
          (item) => item.id === product.id && item.size === product.size
        );

        //SI no esta el producto en el carrito lo insertamos  
        if (!productInCart) {
          //Propagamos el cart actual e insertamos el nuevo producto
          set({ cart: [...cart, product] });
          return;
        }

        // 2. En este punto se que el producto existe por talla... tengo que incrementar
        const updatedCartProducts = cart.map((item) => {
          //Si existe el producto con la talla especifica lo incrementamos
          if (item.id === product.id && item.size === product.size) {
            return { ...item, quantity: item.quantity + product.quantity };
          }
          //En este punto si no existe el producto salimos del map haciendo return del item iterado
          return item;
        });
        //EN este punto actualizamos el cart on los productos verificados en updatedCartProducts
        set({ cart: updatedCartProducts });
      },

      updateProductQuantity: (product: CartProduct, quantity: number) => {
        //console.log({product,quantity})
        const { cart } = get();

        const updatedCartProducts = cart.map((item) => {
          if (item.id === product.id && item.size === product.size) {
            //Si existe el producto con la talla especifica, actualizamos la cantidad
            return { ...item, quantity: quantity };
          }
          //En este punto si no existe el producto salimos del map haciendo return del item iterado
          return item;
        });
        //EN este punto actualizamos el cart on los productos verificados en updatedCartProducts
        set({ cart: updatedCartProducts });
      },

      removeProduct: (product: CartProduct) => {
        
        //Para obtener el state actual del estado en zustand
        const { cart } = get();
        //Removemos el item del carrito que coincida el id y la size, par eso usamos filter
        const updatedCartProducts = cart.filter(
          (item) => 
            //item.id !== product.id || item.size !== product.size
            `${item.id.trim()}-${item.size}` !==`${product.id.trim()}-${product.size}`
        );
         //EN este punto actualizamos el cart on los productos verificados en updatedCartProducts 
        set({ cart: updatedCartProducts });
      },
    }),
    //!Nombre de la llave en localstorage
    {
      name: "shopping-cart",
    }
  )
);
