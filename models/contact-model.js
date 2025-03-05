const prisma = require("../config/db");

class ContactModel {
  static async getAllContacts(userId) {
    return await prisma.contact.findMany({
      where: { userId },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async addContact(contactData) {
    return await prisma.contact.create({
      data: contactData,
    });
  }

  static async getContactByEmail(email, userId) {
    return await prisma.contact.findFirst({
      where: { email, userId },
    });
  }

  static async getContactById(id, userId) {
    return await prisma.contact.findFirst({
      where: { id: Number.parseInt(id), userId },
    });
  }

  static async updateContact(id, contactData, userId) {
    return await prisma.contact.updateMany({
      where: { id: Number.parseInt(id), userId },
      data: contactData,
    });
  }

  static async deleteContact(id, userId) {
    return await prisma.contact.deleteMany({
      where: { id: Number.parseInt(id), userId },
    });
  }

  static async searchContacts(searchTerm, userId) {
    return await prisma.contact.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { phone: { contains: searchTerm, mode: "insensitive" } },
          { username: { contains: searchTerm, mode: "insensitive" } },
          { note: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}

module.exports = ContactModel;
