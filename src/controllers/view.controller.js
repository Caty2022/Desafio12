const ProductModel = require("../models/product.model.js");
const CartRepository = require("../repositories/cart.repository.js");
const cartRepository = new CartRepository();
const { logger } = require("../config/logger.config.js");

class ViewsController {
  async renderProducts(req, res) {
    try {
      const { page = 1, limit = 6 } = req.query;

      const skip = (page - 1) * limit;

      const productos = await ProductModel.find().skip(skip).limit(limit);

      const totalProducts = await ProductModel.countDocuments();

      const totalPages = Math.ceil(totalProducts / limit);

      const hasPrevPage = page > 1;
      const hasNextPage = page < totalPages;

      const nuevoArray = productos.map((producto) => {
        const { _id, ...rest } = producto.toObject();
        return { id: _id, ...rest }; // Agregar el ID al objeto
      });

      const cartId = req.user.cart.toString();
      // console.log(cartId);

      res.render("products", {
        productos: nuevoArray,
        hasPrevPage,
        hasNextPage,
        prevPage: page > 1 ? parseInt(page) - 1 : null,
        nextPage: page < totalPages ? parseInt(page) + 1 : null,
        currentPage: parseInt(page),
        totalPages,
        cartId,
      });
      logger.info("Productos renderizados correctamente");
    } catch (error) {
      logger.error("Error al renderizar los productos:", error.message);
      res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      });
    }
  }

  async renderCart(req, res) {
    const cartId = req.params.cid;
    try {
      const carrito = await cartRepository.obtenerProductosDeCarrito(cartId);

      if (!carrito) {
        console.log("No existe ese carrito con el id");
        return res.status(404).json({ error: "Carrito no encontrado" });
      }

      let totalCompra = 0;

      const productosEnCarrito = carrito.products.map((item) => {
        const product = item.product.toObject();
        const quantity = item.quantity;
        const totalPrice = product.price * quantity;

        totalCompra += totalPrice;

        return {
          product: { ...product, totalPrice },
          quantity,
          cartId,
        };
      });

      res.render("carts", {
        productos: productosEnCarrito,
        totalCompra,
        cartId,
      });
      logger.info("Carrito renderizado correctamente");
    } catch (error) {
      logger.error("Error al renderizar el carrito:", error.message);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async renderLogin(req, res) {
    res.render("login");
  }

  async renderRegister(req, res) {
    res.render("register");
  }

  async renderRealTimeProducts(req, res) {
    const usuario = req.user;
    try {
      res.render("realtimeproducts", {
        role: usuario.role,
        email: usuario.email,
      });
      logger.info(
        "Vista de productos en tiempo real renderizada correctamente"
      );
    } catch (error) {
      logger.error(
        "Error al renderizar la vista de productos en tiempo real:",
        error.message
      );
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async renderChat(req, res) {
    res.render("chat");
  }

  async renderHome(req, res) {
    res.render("home");
  }
  async renderResetPassword(req, res) {
    res.render("passwordreset");
  }

  async renderCambioPassword(req, res) {
    res.render("passwordcambio");
  }

  async renderConfirmacion(req, res) {
    res.render("confirmacion-envio");
  }

  async renderPremium(req, res) {
    res.render("panel-premium");
  }
}

module.exports = ViewsController;
