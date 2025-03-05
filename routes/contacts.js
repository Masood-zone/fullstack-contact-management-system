const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact-controller");
const { ensureAuthenticated } = require("../middleware/auth");

// Protect all contact routes
router.use(ensureAuthenticated);

// Get all contacts (homepage)
router.get("/", contactController.getAllContacts);

// Add new contact
router.get("/contacts/add", contactController.showAddContactForm);
router.post("/contacts/add", contactController.addContact);

// Edit contact
router.get("/contacts/edit/:id", contactController.showEditContactForm);
router.post("/contacts/edit/:id", contactController.updateContact);

// Delete contact
router.get("/contacts/delete/:id", contactController.deleteContact);

// View specific contact
router.get("/contacts/:id", contactController.viewContact);

// Search contacts
router.get("/search", contactController.searchContacts);

// Export contacts
router.get("/contacts/export", contactController.exportContacts);

// Import contacts
router.get("/contacts/import", contactController.showImportForm);
router.post("/contacts/import", contactController.importContacts);

module.exports = router;
