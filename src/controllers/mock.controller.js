const { generateProduct } = require("../utils/mock.js");

class MockController {
  getProducts = (req, res) => {
    try {
      let products = [];
      for (let i = 0; i < 100; i++) {
        const product = generateProduct();
        const formattedProduct = {
          "Producto número": `#${i + 1}`,
          ...product,
        };
        products.push(formattedProduct);
      }
      res.status(200).send({ payload: products });
    } catch (error) {
      console.error("Error al generar productos falsos:", error);
      res
        .status(500)
        .send("Error interno del servidor al generar productos falsos");
    }
  };
}

module.exports = MockController;
