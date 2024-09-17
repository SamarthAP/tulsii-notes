import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { database, Note, NoteType } from "@/lib/watermelon";
import { Q } from "@nozbe/watermelondb";
import { useSession } from "@/contexts/SessionContext";
import { pastelGreen500 } from "@/constants/Colors";
import Icon from "@expo/vector-icons/Feather";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { useNotes } from "@/hooks/useNotes";
import { useLatestMessage } from "@/hooks/useLatestMessage";

export async function fetchAllNotes(userId: string): Promise<Note[]> {
  const notes = await database
    .get<Note>("notes")
    .query(Q.where("user_id", userId), Q.sortBy("date", Q.desc))
    .fetch();
  return notes;
}

const NoteItem = ({ item }: { item: Note }) => {
  const { latestMessage } = useLatestMessage({ noteId: item.id });
  const textMuted = useThemeColor({}, "textMuted");
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.noteItem]}
      onPress={() => {
        router.push(`/all-notes/${item.id}`);
      }}
    >
      <View style={styles.noteHeader}>
        <ThemedText style={styles.noteTitle}>{item.title}</ThemedText>
        <ThemedText style={[styles.noteDate, { color: textMuted }]}>
          {dayjs(latestMessage?.createdAt || item.createdAt).isSame(
            dayjs(),
            "day"
          )
            ? dayjs(latestMessage?.createdAt || item.createdAt).format("h:mm A")
            : dayjs().diff(
                dayjs(latestMessage?.createdAt || item.createdAt),
                "day"
              ) < 7
            ? dayjs(latestMessage?.createdAt || item.createdAt).format("ddd")
            : dayjs(latestMessage?.createdAt || item.createdAt).format("MM-DD")}
        </ThemedText>
      </View>

      <ThemedText style={[styles.noteDate, { color: textMuted }]}>
        {latestMessage?.content}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default function AllNotes() {
  const { session } = useSession();
  const { notes } = useNotes({ userId: session?.user.id || "" });

  const [creatingNote, setCreatingNote] = useState(false);
  const backgroundColor = useThemeColor({}, "background");
  const router = useRouter();

  const handleCreateNote = async () => {
    setCreatingNote(true);
    const createdAt = dayjs().toDate();
    const note = await database.write(async () => {
      const newNote = await database.get<Note>("notes").create((note) => {
        note.userId = session?.user.id || "";
        note.date = createdAt;
        note.noteType = NoteType.Regular;
        note.title = "New Note";
        note.createdAt = createdAt;
        note.updatedAt = createdAt;
      });

      return newNote;
    });
    setCreatingNote(false);
    router.push(`/all-notes/${note.id}`);
  };

  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
        },
        { backgroundColor },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.heading}>
          <ThemedText
            style={{
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            All Notes
          </ThemedText>
          <View>
            <TouchableOpacity
              onPress={handleCreateNote}
              disabled={creatingNote}
            >
              <Icon name="edit" size={20} color={pastelGreen500} />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={notes}
          renderItem={({ item }) => <NoteItem item={item} />}
          keyExtractor={(item) => item.id}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  heading: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  noteItem: {
    flex: 1,
    flexDirection: "column",
    gap: 4,
    padding: 12,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noteDate: {
    fontSize: 14,
  },
});
