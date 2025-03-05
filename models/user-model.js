const prisma = require("../config/db");
const bcrypt = require("bcryptjs");

class UserModel {
  static async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
  }

  static async findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async validatePassword(user, password) {
    return bcrypt.compare(password, user.password);
  }
}

module.exports = UserModel;
