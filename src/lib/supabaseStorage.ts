import { supabase } from "./supabase";

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
