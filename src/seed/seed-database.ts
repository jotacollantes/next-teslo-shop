//*Para poder ejecutar este script de Node es necesario que el directorio este configurado con soporte de typescript, para realizarlo se lo debe de hacer con el comando: cd src/seed: npx tsc --init , esto creara el archivo tsconfig.json
import { create } from "zustand";
import { initialData } from "./seed";
import prisma from "../lib/prisma";
import { Category } from "../interfaces/product.interface";

async function main() {
  // 1. Borrar registros previos
  // await Promise.all( [
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  // ]);

  const { categories, products } = initialData;

  //  Categorias
  // {
  //   name: 'Shirt'
  // }
  const categoriesData = categories.map((name) => ({ name: name }));

  await prisma.category.createMany({
    data: categoriesData,
  });

  const categoriesDB = await prisma.category.findMany();
  //console.log('Category Table', JSON.stringify(categoriesDB, null, 2))

  // const categoriesMap = categoriesDB.reduce((map, category) => {
  //   map[category.name.toLowerCase()] = category.id;
  //   return map;
  // }, {} as Record<string, string>);
  // //<string=shirt, string=categoryID>

  //Es necesario crear un objeto donde la key es el nombre del campo y el ID es el valor.
  // categoriesMap {
  //   "shirts": "2b696579-4762-440d-a96b-c595a99fdde6",
  //   "pants": "f4ce7d84-0096-4fe9-a58a-77d3dda67609",
  //   "hoodies": "c56f7822-8c31-41cd-b13a-8e15ffaefe8b",
  //   "hats": "045bc5bb-554d-4aad-9c4a-1d37be337277"
  // }
  let categoriesMap: { [x: string]: string };
  categoriesMap = {};
  for (const category of categoriesDB) {
    categoriesMap = {
      ...categoriesMap,
      [category.name.toLowerCase()]: category.id,
    };
  }
  console.log('categoriesMap', JSON.stringify(categoriesMap, null, 2))
  // Productos

  products.forEach(async (product) => {
    const { type, images, ...rest } = product;
    console.log(type, categoriesMap[type]);
    //console.log(type)

    const dbProduct = await prisma.product.create({
      data: {
        ...rest,
        categoryId: categoriesMap[type],
      },
    });

    //Images
    const imagesData = images.map((image) => ({
      url: image,
      productId: dbProduct.id,
    }));
     console.log('imagesData', JSON.stringify(imagesData, null, 2))
     await prisma.productImage.createMany({
       data: imagesData,
     });
  });

  console.log("Seed ejecutado correctamente");
}

(() => {
  if (process.env.NODE_ENV === "production") return;

  main();
})();
