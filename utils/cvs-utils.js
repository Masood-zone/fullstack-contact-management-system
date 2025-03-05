const fs = require("fs");
const csv = require("fast-csv");
const csvParser = require("csv-parser");

exports.exportContactsToCSV = (contacts, filePath) => {
  return new Promise((resolve, reject) => {
    const csvStream = csv.format({ headers: true });
    const writableStream = fs.createWriteStream(filePath);

    csvStream.pipe(writableStream);

    contacts.forEach((contact) => {
      csvStream.write({
        Name: contact.name,
        Email: contact.email,
        Phone: contact.phone,
        Username: contact.username || "",
        Note: contact.note || "",
        Image: contact.image || "",
      });
    });

    csvStream.end();

    writableStream.on("finish", () => {
      resolve(filePath);
    });

    writableStream.on("error", (error) => {
      reject(error);
    });
  });
};

exports.importContactsFromCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const contacts = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        contacts.push({
          name: row.Name,
          email: row.Email,
          phone: row.Phone,
          username: row.Username,
          note: row.Note,
          image: row.Image,
        });
      })
      .on("end", () => {
        resolve(contacts);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};
