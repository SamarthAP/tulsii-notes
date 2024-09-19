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
  Image,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { pastelGreen500 } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { database, Message } from "@/lib/watermelon";
import { useSession } from "@/contexts/SessionContext";
import dayjs from "dayjs";
import { useMessages } from "@/hooks/useMessages";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
// import NetInfo from "@react-native-community/netinfo";
import { supabase } from "@/lib/supabase";
import Icon from "@expo/vector-icons/Feather";
import { ResizeMode, Video } from "expo-av";
import { lg } from "@/utils/noProd";
import { Session } from "@supabase/supabase-js";
import { useSync } from "@/contexts/SyncProviderContext";

interface WriteNewMessageParams {
  userId: string;
  noteId: string;
  content: string;
  fileUrl?: string | null;
  fileExt?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  fileMimetype?: string | null;
}

const writeNewMessage = async ({
  userId,
  noteId,
  content,
  fileUrl = null,
  fileExt = null,
  fileName = null,
  fileSize = null,
  fileMimetype = null,
}: WriteNewMessageParams) => {
  const createdAt = dayjs().toDate();
  return await database.write(async () => {
    const newMessage = await database
      .get<Message>("messages")
      .create((message) => {
        message.userId = userId;
        message.noteId = noteId;
        message.content = content;
        message.fileUrl = fileUrl || undefined;
        message.fileExt = fileExt || undefined;
        message.fileName = fileName || undefined;
        message.fileSize = fileSize || undefined;
        message.fileMimetype = fileMimetype || undefined;
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

interface SelectedFile {
  uri: string;
  fileName: string;
  ext: string;
  size: number;
  mimetype: string;
}

const ChatView = ({ noteId, additionalKeyboardOffset = 0 }: ChatViewProps) => {
  const { session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const theme = useColorScheme() ?? "light";
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const animatedValues = useRef<AnimatedValues>({});
  const flatListRef = useRef<FlatList<any>>(null);
  const inputRef = useRef<TextInput>(null);
  const cardBackground = useThemeColor({}, "cardBackground");
  const textColor = useThemeColor({}, "text");
  const bubbleBackgroundColor =
    theme === "light" ? pastelGreen500 : pastelGreen500;
  const insets = useSafeAreaInsets();

  const { messages: fetchedMessages } = useMessages({
    userId: session?.user.id || "",
    noteId,
  });

  const { queueSync } = useSync();

  useEffect(() => {
    setMessages(fetchedMessages);
    fetchedMessages.forEach((message) => {
      if (!animatedValues.current[message.id]) {
        animatedValues.current[message.id] = new Animated.Value(1);
      }
    });
    // flatListRef.current?.scrollToEnd({ animated: true });
    // inputRef.current?.blur();
  }, [fetchedMessages]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: false,
      multiple: false,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const fileName = asset.name;
      const fileExt = fileName.split(".").pop() || "unknown";
      const mimetype = asset.mimeType || "unknown";

      setSelectedFile({
        uri: asset.uri,
        fileName: fileName,
        ext: fileExt.toLowerCase(),
        size: asset.size || 0,
        mimetype,
      });
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const mimetype = asset.mimeType || "unknown";

      const fileExt = asset.uri.split(".").pop() || "unknown";
      let fileName = asset.fileName || ""; // This might be `null` when the name is unavailable or user gave limited permission to access the media library.
      if (!fileName) {
        fileName = `file.${fileExt}`;
      }

      setSelectedFile({
        uri: asset.uri,
        fileName: fileName,
        ext: fileExt,
        size: asset.fileSize || 0,
        mimetype,
      });
    }
  };

  const handleFileUpload = async (
    uri: string,
    fileName: string, // must be a generated filename
    fileExt: string,
    fileMimetype: string,
    fileSize: number
  ) => {
    // const netInfo = await NetInfo.fetch();

    // const uploadPath = `${session?.user.id}/${fileName}`;

    // if (netInfo.isConnected) {
    //    const { data, error } = await supabase.storage
    //     .from("chat-files")
    //     .upload(
    //       uploadPath,
    //       await FileSystem.readAsStringAsync(uri, {
    //         encoding: FileSystem.EncodingType.Base64,
    //       }),
    //       {
    //         contentType: fileMimetype,
    //       }
    //     );

    //   if (error) {
    //     console.error("Error uploading file:", error);
    //     return null;
    //   }

    //   const {
    //     data: { publicUrl },
    //   } = supabase.storage.from("chat-files").getPublicUrl(uploadPath);

    //   const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    //   await FileSystem.copyAsync({
    //     from: uri,
    //     to: fileUri,
    //   });

    //   return publicUrl;
    // } else {
    //   const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    //   await FileSystem.copyAsync({
    //     from: uri,
    //     to: fileUri,
    //   });
    //   return fileUri;
    // }

    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.copyAsync({
      from: uri,
      to: fileUri,
    });
    return fileUri;
  };

  const sendMessage = async () => {
    if ((inputText.trim() === "" && !selectedFile) || !noteId) return;

    let fileUrl = null;
    let fileExt = null;
    let fileName = null;
    let fileSize = null;
    let fileMimetype = null;

    if (selectedFile) {
      const generatedFileName = `${Date.now()}-${selectedFile.fileName}`;
      fileUrl = await handleFileUpload(
        selectedFile.uri,
        generatedFileName,
        selectedFile.ext,
        selectedFile.mimetype,
        selectedFile.size
      );
      fileExt = selectedFile.ext;
      fileName = generatedFileName;
      fileSize = selectedFile.size;
      fileMimetype = selectedFile.mimetype;
    }

    const newMessage = await writeNewMessage({
      userId: session?.user.id || "",
      noteId,
      content: inputText,
      fileUrl,
      fileExt,
      fileName,
      fileSize,
      fileMimetype,
    });

    queueSync();

    animatedValues.current[newMessage.id] = new Animated.Value(0);

    setInputText("");
    setSelectedFile(null);

    Animated.spring(animatedValues.current[newMessage.id], {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {});

    flatListRef.current?.scrollToEnd({ animated: true });
    // inputRef.current?.focus();
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={insets.top + additionalKeyboardOffset}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => (
            <MessageItem
              item={item}
              session={session}
              animatedValues={animatedValues}
              bubbleBackgroundColor={bubbleBackgroundColor}
              textColor={textColor}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />
        {selectedFile && (
          <View style={styles.selectedFileContainer}>
            <Text style={[styles.selectedFileName, { color: textColor }]}>
              {selectedFile.fileName}
            </Text>
            <TouchableOpacity onPress={() => setSelectedFile(null)}>
              <Icon name="x" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={pickFile} style={styles.attachButton}>
            <Icon name="paperclip" size={24} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
            <Icon name="image" size={24} color={textColor} />
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            multiline
            style={[
              styles.input,
              { backgroundColor: cardBackground, color: textColor },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
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

function MessageItem({
  item,
  session,
  animatedValues,
  bubbleBackgroundColor,
  textColor,
}: {
  item: Message;
  session: Session | null;
  animatedValues: React.MutableRefObject<AnimatedValues>;
  bubbleBackgroundColor: string;
  textColor: string;
}) {
  const [itemFile, setItemFile] = useState<{
    uri: string | null;
    mimetype: string | null;
  }>({
    uri: null,
    mimetype: null,
  });

  useEffect(() => {
    const loadImage = async () => {
      if (item.fileUrl && item.fileExt) {
        const localUri = `${FileSystem.documentDirectory}${item.fileName}`;
        const fileInfo = await FileSystem.getInfoAsync(localUri);

        if (fileInfo.exists) {
          setItemFile({
            uri: localUri,
            mimetype: item.fileMimetype || null,
          });
        } else {
          try {
            const { data, error } = await supabase.storage
              .from("chat-files")
              .download(`${session?.user.id}/${item.fileName}`);

            if (error) throw error;

            const fr = new FileReader();
            fr.readAsDataURL(data!);
            fr.onload = () => {
              const dataUrl = fr.result as string;
              setItemFile({
                uri: dataUrl,
                mimetype: item.fileMimetype || null,
              });
              // Save the image locally for future use
              FileSystem.writeAsStringAsync(localUri, dataUrl.split(",")[1], {
                encoding: FileSystem.EncodingType.Base64,
              });
            };
          } catch (error) {
            console.error("Error downloading image:", error);
          }
        }
      }
    };

    loadImage();
  }, [item.fileUrl, item.fileName, item.fileMimetype]);

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
        item.fileUrl ? styles.mediaContainer : styles.messageContainer,
        animatedStyle,
        {
          backgroundColor: bubbleBackgroundColor,
        },
      ]}
    >
      {itemFile.uri && itemFile.mimetype?.startsWith("image") && (
        <Image
          source={{ uri: itemFile.uri }}
          style={styles.imageMessage}
          resizeMode="contain"
        />
      )}
      {itemFile.uri && itemFile.mimetype?.startsWith("video") && (
        <Video
          source={{ uri: itemFile.uri }}
          style={styles.videoMessage}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
        />
      )}
      {itemFile.uri &&
        !(
          itemFile.mimetype?.startsWith("image") ||
          itemFile.mimetype?.startsWith("video")
        ) && (
          <TouchableOpacity
            onPress={() => {
              // Implement file opening logic here
              console.log("Open file:", itemFile.uri);
            }}
            style={styles.fileButton}
          >
            <Icon name="file" size={24} color={textColor} />
            <Text style={[styles.fileName, { color: textColor }]}>
              {item.fileName || "File"}
            </Text>
          </TouchableOpacity>
        )}
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
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  mediaContainer: {
    borderRadius: 16,
    padding: 8,
    marginTop: 8,
    flex: 1,
    flexDirection: "row",
    maxWidth: "80%",
    alignSelf: "flex-end",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  imageMessage: {
    flex: 1,
    aspectRatio: 1,
    resizeMode: "contain",
    borderRadius: 8,
  },
  videoMessage: {
    flex: 1,
    aspectRatio: 1,
    resizeMode: "contain",
    borderRadius: 8,
  },
  attachButton: {
    padding: 8,
  },
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
  },
  selectedFileContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  selectedFileName: {
    fontSize: 14,
    flex: 1,
  },
});

export default ChatView;
