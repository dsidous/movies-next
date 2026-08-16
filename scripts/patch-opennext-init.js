const fs = require("node:fs");
const path = require("node:path");

const target = path.join(
  __dirname,
  "../node_modules/@opennextjs/cloudflare/dist/cli/templates/init.js",
);

const patched = `            if (init) {
                delete init.cache;
                // https://github.com/cloudflare/workerd/issues/2746
                // https://github.com/cloudflare/workerd/issues/3245
                // Only rewrite the body when it is a Node Readable stream and make the
                // property configurable so reused RequestInit objects do not throw
                // "Cannot redefine property: body".
                if (init.body instanceof stream.Readable) {
                    Object.defineProperty(init, "body", {
                        configurable: true,
                        // @ts-ignore
                        value: ReadableStream.from(init.body),
                    });
                }
            }`;

const old = `            if (init) {
                delete init.cache;
                // https://github.com/cloudflare/workerd/issues/2746
                // https://github.com/cloudflare/workerd/issues/3245
                Object.defineProperty(init, "body", {
                    // @ts-ignore
                    value: init.body instanceof stream.Readable ? ReadableStream.from(init.body) : init.body,
                });
            }`;

if (!fs.existsSync(target)) {
  console.error(`[patch-opennext-init] template not found: ${target}`);
  process.exit(1);
}

let source = fs.readFileSync(target, "utf8");

if (source.includes(patched)) {
  console.log("[patch-opennext-init] already patched, skipping.");
  process.exit(0);
}

if (!source.includes(old)) {
  console.error("[patch-opennext-init] template does not match expected content.");
  process.exit(1);
}

source = source.replace(old, patched);
fs.writeFileSync(target, source);
console.log("[patch-opennext-init] patched CustomRequest body handling.");