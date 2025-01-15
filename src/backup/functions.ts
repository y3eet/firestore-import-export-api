import { adminFirestore } from "../../firebase/firebseServer";

export async function updateBackupStatus(
  status: string,
  message: string,
  btnDisabled: boolean
) {
  let backupRef = adminFirestore.collection("backup").doc("backup");
  await backupRef.set({
    status,
    message,
    date: new Date(),
    btnDisabled,
  });
}
