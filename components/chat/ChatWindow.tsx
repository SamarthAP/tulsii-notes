import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Animated,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  pastelGreen300,
  pastelGreen400,
  pastelGreen500,
  pastelGreen700,
} from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Crypto from "expo-crypto";

// const useKeyboardHeight = () => {
//   const [keyboardHeight, setKeyboardHeight] = useState(0);

//   useEffect(() => {
//     const showListener = Keyboard.addListener(
//       Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow",
//       (e) => setKeyboardHeight(e.endCoordinates.height)
//     );
//     const hideListener = Keyboard.addListener(
//       Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide",
//       () => setKeyboardHeight(0)
//     );
//     return () => {
//       showListener.remove();
//       hideListener.remove();
//     };
//   }, []);

//   return keyboardHeight;
// };

interface AnimatedValues {
  [key: string]: Animated.Value;
}

interface ChatViewProps {
  additionalKeyboardOffset?: number;
}

const ChatView = ({ additionalKeyboardOffset = 0 }: ChatViewProps) => {
  const [messages, setMessages] = useState<
    { id: string; text: string; sender: string }[]
  >([]);
  const theme = useColorScheme() ?? "light";
  const [inputText, setInputText] = useState("");
  const animatedValues = useRef<AnimatedValues>({});
  const flatListRef = useRef<FlatList<any>>(null);
  const inputRef = useRef<TextInput>(null);
  // const keyboardHeight = useKeyboardHeight();
  const backgroundColor = useThemeColor({}, "background");
  const cardBackground = useThemeColor({}, "cardBackground");
  const textColor = useThemeColor({}, "text");
  const bubbleBackgroundColor =
    theme === "light" ? pastelGreen500 : pastelGreen500;
  const insets = useSafeAreaInsets();

  // useEffect(() => {
  //   const keyboardDidShowListener = Keyboard.addListener(
  //     "keyboardDidShow",
  //     handleKeyboardShow
  //   );
  //   return () => {
  //     keyboardDidShowListener.remove();
  //   };
  // }, []);

  // const handleKeyboardShow = () => {
  //   if (flatListRef.current && messages.length > 0) {
  //     flatListRef.current.scrollToEnd({ animated: true });
  //   }
  // };

  const sendMessage = () => {
    if (inputText.trim() === "") return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText + " " + Crypto.randomUUID(),
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText("");

    animatedValues.current[newMessage.id] = new Animated.Value(0);

    Animated.spring(animatedValues.current[newMessage.id], {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Scroll to the bottom after sending a message
    flatListRef.current?.scrollToEnd({ animated: true });

    // Keep focus on the input field
    inputRef.current?.focus();
  };

  const renderMessage = ({
    item,
  }: {
    item: { id: string; text: string; sender: string };
  }) => {
    const animatedStyle = {
      transform: [
        {
          translateY:
            animatedValues.current[item.id]?.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }) || 0,
        },
      ],
      opacity: animatedValues.current[item.id] || 1,
    };

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          animatedStyle,
          {
            backgroundColor: bubbleBackgroundColor,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: textColor,
            },
          ]}
        >
          {item.text}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={insets.top + additionalKeyboardOffset}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          // onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { backgroundColor: cardBackground, color: textColor },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendButton,
              {
                backgroundColor: bubbleBackgroundColor,
              },
            ]}
          >
            <Text
              style={[
                styles.sendButtonText,
                {
                  color: textColor,
                },
              ]}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    // backgroundColor: "#007AFF",
    // backgroundColor: pastelGreen300,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  messageText: {
    // color: "#FFFFFF",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#FFFFFF",
    // borderWidth: 1,
    // borderColor: "#E0E0E0",
    padding: 8,
  },
  input: {
    flex: 1,
    // backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    // backgroundColor: "#007AFF",
    // backgroundColor: pastelGreen700,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChatView;
