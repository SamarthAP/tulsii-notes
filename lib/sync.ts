import { SyncDatabaseChangeSet, synchronize } from "@nozbe/watermelondb/sync";
import { database } from "@/lib/watermelon";
import { supabase } from "@/lib/supabase";

export async function sync({ userId }: { userId: string }) {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      console.log(`🍉 Pulling with lastPulledAt = ${lastPulledAt}`);
      const { data, error } = await supabase.rpc("pull", {
        last_pulled_at: lastPulledAt ?? 0,
        p_user_id: userId,
      });

      if (error) {
        throw new Error("🍉".concat(error.message));
      }

      // Uncomment this for debugging purposes
      // console.log(JSON.stringify(data, null, 2));

      const { changes, timestamp } = data as {
        changes: SyncDatabaseChangeSet;
        timestamp: number;
      };

      console.log(`🍉 Changes pulled successfully. Timestamp: ${timestamp}`);

      return { changes, timestamp };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      console.log(`🍉 Pushing with lastPulledAt = ${lastPulledAt}`);
      console.log(`🍉 Changes: ${JSON.stringify(changes, null, 2)}`);

      // Uncomment this for debugging purposes
      // console.log('changes', JSON.stringify(changes, null, 2));

      const { error } = await supabase.rpc("push", { changes });

      if (error) {
        throw new Error("🍉".concat(error.message));
      }

      console.log(`🍉 Changes pushed successfully.`);
    },
    // With this setting we expect from server that new rows
    // will return in 'updated' key along with updates.
    // So WatermelonDB will treat them as accordingly.
    sendCreatedAsUpdated: true,
  });
}

// Helper function to initiate sync and handle errors
export async function syncAndHandleErrors({ userId }: { userId: string }) {
  try {
    await sync({ userId });
    console.log("🍉 Synchronization completed successfully");
  } catch (error) {
    console.error("🍉 Synchronization error:", error);
    // Here you could implement retry logic, user notification, etc.
  }
}

// Optional: Function to schedule periodic syncs
export function schedulePeriodicSync(intervalMinutes: number) {
  setInterval(syncAndHandleErrors, intervalMinutes * 60 * 1000);
}
