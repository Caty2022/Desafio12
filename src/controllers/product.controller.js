const ProductRepository = require("../repositories/product.repository.js");
const { logger } = require("../config/logger.config.js");

const productRepository = new ProductRepository();

class ProductController {
  async addProduct(req, res) {
    const nuevoProducto = req.body;
    try {
      const resultado = await productRepository.agregarProducto(nuevoProducto);
      res.json(resultado);
      logger.info("Producto agregado correctamente");
    } catch (error) {
      logger.error("Error al agregar el producto:", error.message);
      res.status(500).send("Error al agregar el producto");
    }
  }

  async getProducts(req, res) {
    try {
      let { limit = 10, page = 1, sort, query } = req.query;

      const productos = await productRepository.obtenerProductos(
        limit,
        page,
        sort,
        query
      );

      res.json(productos);
      logger.info("Productos obtenidos correctamente");
    } catch (error) {
      logger.error("Error al obtener los productos:", error.message);
      res.status(500).send("Error al obtener los productos");
    }
  }

  async getProductById(req, res) {
    const id = req.params.pid;
    try {
      const buscado = await productRepository.obtenerProductoPorId(id);
      if (!buscado) {
        return res.json({
          error: "Producto no encontrado",
        });
      }
      res.json(buscado);
      logger.info("Producto obtenido por ID correctamente");
    } catch (error) {
      logger.error("Error al obtener el producto por ID:", error.message);
      res.status(500).send("Error al obtener el producto por ID");
    }
  }

  async updateProduct(req, res) {
    try {
      const id = req.params.pid;
      const productoActualizado = req.body;

      const resultado = await productRepository.actualizarProducto(
        id,
        productoActualizado
      );
      res.json(resultado);
      logger.info("Producto actualizado correctamente");
    } catch (error) {
      logger.error("Error al actualizar el producto:", error.message);
      res.status(500).send("Error al actualizar el producto");
    }
  }

  async deleteProduct(req, res) {
    const id = req.params.pid;
    try {
      let respuesta = await productRepository.eliminarProducto(id);

      res.json(respuesta);
      logger.info("Producto eliminado correctamente");
    } catch (error) {
      logger.error("Error al eliminar el producto:", error.message);
      res.status(500).send("Error al eliminar el producto");
    }
  }
}

module.exports = ProductController;
