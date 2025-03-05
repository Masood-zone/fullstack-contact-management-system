const LocalStrategy = require("passport-local").Strategy;
const UserModel = require("../models/user-model");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function initialize(passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await UserModel.findUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "No user with that email" });
          }

          const isMatch = await UserModel.validatePassword(user, password);
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password incorrect" });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

module.exports = initialize;
