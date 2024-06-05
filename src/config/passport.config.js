const passport = require("passport");
const jwt = require("passport-jwt");
const JWTStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;
const GitHubStrategy = require("passport-github2");
const UserModel = require("../models/user.model.js");

const initializePassport = () => {
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]), // Utiliza ExtractJwt.fromExtractors para extraer el token de la cookie
        secretOrKey: "coderhouse",
      },
      async (jwt_payload, done) => {
        try {
          // Busca el usuario en la base de datos usando el ID del payload JWT
          const user = await UserModel.findById(jwt_payload.user._id);
          if (!user) {
            return done(null, false);
          }
          return done(null, user); // Devuelve el usuario encontrado
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserModel.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  passport.use(
    "github",
    new GitHubStrategy(
      {
         clientID: "Iv1.ccffd6de8959ee8e",
        clientSecret: "cadfd7a1e7f8e50e3b6a5d5e6a31fa869d37dfdf",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log(profile); // Información de GitHub del usuario que ingresa
        try {
          let user = await UserModel.findOne({ email: profile._json.email });
          if (!user) {
            let newUser = {
              first_name: profile._json.name,
              last_name: "secreto",
              age: 37,
              email: profile._json.email,
              password: "secreto",
            };
            let result = await UserModel.create(newUser);
            done(null, result);
          } else {
            done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["coderCookieToken"];
  }
  return token;
};

module.exports = initializePassport;
