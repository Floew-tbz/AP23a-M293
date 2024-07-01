const { exec } = require("child_process");
const rimraf = require("rimraf");
const fs = require("fs");
const path = require("path");
const sass = require("node-sass");

// Pfade
const paths = {
  src: "Site",
  dist: "dist",
};

// Verzeichnisse löschen und neu erstellen
rimraf.sync(paths.dist);
fs.mkdirSync(paths.dist);

// HTML-Dateien minimieren und kopieren
fs.readdir(paths.src, (err, files) => {
  if (err) {
    console.error(`Error reading source directory: ${err.message}`);
    return;
  }

  const htmlFiles = files.filter((file) => path.extname(file) === ".html");
  htmlFiles.forEach((file) => {
    const inputFilePath = path.join(paths.src, file);
    const outputFilePath = path.join(paths.dist, file);

    exec(
      `npx html-minifier-terser ${inputFilePath} -o ${outputFilePath} --collapse-whitespace --remove-comments --minify-css true --minify-js true`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(`Error minifying HTML file ${file}: ${stderr}`);
          return;
        }
        console.log(`HTML file ${file} minified successfully.`);
      }
    );
  });

  // Warten, bis alle HTML-Dateien minimiert sind
  Promise.all(
    htmlFiles.map(
      (file) =>
        new Promise((resolve) => {
          const outputFilePath = path.join(paths.dist, file);
          const checkFile = () =>
            fs.existsSync(outputFilePath)
              ? resolve()
              : setTimeout(checkFile, 100);
          checkFile();
        })
    )
  ).then(() => {
    console.log("All HTML files have been minified.");
  });
});

// SCSS zu CSS kompilieren und minimieren
const inputScssFilePath = path.join(paths.src, "styles.scss");
const outputCssFilePath = path.join(paths.dist, "styles.css");

sass.render({ file: inputScssFilePath }, (err, result) => {
  if (err) {
    console.error(`Error compiling SCSS: ${err.message}`);
    return;
  }

  fs.writeFile(outputCssFilePath, result.css, (err) => {
    if (err) {
      console.error(`Error writing CSS file: ${err.message}`);
      return;
    }

    console.log("SCSS compiled to CSS successfully.");

    // CSS minimieren
    exec(
      `npx clean-css-cli -o ${outputCssFilePath} ${outputCssFilePath}`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(`Error minifying CSS: ${stderr}`);
          return;
        }
        console.log("CSS minified successfully.");
      }
    );
  });
});

// Ressourcen kopieren (Schriftarten, Bilder, etc.)
exec(
  `npx copyfiles -u 1 "${paths.src}/*.{ttf,jpg,png,svg}" ${paths.dist}`,
  (err, stdout, stderr) => {
    if (err) {
      console.error(`Error copying resources: ${stderr}`);
      return;
    }
    console.log("Resources copied successfully.");
  }
);
