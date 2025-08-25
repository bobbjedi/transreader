// server.js
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3033;
const distPath = path.join(__dirname, "dist/spa");

const server = http.createServer((req, res) => {
  let filePath = path.join(distPath, req.url === "/" ? "index.html" : req.url);
  const extname = path.extname(filePath).toLowerCase();

  // Content-Type по расширению
  const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };
  const contentType = mimeTypes[extname] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      // если файла нет → отдаем index.html (SPA fallback)
      if (err.code === "ENOENT") {
        fs.readFile(path.join(distPath, "index.html"), (err2, content2) => {
          if (err2) {
            res.writeHead(500);
            res.end("Server error");
          } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(content2, "utf-8");
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
