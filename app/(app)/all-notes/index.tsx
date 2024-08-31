import React, { useEffect, useState } from "react";
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
import { pastelGreen500, pastelGreen700 } from "@/constants/Colors";
import Icon from "@expo/vector-icons/Feather";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { useNotes } from "@/hooks/useNotes";

export async function fetchAllNotes(userId: string): Promise<Note[]> {
  const notes = await database
    .get<Note>("notes")
    .query(Q.where("user_id", userId), Q.sortBy("date", Q.desc))
    .fetch();
  return notes;
}

export default function AllNotes() {
  const { session } = useSession();
  // const [notes, setNotes] = useState<Note[]>([]);
  const { notes } = useNotes({ userId: session?.user.id || "" });
  const [creatingNote, setCreatingNote] = useState(false);
  const backgroundColor = useThemeColor({}, "background");
  const cardBackground = useThemeColor({}, "cardBackground");
  const textMuted = useThemeColor({}, "textMuted");
  const borderColor = useThemeColor({}, "border");
  const router = useRouter();

  // useEffect(() => {
  //   const loadNotes = async () => {
  //     if (session?.user.id) {
  //       const fetchedNotes = await fetchAllNotes(session.user.id);
  //       setNotes(fetchedNotes);
  //     }
  //   };
  //   loadNotes();
  // }, [session?.user.id]);

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[
        styles.noteItem,
        { backgroundColor: cardBackground, borderColor },
      ]}
      onPress={() => {
        router.push(`/all-notes/${item.id}`);
      }}
    >
      <View style={styles.noteHeader}>
        <ThemedText style={styles.noteTitle}>{item.title}</ThemedText>
        <Icon
          name={item.noteType === NoteType.Daily ? "calendar" : "file-text"}
          size={18}
          color={pastelGreen500}
        />
      </View>
      <ThemedText style={[styles.noteDate, { color: textMuted }]}>
        {dayjs(item.date).format("MMMM D, YYYY")}
      </ThemedText>
    </TouchableOpacity>
  );

  const handleCreateNote = async () => {
    // Navigate to a new page for creating a note
    // router.push("/create-note");
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
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: pastelGreen500 }]}
        onPress={handleCreateNote}
      >
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Add some bottom padding to avoid overlap with the create button
  },
  noteItem: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noteDate: {
    fontSize: 14,
  },
  createButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
