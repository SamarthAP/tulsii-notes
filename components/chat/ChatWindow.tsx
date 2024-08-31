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
import { database, Message } from "@/lib/watermelon";
import { useSession } from "@/contexts/SessionContext";
import dayjs from "dayjs";
import { Q } from "@nozbe/watermelondb";

const writeNewMessage = async (
  userId: string,
  noteId: string,
  content: string
) => {
  const createdAt = dayjs().toDate();
  return await database.write(async () => {
    const newMessage = await database
      .get<Message>("messages")
      .create((message) => {
        message.userId = userId;
        message.noteId = noteId;
        message.content = content;
        message.createdAt = createdAt;
        message.updatedAt = createdAt;
      });
    return newMessage;
  });
};

interface AnimatedValues {
  [key: string]: Animated.Value;
}

interface ChatViewProps {
  noteId: string;
  additionalKeyboardOffset?: number;
}

const ChatView = ({ noteId, additionalKeyboardOffset = 0 }: ChatViewProps) => {
  const { session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const theme = useColorScheme() ?? "light";
  const [inputText, setInputText] = useState("");
  const animatedValues = useRef<AnimatedValues>({});
  const flatListRef = useRef<FlatList<any>>(null);
  const inputRef = useRef<TextInput>(null);
  const cardBackground = useThemeColor({}, "cardBackground");
  const textColor = useThemeColor({}, "text");
  const bubbleBackgroundColor =
    theme === "light" ? pastelGreen500 : pastelGreen500;
  const insets = useSafeAreaInsets();

  // load messages for the note
  useEffect(() => {
    const loadMessages = async () => {
      const messages = await database
        .get<Message>("messages")
        .query(Q.where("note_id", noteId))
        .fetch();
      console.log("loaded messages", messages);
      setMessages(messages);

      // Initialize animation values for existing messages
      messages.forEach((message) => {
        if (!animatedValues.current[message.id]) {
          animatedValues.current[message.id] = new Animated.Value(1);
        }
      });
    };
    loadMessages();
  }, [noteId]);

  const sendMessage = async () => {
    if (inputText.trim() === "" || !noteId) return;

    const newMessage = await writeNewMessage(
      session?.user.id || "",
      noteId,
      inputText
    );

    animatedValues.current[newMessage.id] = new Animated.Value(0);

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText("");

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

  const renderMessage = ({ item }: { item: Message }) => {
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
          {item.content}
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
