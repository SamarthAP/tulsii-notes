import { Pressable, SafeAreaView, StyleSheet, View } from "react-native";
import ChatView from "@/components/chat/ChatWindow";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import Icon from "@expo/vector-icons/Feather";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Q } from "@nozbe/watermelondb";
import { database, Note, NoteType } from "@/lib/watermelon";
import { useSession } from "@/contexts/SessionContext";
import { syncAndHandleErrors } from "@/lib/sync";

export async function fetchDailyNote(
  userId: string,
  date: Dayjs
): Promise<Note | null> {
  const todayStart = date.startOf("day").toDate().getTime();
  const todayEnd = date.endOf("day").toDate().getTime();

  const note = await database
    .get<Note>("notes")
    .query(
      Q.where("user_id", userId),
      Q.where("date", Q.between(todayStart, todayEnd)),
      Q.where("note_type", NoteType.Daily)
    )
    .fetch();

  return note.length > 0 ? note[0] : null;
}

export default function HomeScreen() {
  const { session } = useSession();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  // set current date as the default date
  const [date, setDate] = useState(dayjs());
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    const loadNote = async () => {
      const note = await fetchDailyNote(session?.user.id || "", date);

      if (note) {
        setNote(note);
      } else {
        // create a new note for the current date if it doesnt exist
        const createdAt = dayjs().toDate();
        await database.write(async () => {
          const newNote = await database.get<Note>("notes").create((note) => {
            note.userId = session?.user.id || "";
            note.date = date.toDate();
            note.noteType = NoteType.Daily;
            note.title = date.format("MMMM D, YYYY");
            note.createdAt = createdAt;
            note.updatedAt = createdAt;
          });

          setNote(newNote);
        });
      }
    };
    loadNote();
  }, [session?.user.id, date]);

  useEffect(() => {
    syncAndHandleErrors({ userId: session?.user.id || "" });
  }, [session?.user.id]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor,
      }}
    >
      <View style={styles.dateHeader}>
        {/*left arrow to change date*/}
        <Pressable
          onPress={() => {
            setDate(date.subtract(1, "day"));
          }}
        >
          <Icon name="chevron-left" size={24} style={{ color: textColor }} />
        </Pressable>

        {/*current date*/}
        <ThemedText>{date.format("MMMM D, YYYY")}</ThemedText>
        {/*right arrow to change date*/}
        <Pressable
          onPress={() => {
            // only allow current or past dates
            if (dayjs().isAfter(date, "day")) {
              setDate(date.add(1, "day"));
            }
          }}
        >
          <Icon name="chevron-right" size={24} style={{ color: textColor }} />
        </Pressable>
      </View>
      <ChatView noteId={note?.id || ""} additionalKeyboardOffset={48} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dateHeader: {
    height: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: "#E0E0E0",
  },
});
