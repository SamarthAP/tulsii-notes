import { Note, Message } from "@/lib/watermelon";
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

export function useNotesWithMostRecentMessage({ userId }: { userId: string }) {
  const database = useDatabase();
  const [notesWithMessages, setNotesWithMessages] = useState<
    Array<{ note: Note; recentMessage: Message | null }>
  >([]);

  useEffect(() => {
    const fetchNotesWithMessages = async () => {
      const notesCollection = database.get<Note>("notes");
      const messagesCollection = database.get<Message>("messages");

      const notes = await notesCollection
        .query(Q.where("user_id", userId), Q.sortBy("updated_at", Q.desc))
        .fetch();

      const notesWithMessagesPromises = notes.map(async (note) => {
        const recentMessage = await messagesCollection
          .query(
            Q.where("note_id", note.id),
            Q.sortBy("created_at", Q.desc),
            Q.take(1)
          )
          .fetch();

        return {
          note,
          recentMessage: recentMessage[0] || null,
        };
      });

      const result = await Promise.all(notesWithMessagesPromises);
      setNotesWithMessages(result);
    };

    fetchNotesWithMessages();

    const subscription = database
      .get<Note>("notes")
      .query(Q.where("user_id", userId))
      .observe()
      .subscribe(() => {
        fetchNotesWithMessages();
      });

    const messagesSubscription = database
      .get<Message>("messages")
      .query(Q.where("user_id", userId))
      .observe()
      .subscribe(() => {
        fetchNotesWithMessages();
      });

    return () => {
      subscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, [database, userId]);

  return { notesWithMessages };
}
