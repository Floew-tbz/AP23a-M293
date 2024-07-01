const FTPClient = require("ftp");
const path = require("path");
const fs = require("fs");
const klaw = require("klaw");

// FTP-Konfigurationsdetails
const FTP_CONFIG = {
  host: "battino.bplaced.net",
  user: "battino",
  password: "FCQ-cbu2jyv.jfn1bwg",
};

// Pfad zum lokalen `dist`-Verzeichnis
const localDir = path.join(__dirname, "dist");
const remoteDir = "/www/Site";

const client = new FTPClient();

client.on("ready", () => {
  // Funktion zum Hochladen einer Datei
  const uploadFile = (localPath, remotePath) => {
    client.put(localPath, remotePath, (err) => {
      if (err) {
        console.error(`Error uploading file ${localPath}: ${err.message}`);
      } else {
        console.log(`Successfully uploaded ${localPath} to ${remotePath}`);
      }
    });
  };

  // Durchsuchen des `dist`-Verzeichnisses und Hochladen der Dateien
  klaw(localDir)
    .on("data", (item) => {
      if (!item.stats.isDirectory()) {
        const localPath = item.path;
        const remotePath = path
          .join(remoteDir, path.relative(localDir, localPath))
          .replace(/\\/g, "/");
        uploadFile(localPath, remotePath);
      }
    })
    .on("end", () => {
      console.log("All files have been uploaded.");
      client.end();
    });
});

client.connect(FTP_CONFIG);
