import { Message } from "@/lib/watermelon";
import { Q } from "@nozbe/watermelondb";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { useEffect, useState } from "react";

export function useMessages({
  userId,
  noteId,
}: {
  userId: string;
  noteId: string;
}) {
  const database = useDatabase();
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesQuery = database.collections
    .get<Message>("messages")
    .query(Q.where("user_id", userId), Q.where("note_id", noteId));

  useEffect(() => {
    const subscription = messagesQuery.observe().subscribe((data) => {
      setMessages(data);
    });

    return () => subscription.unsubscribe();
  }, [database, userId, noteId]);

  return { messages };
}
