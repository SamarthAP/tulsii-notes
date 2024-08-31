import ChatView from "@/components/chat/ChatWindow";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, TouchableOpacity, View, StyleSheet } from "react-native";
import Icon from "@expo/vector-icons/Feather";
import { useSession } from "@/contexts/SessionContext";
import { useNote } from "@/hooks/useNote";

export default function NotePage() {
  const { note_id } = useLocalSearchParams<{ note_id: string }>();
  const { session } = useSession();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const router = useRouter();
  const { note } = useNote({ userId: session?.user.id || "", noteId: note_id });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.dismiss(1)}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <ThemedText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.title}
          >
            {note?.title || "Untitled Note"}
          </ThemedText>
        </View>
      </View>
      <ChatView noteId={note_id} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
