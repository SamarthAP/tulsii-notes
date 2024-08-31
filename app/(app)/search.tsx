import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  FlatList,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { database, Note, Message } from "@/lib/watermelon";
import { fuzzySearch } from "@/utils/fuzzySearch";
import { useRouter } from "expo-router";
import Icon from "@expo/vector-icons/Feather";
import { pastelGreen500 } from "@/constants/Colors";
import dayjs from "dayjs";

export default function Search() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const cardBackground = useThemeColor({}, "cardBackground");
  const textMuted = useThemeColor({}, "textMuted");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(Note | Message)[]>([]);
  const router = useRouter();

  useEffect(() => {
    const searchData = async () => {
      if (query.length < 1) {
        setResults([]);
        return;
      }

      const notes = await database.get<Note>("notes").query().fetch();
      const messages = await database.get<Message>("messages").query().fetch();

      const allItems = [...notes, ...messages];
      const searchResults = fuzzySearch(allItems, ["title", "content"], query);
      setResults(searchResults);
    };

    searchData();
  }, [query]);

  const renderItem = ({ item }: { item: Note | Message }) => {
    if (item.table === "notes") {
      const note = item as Note;
      return (
        <TouchableOpacity
          style={[
            styles.noteItem,
            { backgroundColor: cardBackground, borderColor },
          ]}
          onPress={() => router.push(`/all-notes/${note.id}`)}
        >
          <View style={styles.noteHeader}>
            <ThemedText style={styles.noteTitle}>{note.title}</ThemedText>
            <Icon
              name={note.noteType === "daily" ? "calendar" : "file-text"}
              size={18}
              color={pastelGreen500}
            />
          </View>
          <ThemedText style={[styles.noteDate, { color: textMuted }]}>
            {dayjs(note.date).format("MMMM D, YYYY")}
          </ThemedText>
        </TouchableOpacity>
      );
    } else {
      const message = item as Message;
      return (
        <View
          style={[styles.messageContainer, { backgroundColor: pastelGreen500 }]}
        >
          <ThemedText style={styles.messageText}>{message.content}</ThemedText>
          <ThemedText style={[styles.messageDate, { color: textColor }]}>
            {dayjs(message.updatedAt).format("MMMM D, YYYY h:mm A")}
          </ThemedText>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.searchInputContainer}>
        <TextInput
          style={[
            styles.input,
            { color: textColor, backgroundColor: cardBackground },
          ]}
          placeholder="Search notes and messages..."
          placeholderTextColor={textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.table}-${item.id}`}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInputContainer: {
    padding: 16,
  },
  input: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
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
  messageContainer: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 16,
  },
  messageDate: {
    fontSize: 12,
    marginTop: 4,
  },
});
