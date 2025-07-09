// src/api/firebaseUploader.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

const storage = getStorage(app);

/**
 * Uploads a file (image or PDF) to Firebase Storage and returns the public URL.
 * @param file File object selected by the user
 * @param path Optional path in the storage (default: 'uploads/')
 * @returns string URL of the uploaded file
 */
export const uploadFile = async (
  file: File,
  path: string = "uploads/"
): Promise<string> => {
  if (!file) throw new Error("No file provided");

  const fileRef = ref(storage, `${path}${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return url;
};
