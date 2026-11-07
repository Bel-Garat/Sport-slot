import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const publicPort = process.env.PORT ?? process.env.GATEWAY_PORT ?? "4000";

const internalServices = [
  { name: "auth-service", portKey: "AUTH_SERVICE_PORT", urlKey: "AUTH_SERVICE_URL", port: 4001 },
  { name: "venue-service", portKey: "VENUE_SERVICE_PORT", urlKey: "VENUE_SERVICE_URL", port: 4002 },
  { name: "reservation-service", portKey: "RESERVATION_SERVICE_PORT", urlKey: "RESERVATION_SERVICE_URL", port: 4003 },
  { name: "review-service", portKey: "REVIEW_SERVICE_PORT", urlKey: "REVIEW_SERVICE_URL", port: 4004 },
  { name: "audit-service", portKey: "AUDIT_SERVICE_PORT", urlKey: "AUDIT_SERVICE_URL", port: 4005 },
];

const env = { ...process.env, GATEWAY_PORT: publicPort };
for (const service of internalServices) {
  env[service.portKey] = String(service.port);
  env[service.urlKey] = `http://127.0.0.1:${service.port}`;
}

const processes = [
  ...internalServices.map((service) => ({
    name: service.name,
    script: `services/${service.name}/src/server.js`,
  })),
  { name: "gateway", script: "gateway/src/server.js" },
];

const children = [];
let stopping = false;
let finalExitCode = 0;

function stopAll(exitCode) {
  if (stopping) return;
  stopping = true;
  finalExitCode = exitCode;
  for (const child of children) {
    if (child.exitCode === null) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(finalExitCode), 5000).unref();
}

for (const { name, script } of processes) {
  const child = spawn(process.execPath, [script], { cwd: root, env, stdio: "inherit" });
  children.push(child);
  child.on("exit", (code, signal) => {
    if (!stopping) {
      console.error(`${name} exited (${signal ?? code}), stopping the backend`);
      stopAll(1);
    } else if (children.every((other) => other.exitCode !== null || other.signalCode !== null)) {
      process.exit(finalExitCode);
    }
  });
}

process.once("SIGTERM", () => stopAll(0));
process.once("SIGINT", () => stopAll(0));
