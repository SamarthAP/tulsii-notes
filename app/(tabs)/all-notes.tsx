import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function AllNotes() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedText style={{ padding: 16 }} type="title">
        Explore
      </ThemedText>
    </ThemedView>
  );
}
