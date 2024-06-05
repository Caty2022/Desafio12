const supertest = require("supertest");

let expect;

before(async function () {
   const chai = await import("chai");
   expect = chai.expect;
});

const requester = supertest("http://localhost:8080");
const CartModel = require("../src/models/cart.model.js");
const UserModel = require("../src/models/user.model.js");

describe("Testing de la pagina  de ropa de Bebé.", () => {
  // Test Productos
  describe("Testing del Router de Productos", () => {
    it("Debería obtener todos los productos correctamente", async () => {
      const response = await requester.get("/api/products");
      expect(response.status).to.equal(200);
      expect(response.body).to.exist;
      expect(response.body.docs).to.be.an.instanceOf(Array);
    });

    it("Debería obtener un producto por su ID correctamente", async () => {
      const productId = "65f37ca36a130caa43b67a6f";
      const response = await requester.get(`/api/products/${productId}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("_id", productId);
    });
    it("Debería eliminar un producto correctamente", async () => {
      const productId = "65f37ca36a130caa43b67a70";
      const response = await requester.delete(`/api/products/${productId}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("_id", productId);
    });
  });

  //Test Carrito
  describe("Testing del Router del Carrito", () => {
    it("Debería crear un nuevo carrito correctamente", async () => {
      const response = await requester.post("/api/carts");
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("_id");
    });

    it("Debería obtener productos de un carrito correctamente", async () => {
      const cartId = "6626fcd9bd834d3a37172fb1";
      const response = await requester.get(`/api/carts/${cartId}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("_id", cartId);
    });

    it("Debería vaciar el carrito correctamente", async () => {
      const cartId = "6626fcd9bd834d3a37172fb1";
      const response = await requester.delete(`/api/carts/${cartId}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("status", "success");
      expect(response.body).to.have.property("updatedCart");
      expect(response.body.updatedCart).to.have.property("_id", cartId);
      expect(response.body.updatedCart.products).to.be.an("array").that.is
        .empty;
    });
  });
  //Test Usuarios
  describe("Testing del Router de Usuarios", () => {
    let token; // Almacenar el token JWT para la autenticación

    it("Debería registrar un nuevo usuario", async () => {
      const response = await requester.post("/api/users/register").send({
        first_name: "Caty",
        last_name: "Krz",
        email: "catykrz@example.com",
        password: "password123",
        age: 30,
      });
      const user = await UserModel.findOne({ email: "catykrz@example.com" });
      expect(user).to.exist; // Verificar si el usuario existe en la base de datos
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property(
        "message",
        "Usuario registrado correctamente"
      );
    });

    it("Debería iniciar sesión con un usuario existente", async () => {
      const response = await requester.post("/api/users/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).to.equal(200); // Cambiado a 200 ya que parece que la autenticación es exitosa
      expect(response.body).to.have.property("token").that.is.a("string");
    });

    it("Debería obtener el perfil de usuario con un token JWT válido", async () => {
      // Simular el inicio de sesión para obtener un token JWT válido
      const loginResponse = await requester.post("/api/users/login").send({
        email: "test@example.com",
        password: "password123",
      });
      token = loginResponse.body.token; // Almacenar el token JWT para usarlo en esta prueba

      const response = await requester
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(200); // Cambiado a 200 ya que parece que la autenticación es exitosa
      expect(response.body).to.have.property("user").that.is.an("object");
    });
  });
});