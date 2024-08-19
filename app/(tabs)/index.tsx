import { Pressable, SafeAreaView, StyleSheet, View } from "react-native";
import ChatView from "@/components/chat/ChatWindow";
import { useState } from "react";
import dayjs from "dayjs";
import Icon from "@expo/vector-icons/Feather";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  // set current date as the default date
  const [date, setDate] = useState(dayjs());

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
            console.log("left pressed");
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
            console.log("right pressed");
            // only allow current or past dates
            if (dayjs().isAfter(date, "day")) {
              setDate(date.add(1, "day"));
            }
          }}
        >
          <Icon name="chevron-right" size={24} style={{ color: textColor }} />
        </Pressable>
      </View>
      <ChatView additionalKeyboardOffset={48} />
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
