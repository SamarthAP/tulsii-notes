import { SyncDatabaseChangeSet, synchronize } from "@nozbe/watermelondb/sync";
import { database, Message } from "@/lib/watermelon";
import { supabase } from "@/lib/supabase";
import { lg } from "@/utils/noProd";
import { Q } from "@nozbe/watermelondb";
import * as FileSystem from "expo-file-system";

export async function sync({ userId }: { userId: string }) {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      lg(`🍉 Pulling with lastPulledAt = ${lastPulledAt}`);
      const { data, error } = await supabase.rpc("pull", {
        last_pulled_at: lastPulledAt ?? 0,
      });

      if (error) {
        throw new Error("🍉".concat(error.message));
      }

      // Uncomment this for debugging purposes
      // lg(JSON.stringify(data, null, 2));

      const { changes, timestamp } = data as {
        changes: SyncDatabaseChangeSet;
        timestamp: number;
      };

      lg(`🍉 Changes pulled successfully. Timestamp: ${timestamp}`);

      return { changes, timestamp };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      lg(`🍉 Pushing with lastPulledAt = ${lastPulledAt}`);
      lg(`🍉 Changes: ${JSON.stringify(changes, null, 2)}`);

      // Uncomment this for debugging purposes
      // lg('changes', JSON.stringify(changes, null, 2));

      const { error } = await supabase.rpc("push", { changes });

      if (error) {
        throw new Error("🍉".concat(error.message));
      }

      lg(`🍉 Changes pushed successfully.`);

      // After pushing changes to Supabase, check for local files that need to be uploaded
      const messages = await database
        .get<Message>("messages")
        .query(Q.where("file_url", Q.notLike("https://%")))
        .fetch();

      for (const message of messages) {
        if (message.fileUrl && message.fileUrl.startsWith("file://")) {
          const fileName = message.fileName || message.fileUrl.split("/").pop();
          const uploadPath = `${userId}/${fileName}`;

          const { data, error } = await supabase.storage
            .from("chat-files")
            .upload(
              uploadPath,
              await FileSystem.readAsStringAsync(message.fileUrl, {
                encoding: FileSystem.EncodingType.Base64,
              }),
              {
                contentType: message.fileMimetype,
              }
            );

          if (error) {
            lg("sync.ts: Error uploading file:", error);
            continue;
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("chat-files").getPublicUrl(uploadPath);

          await database.write(async () => {
            await message.update((m) => {
              m.fileUrl = publicUrl;
            });
          });
        }
      }
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
    lg("🍉 Synchronization completed successfully");
  } catch (error) {
    lg("🍉 Synchronization error:", error);
    // Here you could implement retry logic, user notification, etc.
  }
}

// Optional: Function to schedule periodic syncs
export function schedulePeriodicSync(intervalMinutes: number) {
  setInterval(syncAndHandleErrors, intervalMinutes * 60 * 1000);
}
