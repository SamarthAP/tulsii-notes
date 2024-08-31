import ChatView from "@/components/chat/ChatWindow";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native";

export default function NotePage() {
  const { note_id } = useLocalSearchParams<{ note_id: string }>();
  console.log("note_id", note_id);
  const backgroundColor = useThemeColor({}, "background");
  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
        },
        { backgroundColor },
      ]}
    >
      <ChatView noteId={note_id} />
    </SafeAreaView>
  );
}
