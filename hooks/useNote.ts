import { Note } from "@/lib/watermelon";
import { Q } from "@nozbe/watermelondb";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { useEffect, useState } from "react";

export function useNote({
  userId,
  noteId,
}: {
  userId: string;
  noteId: string;
}) {
  const database = useDatabase();
  const [note, setNote] = useState<Note | null>(null);

  const noteQuery = database.collections
    .get<Note>("notes")
    .query(Q.where("user_id", userId), Q.where("id", noteId));

  useEffect(() => {
    const subscription = noteQuery.observe().subscribe((data) => {
      if (data.length > 0) {
        setNote(data[0]);
      } else {
        setNote(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [database, userId, noteId]);

  return { note };
}
