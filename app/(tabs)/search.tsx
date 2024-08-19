import { SafeAreaView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function Search() {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor,
      }}
    >
      <ThemedText type="title">Search</ThemedText>
    </SafeAreaView>
  );
}
