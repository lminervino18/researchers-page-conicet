// src/api/firebaseFileManager.ts
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { app } from "./firebase";

const storage = getStorage(app);

export type ManagedFile = {
  url: string;          // Public download URL
  path: string;         // Internal storage path, e.g. "uploads/1699999999999_filename.pdf"
  name: string;         // File name with timestamp prefix
  contentType?: string; // MIME type
  size?: number;        // File size in bytes
};

/**
 * Uploads a file to Firebase Storage and returns metadata.
 * @param file File object selected by the user
 * @param basePath Optional folder in the storage (default: "uploads/")
 */
export const uploadFile = async (
  file: File,
  basePath: string = "uploads/"
): Promise<ManagedFile> => {
  if (!file) throw new Error("No file provided");

  const safeBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const fileName = `${Date.now()}_${file.name}`;
  const fullPath = `${safeBase}${fileName}`;

  const fileRef = ref(storage, fullPath);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  return {
    url,
    path: fullPath,
    name: fileName,
    contentType: file.type,
    size: file.size,
  };
};

/**
 * Deletes a file using its public download URL.
 * Works with the https download URL returned by getDownloadURL.
 * @param url Download URL
 */
export const deleteFileByUrl = async (url: string): Promise<void> => {
  if (!url) throw new Error("No URL provided");
  // In modern Firebase SDKs, ref(storage, url) accepts an https or gs:// URL
  const fileRef = ref(storage, url);
  await deleteObject(fileRef);
};

/**
 * Deletes a file using its internal storage path (e.g., "uploads/123_name.pdf").
 * @param fullPath Internal storage path
 */
export const deleteFileByPath = async (fullPath: string): Promise<void> => {
  if (!fullPath) throw new Error("No file path provided");
  const fileRef = ref(storage, fullPath);
  await deleteObject(fileRef);
};
