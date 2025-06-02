import { supabase } from "./supabase";
import JSZip from "jszip";

const getAllFiles = async (path = ""): Promise<number> => {
  try {
    const { data: items, error } = await supabase.storage
      .from("falsisters-bucket")
      .list(path);

    if (error) {
      throw new Error(`Error fetching files from ${path}: ${error.message}`);
    }

    if (!items) return 0;

    let totalSize = 0;

    for (const item of items) {
      if (item.metadata?.mimetype) {
        // It's a file
        totalSize += item.metadata?.size || 0;
      } else {
        // It's a folder, recursively get files from it
        const subPath = path ? `${path}/${item.name}` : item.name;
        totalSize += await getAllFiles(subPath);
      }
    }

    return totalSize;
  } catch (error) {
    console.error(`Error processing path ${path}:`, error);
    return 0;
  }
};

export const getStorageUsage = async () => {
  try {
    const totalSize = await getAllFiles();

    const totalSizeReadable = totalSize
      ? `${(totalSize / (1024 * 1024)).toFixed(2)} MB`
      : "0 MB";

    return {
      total_size_bytes: totalSize,
      total_size_readable: totalSizeReadable,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching storage usage:", message);
    return { error: message };
  }
};

const downloadAllFiles = async (zip: JSZip, path = ""): Promise<void> => {
  try {
    const { data: items, error } = await supabase.storage
      .from("falsisters-bucket")
      .list(path);

    if (error) {
      throw new Error(`Error fetching files from ${path}: ${error.message}`);
    }

    if (!items) return;

    for (const item of items) {
      if (item.metadata?.mimetype) {
        // It's a file - download and add to zip
        const filePath = path ? `${path}/${item.name}` : item.name;
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("falsisters-bucket")
          .download(filePath);

        if (downloadError) {
          console.error(`Error downloading file ${filePath}:`, downloadError);
          continue;
        }

        if (fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          zip.file(filePath, arrayBuffer);
        }
      } else {
        // It's a folder, recursively download files from it
        const subPath = path ? `${path}/${item.name}` : item.name;
        await downloadAllFiles(zip, subPath);
      }
    }
  } catch (error) {
    console.error(`Error processing path ${path}:`, error);
  }
};

export const exportStorage = async (): Promise<Blob | { error: string }> => {
  try {
    const zip = new JSZip();

    // Download all files and add them to the zip
    await downloadAllFiles(zip, "");

    // Generate the zip file
    const zipBlob = await zip.generateAsync({ type: "blob" });

    return zipBlob;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error exporting storage:", message);
    return { error: message };
  }
};

const deleteAllFiles = async (path = ""): Promise<void> => {
  try {
    const { data: items, error } = await supabase.storage
      .from("falsisters-bucket")
      .list(path);

    if (error) {
      throw new Error(`Error fetching files from ${path}: ${error.message}`);
    }

    if (!items) return;

    // First, delete all files in the current directory
    const files = items.filter((item) => item.metadata?.mimetype);
    if (files.length > 0) {
      const filePaths = files.map((file) =>
        path ? `${path}/${file.name}` : file.name
      );

      const { error: deleteError } = await supabase.storage
        .from("falsisters-bucket")
        .remove(filePaths);

      if (deleteError) {
        console.error(`Error deleting files from ${path}:`, deleteError);
      }
    }

    // Then, recursively delete files from subdirectories
    const folders = items.filter((item) => !item.metadata?.mimetype);
    for (const folder of folders) {
      const subPath = path ? `${path}/${folder.name}` : folder.name;
      await deleteAllFiles(subPath);
    }
  } catch (error) {
    console.error(`Error processing path ${path}:`, error);
  }
};

export const clearStorage = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    await deleteAllFiles("");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error clearing storage:", message);
    return { success: false, error: message };
  }
};
