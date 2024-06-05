const UserModel = require("../models/user.model.js");
const CartModel = require("../models/cart.model.js");
const jwt = require("jsonwebtoken");
const { createHash, isValidPassword } = require("../utils/hashbcryp.js");
const UserDTO = require("../dto/user.dto.js");
const passport = require("passport");
const { logger } = require("../config/logger.config.js"); // Importar el logger
const { generateResetToken } = require("../utils/tokenreset.js");

const EmailManager = require("../service/email.js");
const emailManager = new EmailManager();

class UserController {
  async register(req, res) {
    const { first_name, last_name, email, password, age } = req.body;
    try {
      const existeUsuario = await UserModel.findOne({ email });
      if (existeUsuario) {
        return res.status(400).send("El usuario ya existe");
      }

      // Creo un nuevo carrito:
      const nuevoCarrito = new CartModel();
      await nuevoCarrito.save();

      const nuevoUsuario = new UserModel({
        first_name,
        last_name,
        email,
        cart: nuevoCarrito._id,
        password: createHash(password),
        age,
      });

      await nuevoUsuario.save();

      const token = jwt.sign({ user: nuevoUsuario }, "coderhouse", {
        expiresIn: "1h",
      });

      res.cookie("coderCookieToken", token, {
        maxAge: 3600000,
        httpOnly: true,
      });

      res.redirect("/api/users/profile");
      logger.info("Usuario registrado correctamente");
    } catch (error) {
      logger.error("Error al registrar el usuario:", error.message);
      res.status(500).send("Error interno del servidor");
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    try {
      const usuarioEncontrado = await UserModel.findOne({ email });

      if (!usuarioEncontrado) {
        return res.status(401).send("Usuario no válido");
      }

      const esValido = isValidPassword(password, usuarioEncontrado);
      if (!esValido) {
        return res.status(401).send("Contraseña incorrecta");
      }

      const token = jwt.sign({ user: usuarioEncontrado }, "coderhouse", {
        expiresIn: "1h",
      });

      res.cookie("coderCookieToken", token, {
        maxAge: 3600000,
        httpOnly: true,
      });

      res.redirect("/api/users/profile");
      logger.info("Usuario autenticado correctamente");
    } catch (error) {
      logger.error("Error al autenticar el usuario:", error.message);
      res.status(500).send("Error interno del servidor");
    }
  }

  async profile(req, res) {
    try {
      const isPremium = req.user.role === "premium";
      const userDto = new UserDTO(
        req.user.first_name,
        req.user.last_name,
        req.user.email,
        req.user.rol
      );
      // Verificar si el usuario es administrador
      const isAdmin = req.user.role === "admin";

      res.render("profile", { user: userDto, isPremium, isAdmin }); // Pasar isAdmin a la vista
      logger.info("Perfil del usuario obtenido correctamente");
    } catch (error) {
      logger.error("Error al obtener el perfil del usuario:", error.message);
      res.status(500).send("Error interno del servidor");
    }
  }

  async logout(req, res) {
    res.clearCookie("coderCookieToken");
    res.redirect("/login");
    logger.info("Usuario cerró sesión correctamente");
  }

  // Github
  async githubAuth(req, res, next) {
    passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
  }

  // Callback después de la autenticación con GitHub
  async githubAuthCallback(req, res) {
    passport.authenticate("github", { failureRedirect: "/login" })(
      req,
      res,
      () => {
        // Después de la autenticación exitosa, puedes generar el token JWT y redirigir al perfil del usuario
        const token = jwt.sign({ user: req.user }, "coderhouse", {
          expiresIn: "1h",
        });
        res.cookie("coderCookieToken", token, {
          maxAge: 3600000,
          httpOnly: true,
        });
        res.redirect("/api/users/profile");
        logger.info("Autenticación con GitHub exitosa");
      }
    );
  }

  async admin(req, res) {
    if (req.user.user.role !== "admin") {
      return res.status(403).send("Acceso denegado");
    }
    res.render("admin");
  }

  async requestPasswordReset(req, res) {
    const { email } = req.body;

    try {
      // Buscar al usuario por su correo electrónico
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).send("Usuario no encontrado");
      }

      // Generar un token
      const token = generateResetToken();

      // Guardar el token en el usuario
      user.resetToken = {
        token: token,
        expiresAt: new Date(Date.now() + 3600000), // 1 hora de duración
      };
      await user.save();

      // Enviar correo electrónico con el enlace de restablecimiento utilizando EmailService
      await emailManager.enviarCorreoRestablecimiento(
        email,
        user.first_name,
        token
      );

      res.redirect("/confirmacion-envio");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error interno del servidor");
    }
  }

  async resetPassword(req, res) {
    const { email, password, token } = req.body;

    try {
      // Buscar al usuario por su correo electrónico
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.render("passwordcambio", { error: "Usuario no encontrado" });
      }

      // Obtener el token de restablecimiento de la contraseña del usuario
      const resetToken = user.resetToken;
      if (!resetToken || resetToken.token !== token) {
        return res.render("passwordreset", {
          error: "El token de restablecimiento de contraseña es inválido",
        });
      }

      // Verificar si el token ha expirado
      const now = new Date();
      if (now > resetToken.expiresAt) {
        // Redirigir a la página de generación de nuevo correo de restablecimiento
        return res.redirect("/passwordcambio");
      }

      // Verificar si la nueva contraseña es igual a la anterior
      if (isValidPassword(password, user)) {
        return res.render("passwordcambio", {
          error: "La nueva contraseña no puede ser igual a la anterior",
        });
      }

      // Actualizar la contraseña del usuario
      user.password = createHash(password);
      user.resetToken = undefined; // Marcar el token como utilizado
      await user.save();

      // Renderizar la vista de confirmación de cambio de contraseña
      return res.redirect("/login");
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .render("passwordreset", { error: "Error interno del servidor" });
    }
  }

  async cambiarRolPremium(req, res) {
    try {
      const { uid } = req.params;

      const user = await UserModel.findById(uid);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const nuevoRol = user.role === "usuario" ? "premium" : "usuario";

      const actualizado = await UserModel.findByIdAndUpdate(
        uid,
        { role: nuevoRol },
        { new: true }
      );
      res.json(actualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}

module.exports = UserController;
