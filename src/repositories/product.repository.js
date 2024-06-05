const ProductModel = require("../models/product.model.js");
const CustomError = require("../service/errors/custom-error.js");

class ProductRepository {
  async agregarProducto({
    title,
    description,
    price,
    img,
    code,
    stock,
    category,
    thumbnails,
    owner,
  }) {
    try {
      if (!title || !description || !price || !code || !stock || !category) {
        // Puedes imprimir el valor de mensaje aquí
        console.log("Mensaje:", "Todos los campos son obligatorios");
        // Lanzar error de campos obligatorios
        CustomError.crearError({
          nombre: "CamposObligatorios",
          mensaje: "Todos los campos son obligatorios",
        });
      }

      const existeProducto = await ProductModel.findOne({ code: code });

      if (existeProducto) {
        // Puedes imprimir el valor de mensaje aquí también si lo deseas
        console.log("Mensaje:", "El código debe ser único");
        // Lanzar error de código duplicado
        CustomError.crearError({
          nombre: "CodigoDuplicado",
          mensaje: "El código debe ser único",
        });
      }

      console.log("Owner", owner);

      const newProduct = new ProductModel({
        title,
        description,
        price,
        img,
        code,
        stock,
        category,
        status: true,
        thumbnails: thumbnails || [],
        owner,
      });

      await newProduct.save();

      return newProduct;
    } catch (error) {
      // Manejar la excepción aquí
      console.error("Error al agregar el producto:", error.message);
      // Puedes lanzar la excepción nuevamente si es necesario
      throw error;
    }
  }

  async obtenerProductos(limit = 10, page = 1, sort, query) {
    try {
      const skip = (page - 1) * limit;

      let queryOptions = {};

      if (query) {
        queryOptions = { category: query };
      }

      const sortOptions = {};
      if (sort) {
        if (sort === "asc" || sort === "desc") {
          sortOptions.price = sort === "asc" ? 1 : -1;
        }
      }

      const productos = await ProductModel.find(queryOptions)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const totalProducts = await ProductModel.countDocuments(queryOptions);

      const totalPages = Math.ceil(totalProducts / limit);

      const hasPrevPage = page > 1;
      const hasNextPage = page < totalPages;

      return {
        docs: productos,
        totalPages,
        prevPage: hasPrevPage ? page - 1 : null,
        nextPage: hasNextPage ? page + 1 : null,
        page,
        hasPrevPage,
        hasNextPage,
        prevLink: hasPrevPage
          ? `/api/products?limit=${limit}&page=${
              page - 1
            }&sort=${sort}&query=${query}`
          : null,
        nextLink: hasNextPage
          ? `/api/products?limit=${limit}&page=${
              page + 1
            }&sort=${sort}&query=${query}`
          : null,
      };
    } catch (error) {
      throw new Error("Error");
    }
  }

  async obtenerProductoPorId(id) {
    try {
      const producto = await ProductModel.findById(id);

      if (!producto) {
        console.log("Producto no encontrado");
        return null;
      }

      console.log("Producto encontrado!! Claro que siiiiii");
      return producto;
    } catch (error) {
      throw new Error("Error");
    }
  }

  async actualizarProducto(id, productoActualizado) {
    try {
      const actualizado = await ProductModel.findByIdAndUpdate(
        id,
        productoActualizado
      );
      if (!actualizado) {
        console.log("No se encuentra che el producto");
        return null;
      }

      console.log("Producto actualizado con exito, como todo en mi vidaa!");
      return actualizado;
    } catch (error) {
      throw new Error("Error");
    }
  }

  async eliminarProducto(id) {
    try {
      const deleteado = await ProductModel.findByIdAndDelete(id);

      if (!deleteado) {
        console.log("No se encuentraaaa, busca bien!");
        return null;
      }

      console.log("Producto eliminado correctamente!");
      return deleteado;
    } catch (error) {
      throw new Error("Error");
    }
  }
}

module.exports = ProductRepository;
