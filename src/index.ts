import { serve } from "@hono/node-server";
import { Hono } from "hono";
import os from "os";
import { exportRoute } from "./routes/export";
import { importRoute } from "./routes/import";

const app = new Hono();

app.get("/", (c) => {
  const random = Math.random() * 100;
  return c.text("Backup api working! " + random);
});

app.get("/os", async (c) => {
  return c.json({
    platform: os.platform(),
    type: os.type(),
    release: os.release(),
    machine: os.machine(),
    cpus: os.cpus(),
    totalmem: os.totalmem(),
    freemem: os.freemem(),
    networkInterfaces: os.networkInterfaces(),
    version: os.version(),
  });
});

app.route("api/backup/export", exportRoute);
app.route("api/backup/import", importRoute);

const port = 5000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
