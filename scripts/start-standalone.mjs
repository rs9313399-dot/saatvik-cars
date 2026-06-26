import { createWriteStream } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const serverPath = resolve(".next/standalone/server.js");
const log = createWriteStream(resolve("server.log"), { flags: "a" });

const child = spawn(process.execPath, [serverPath], {
  env: {
    ...process.env,
    NODE_ENV: "production",
  },
  stdio: ["inherit", "pipe", "pipe"],
});

const forward = (stream, destination) => {
  stream.on("data", (chunk) => {
    destination.write(chunk);
    log.write(chunk);
  });
};

forward(child.stdout, process.stdout);
forward(child.stderr, process.stderr);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("exit", (code, signal) => {
  log.end();

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
