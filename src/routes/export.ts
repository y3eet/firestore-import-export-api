import { Hono } from "hono";
import { promisify } from "util";
const { exec } = require("child_process");
import { adminStorage } from "../../firebase/firebseServer";
import { Timestamp } from "firebase-admin/firestore";
import { format } from "date-fns";
const execAsync = promisify(exec);
import { updateBackupStatus } from "../backup/functions";
import { BACKUP_SECRET_KEY } from "../../secretKey";

export const exportRoute = new Hono().get("/", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || authHeader !== BACKUP_SECRET_KEY) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
  updateBackupStatus("Exporting", "Exporting Firestore Data...", true);
  exportFirestore()
    .then(() => {
      updateBackupStatus("Exported", "Firestore Data Exported!", false);
    })
    .catch((e) => {
      console.log("Error updating backup status", e);
      updateBackupStatus("Error", "Error Exporting Firestore Data!", false);
    });

  return c.json({ success: true, message: "Exporting Firestore Data..." });
});

async function exportFirestore() {
  const command =
    "npx -p node-firestore-import-export firestore-export -a serviceAccountKey.json -b backup.json";
  console.log("Exporting Firestore...");
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.log(`Error output: ${stderr}`);
      return;
    }
    console.log(`Command output: ${stdout}`);
    console.log("Done Exporting Firestore!");
    const timestamp = Timestamp.now();
    const formattedDate = format(timestamp.toDate(), "MM-dd-yyyy HH:mm:ss");
    const destinationPath = `backups/backup-${formattedDate}.json`;
    await uploadFileToFirebaseStorage("backup.json", destinationPath);
  } catch (error) {
    console.log(`Error executing command: ${String(error)}`);
  }
}

async function uploadFileToFirebaseStorage(
  localFilePath: string,
  destinationPath: string
) {
  const bucket = adminStorage.bucket();
  await bucket.upload(localFilePath, {
    destination: destinationPath,
  });

  console.log(`File uploaded to ${destinationPath}`);
}
