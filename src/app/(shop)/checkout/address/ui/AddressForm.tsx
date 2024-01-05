"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import clsx from "clsx";

import type { Address, Country } from "@/interfaces";
import { useAddressStore } from "@/store";
import { deleteUserAddress, getCountries, setUserAddress } from "@/actions";

//Inputs del formulario
type FormInputs = {
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  rememberAddress: boolean;
};

interface Props {
  countries: Country[];
  //Partial permite que todas las propiedades dentro del objeto userStoredAddress sean opcionales
  userStoredAddress?: Partial<Address>;
}

export const AddressForm = ({ countries, userStoredAddress = {} }: Props) => {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { isValid },
    reset,
  } = useForm<FormInputs>({
    defaultValues: {
      //Leer de la base datos loa datos de direccion almacenado
      ...(userStoredAddress as any),
      //Sobreescribo la propiedad rememberAddress en false
      rememberAddress: false,
    },
  });
 //Obtenemos los datos de la sesion
  const { data: session } = useSession({
    //! Si la sesion no esta activa se redireccciona a la pagina de login configurada en el auth.config.ts
    required: true,
  });

  //en este punto llamamos al metodo por referencia al state.setAddress que esta en el estoy useAddressStore
  const setAddress = useAddressStore((state) => state.setAddress);
  //llamamos al state que esta en el store useAddressStore
  const address = useAddressStore((state) => state.address);

  //! Tambien se puede usar el server action para hacer obtener el listado de paies desde la base de datos similar a fetch api. En este caso los paises son enviados desde el server component via props

  // const loadCountry = async()=>{
  //     const lista = await getCountries()
  //     console.log(lista)
  // }

  const onSubmit = async (data: FormInputs) => {
    //! EN data estan los valores ingresados por el cliente en el formulario
    console.log(data);
    //Grabamos en el store, zustand se encarga de todo, react hook form se encargo de la validacion
    setAddress(data);
    //excluimos el rememberAddress para usar el rest ... ya que la base de datos no tiene el campo remember
    const { rememberAddress, ...restAddress } = data;

    if (rememberAddress) {
      await setUserAddress(restAddress, session!.user.id);
    } else {
      await deleteUserAddress(session!.user.id);
    }

    router.push("/checkout");
  };

  //!Reseteamos el formulario con un useEffect
  useEffect(() => {
    if (address.firstName) {
      console.log("se cargo formulario")
      console.log(address)
      //En caso de que exista el dato de la direccion en el store, usaremos el reset de useForm y le enviamos el address que esta el store de zustand para cargar los inputs con los valores que estan en el localstorage
      reset(address);
    }else {
      console.log("nbo hay address en local storage, se carga de la BD")
    }

    //loadCountry()
  }, []);
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-2 sm:gap-5 sm:grid-cols-2"
    >
      <div className="flex flex-col mb-2">
        <span>Nombres</span>
        <input
          type="text"
          className="p-2 border rounded-md bg-gray-200"
          {...register("firstName", { required: true })}
        />
      </div>

      <div className="flex flex-col mb-2">
        <span>Apellidos</span>
        <input
          type="text"
          className="p-2 border rounded-md bg-gray-200"
          {...register("lastName", { required: true })}
        />
      </div>

      <div className="flex flex-col mb-2">
        <span>Dirección</span>
        <input
          type="text"
          className="p-2 border rounded-md bg-gray-200"
          {...register("address", { required: true })}
        />
      </div>

      <div className="flex flex-col mb-2">
        <span>Dirección 2 (opcional)</span>
        <input
          type="text"
          className="p-2 border rounded-md bg-gray-200"
          {...register("address2")}
        />
      </div>

      <div className="flex flex-col mb-2">
        <span>Código postal</span>
        <input
          type="text"
          className="p-2 border rounded-md bg-gray-200"
          {...register("postalCode", { required: true })}
        />
      </div>

      <div className="flex flex-col mb-2">
        <span>Ciudad</span>
        <input
          type="text"
          className="p-2 border rounded-md bg-gray-200"
          {...register("city", { required: true })}
        />
      </div>

      <div className="flex flex-col mb-2">
        <span>País</span>
        <select
          className="p-2 border rounded-md bg-gray-200"
          {...register("country", { required: true })}
        >
          <option value="">[ Seleccione ]</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col mb-2">
        <span>Teléfono</span>
        <input
          type="text"
          className="p-2 border rounded-md bg-gray-200"
          {...register("phone", { required: true })}
        />
      </div>

      <div className="flex flex-col mb-2 sm:mt-1">
        <div className="inline-flex items-center mb-10 ">
          <label
            className="relative flex cursor-pointer items-center rounded-full p-3"
            htmlFor="checkbox"
          >
            <input
              type="checkbox"
              className="border-gray-500 before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-blue-500 checked:bg-blue-500 checked:before:bg-blue-500 hover:before:opacity-10"
              id="checkbox"
              {...register("rememberAddress")}
            />
            <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </label>

          <span>¿Recordar dirección?</span>
        </div>

        <button
          disabled={!isValid}
          // href="/checkout"
          type="submit"
          // className="btn-primary flex w-full sm:w-1/2 justify-center "
          className={clsx({
            "btn-primary": isValid,
            "btn-disabled": !isValid,
          })}
        >
          Siguiente
        </button>
      </div>
    </form>
  );
};
