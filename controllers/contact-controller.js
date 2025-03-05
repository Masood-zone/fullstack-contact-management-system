const ContactModel = require("../models/contact-model");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const {
  exportContactsToCSV,
  importContactsFromCSV,
} = require("../utils/cvs-utils");

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv") {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactModel.getAllContacts(req.user.id);
    const selectedContact = req.query.id
      ? await ContactModel.getContactById(req.query.id, req.user.id)
      : contacts.length > 0
      ? contacts[0]
      : null;

    res.render("index", {
      contacts,
      selectedContact,
      title: "Contact Management System",
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).render("error", {
      message: "Failed to load contacts",
      error,
    });
  }
};

exports.showAddContactForm = (req, res) => {
  res.render("add-contact", { title: "Add New Contact" });
};

exports.addContact = async (req, res) => {
  try {
    const { name, email, phone, username, note, image } = req.body;
    await ContactModel.addContact({
      name,
      email,
      phone,
      username,
      note,
      image: image || null,
      userId: req.user.id,
    });
    res.redirect("/");
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).render("error", {
      message: "Failed to add contact",
      error,
    });
  }
};

exports.showEditContactForm = async (req, res) => {
  try {
    const contact = await ContactModel.getContactById(req.params.id);
    if (!contact) {
      return res.status(404).render("error", {
        message: "Contact not found",
      });
    }
    res.render("edit-contact", {
      contact,
      title: "Edit Contact",
    });
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).render("error", {
      message: "Failed to load contact",
      error,
    });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { name, email, phone, username, note, image } = req.body;
    await ContactModel.updateContact(req.params.id, {
      name,
      email,
      phone,
      username,
      note,
      image: image || null,
    });
    res.redirect(`/?id=${req.params.id}`);
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).render("error", {
      message: "Failed to update contact",
      error,
    });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    await ContactModel.deleteContact(req.params.id);
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).render("error", {
      message: "Failed to delete contact",
      error,
    });
  }
};

exports.viewContact = async (req, res) => {
  try {
    const contacts = await ContactModel.getAllContacts();
    const selectedContact = await ContactModel.getContactById(req.params.id);

    if (!selectedContact) {
      return res.status(404).render("error", {
        message: "Contact not found",
      });
    }

    res.render("index", {
      contacts,
      selectedContact,
      title: `${selectedContact.name} | Contact Management System`,
    });
  } catch (error) {
    console.error("Error viewing contact:", error);
    res.status(500).render("error", {
      message: "Failed to view contact",
      error,
    });
  }
};

exports.searchContacts = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.session.userId; // Assuming you have authentication

    if (!q) {
      return res.redirect("/");
    }

    const contacts = await ContactModel.searchContacts(q, userId);
    const selectedContact = contacts.length > 0 ? contacts[0] : null;

    res.render("index", {
      title: `Search: ${q} | Contact Management System`,
      contacts,
      selectedContact,
      searchTerm: q,
    });
  } catch (error) {
    console.error("Error searching contacts:", error);
    res.status(500).render("error", {
      message: "Failed to search contacts",
      error,
    });
  }
};

exports.exportContacts = async (req, res) => {
  try {
    const userId = req.session.userId; // Assuming you have authentication
    const contacts = await ContactModel.getAllContacts(userId);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `contacts-export-${timestamp}.csv`;
    const filePath = path.join(__dirname, "..", "public", "exports", fileName);

    // Ensure the exports directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await exportContactsToCSV(contacts, filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
      }

      // Delete the file after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("Error exporting contacts:", error);
    res.status(500).render("error", {
      message: "Failed to export contacts",
      error,
    });
  }
};

exports.showImportForm = (req, res) => {
  res.render("import-contacts", { title: "Import Contacts" });
};

exports.importContacts = [
  upload.single("csvFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).render("importContacts", {
          title: "Import Contacts",
          error: "Please upload a CSV file",
        });
      }

      const userId = req.session.userId; // Assuming you have authentication
      const contacts = await importContactsFromCSV(req.file.path);

      // Import each contact
      let importedCount = 0;
      for (const contact of contacts) {
        try {
          await ContactModel.addContact({
            ...contact,
            userId,
          });
          importedCount++;
        } catch (err) {
          console.error(`Error importing contact ${contact.email}:`, err);
          // Continue with next contact
        }
      }

      // Delete the uploaded file
      fs.unlinkSync(req.file.path);

      res.render("import-contacts", {
        title: "Import Contacts",
        success: `Successfully imported ${importedCount} contacts`,
      });
    } catch (error) {
      console.error("Error importing contacts:", error);
      res.status(500).render("error", {
        message: "Failed to import contacts",
        error,
      });
    }
  },
];
