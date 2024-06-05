const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const multer = require("multer");
const cors = require("cors");
const { logger, addLogger } = require("./config/logger.config.js");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const initializePassport = require("./config/passport.config.js")(passport); // Llamando a initializePassport con passport como argumento
const PUERTO = 8080;
require("./database.js");

const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const userRouter = require("./routes/user.router.js");
const mockRouter = require("./routes/mock.router.js");

const manejadorError = require("./middleware/error.js");

// Swagger
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUiExpress = require("swagger-ui-express");

// Utilizamos compresion:
const compression = require("express-compression");
app.use(compression());

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./src/public"));
app.use(addLogger);
app.use(cors());

// Middleware global de manejo de errores
app.use(manejadorError);

app.use(cookieParser());
app.use(
  session({
    secret: "secretCoder",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://catalinakrenz3316:coderhouse@cluster0.0yui3l4.mongodb.net/Ecommerce?retryWrites=true&w=majority&appName=Cluster0",
      ttl: 100,
    }),
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// AuthMiddleware
const authMiddleware = require("./middleware/authmiddleware.js");
app.use(authMiddleware);

// Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", userRouter);
app.use("/", viewsRouter);



const httpServer = app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});

// Websockets
const SocketManager = require("./sockets/socketmanager.js");
new SocketManager(httpServer);



//SWAGGER
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Tienda de ropa de Bebé",
      version: "1.0.0",
      description: "Regalá calidad para tu bebé.",
      contact: {
        name: "Catalina Krenz",
      },
      servers: ["http://localhost:8080"],
    },
  },
  apis: ["./src/docs/**/*.yaml"],
};

const specs = swaggerJSDoc(swaggerOptions);

app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));
