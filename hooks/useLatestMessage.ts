import { Message } from "@/lib/watermelon";
import { Q } from "@nozbe/watermelondb";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { useEffect, useState } from "react";

export function useLatestMessage({ noteId }: { noteId: string }) {
  const database = useDatabase();
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);

  const messageQuery = database.collections
    .get<Message>("messages")
    .query(
      Q.where("note_id", noteId),
      Q.sortBy("created_at", Q.desc),
      Q.take(1)
    );

  useEffect(() => {
    const subscription = messageQuery.observe().subscribe((data) => {
      if (data.length > 0) {
        setLatestMessage(data[0]);
      } else {
        setLatestMessage(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [database, noteId]);

  return { latestMessage };
}
