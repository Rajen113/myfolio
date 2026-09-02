const fs = require("fs");
const path = require("path");

try {
  const pkgPath = path.join(process.cwd(), "node_modules", "@react-pdf", "hyphenate", "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkg.exports = {
      ".": {
        "types": "./lib/index.d.ts",
        "import": "./lib/index.js",
        "default": "./lib/index.js"
      },
      "./en-us": "./lib/en-us.js",
      "./*": "./lib/*.js"
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log("✓ Patched @react-pdf/hyphenate package exports for Node 20 compatibility");
  }
} catch (err) {
  console.warn("Could not patch @react-pdf/hyphenate:", err);
}
