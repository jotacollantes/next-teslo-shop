import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  address: {
    firstName: string;
    lastName: string;
    address: string;
    address2?: string;
    postalCode: string;
    city: string;
    country: string;
    phone: string;
  };

  // Methods
  // State["address"] quiere decir que la interfaz va a ser igual a la propiedad address del state actual con su objeto anidado
  setAddress: (address: State["address"]) => void;
}

export const useAddressStore = create<State>()(
  persist(
    (set, get) => ({
      //Inicializamos el state
      address: {
        firstName: "",
        lastName: "",
        address: "",
        address2: "",
        postalCode: "",
        city: "",
        country: "",
        phone: "",
      },
      //Metodo para grabar la direccion en el state
      setAddress: (address) => {
        set({ address });
      },
    }),
    {
      //Nombre del key en el local storage
      name: "address-storage",
    }
  )
);
