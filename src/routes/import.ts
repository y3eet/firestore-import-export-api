import { Hono } from "hono";
import { promisify } from "util";
import { adminStorage } from "../../firebase/firebseServer";
const { exec } = require("child_process");
const execAsync = promisify(exec);
import { updateBackupStatus } from "../backup/functions";
import { BACKUP_SECRET_KEY } from "../../secretKey";

export const importRoute = new Hono().post("/", async (c) => {
  const authHeader = c.req.header("Authorization");
  const body = await c.req.json();
  if (!authHeader || authHeader !== BACKUP_SECRET_KEY) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const fileName = body.fileName;
  try {
    if (!fileName) throw new Error("fileName is required");
    await adminStorage
      .bucket()
      .file("backups/" + fileName)
      .download({
        destination: "backup.json",
      });
  } catch (e) {
    return c.json({ message: String(e) }, 500);
  }
  updateBackupStatus(
    "Importing",
    `Importing Firestore Data: ${fileName}`,
    true
  );
  importFirestore().then(() => {
    updateBackupStatus(
      "Imported",
      `Imported Firestore Data: ${fileName}`,
      false
    ).catch((e) => {
      console.log("Error updating backup status", e);
      updateBackupStatus(
        "Error",
        `Error Importing Firestore Data: ${fileName}`,
        false
      );
    });
  });

  return c.json({ message: "Importing Data to firestore" });
});

async function importFirestore() {
  const command =
    "npx -p node-firestore-import-export firestore-import -a serviceAccountKey.json -b backup.json -y";
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.log(`Error output: ${stderr}`);
      return;
    }
    console.log(`Command output: ${stdout}`);
    console.log("Done Importing Firestore! Data");
  } catch (error) {
    console.log(`Error executing command: ${String(error)}`);
  }
}
