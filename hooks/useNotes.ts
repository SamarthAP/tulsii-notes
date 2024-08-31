import { Note } from "@/lib/watermelon";
import { Q } from "@nozbe/watermelondb";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { useEffect, useState } from "react";

export function useNotes({ userId }: { userId: string }) {
  const database = useDatabase();
  const [notes, setNotes] = useState<Note[]>([]);
  const notesQuery = database.collections
    .get<Note>("notes")
    .query(Q.where("user_id", userId), Q.sortBy("updated_at", Q.desc));

  useEffect(() => {
    const subscription = notesQuery.observe().subscribe((data) => {
      setNotes(data);
    });

    return () => subscription.unsubscribe();
  }, [database, userId]);

  return { notes };
}
