import { getStorageUsage, getDatabaseUsage } from "@/lib/server/Storage";
import { UsageCard } from "@/components/Usage/UsageCard";
import { ExportDatabase } from "@/components/Usage/ExportDatabase";
import { ClearStorage } from "@/components/Usage/ClearStorage";
import { Database, HardDrive } from "lucide-react";

const UsagePage = async () => {
  const dbUsage = await getDatabaseUsage();
  const storageUsage = await getStorageUsage();

  const {
    total_size_bytes: storage_total_size_bytes,
    total_size_readable: storage_total_size_readable,
  } = storageUsage;

  const { total_size_bytes, total_size_readable } = dbUsage;

  // Calculate percentages (assuming some limits)
  const dbLimit = 500 * 1024 * 1024; // 500MB limit
  const storageLimit = 1024 * 1024 * 1024; // 1GB limit

  const dbPercentage = (total_size_bytes / dbLimit) * 100;
  const storagePercentage =
    ((storage_total_size_bytes || 0) / storageLimit) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">Usage Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your database and storage usage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UsageCard
          title="Database Usage"
          currentUsage={total_size_readable}
          totalUsage="500 MB"
          percentage={Math.min(dbPercentage, 100)}
          icon={<Database className="h-4 w-4" />}
        >
          <ExportDatabase />
        </UsageCard>

        <UsageCard
          title="Storage Usage"
          currentUsage={storage_total_size_readable || "0 B"}
          totalUsage="1 GB"
          percentage={Math.min(storagePercentage, 100)}
          icon={<HardDrive className="h-4 w-4" />}
        >
          <ClearStorage />
        </UsageCard>
      </div>
    </div>
  );
};

export default UsagePage;
