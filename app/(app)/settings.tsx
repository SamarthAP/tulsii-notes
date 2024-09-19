import React, { useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Alert,
  Pressable,
  Text,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { database } from "@/lib/watermelon";
import { useSession } from "@/contexts/SessionContext";
import { router } from "expo-router";
import { pastelGreen600, pastelGreen950 } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useSync } from "@/contexts/SyncProviderContext";

export default function Settings() {
  const backgroundColor = useThemeColor({}, "background");
  const { session } = useSession();
  const [syncing, setSyncing] = useState(false);
  const { queueSync } = useSync();

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out? This will delete all local data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await database.write(async () => {
              await database.unsafeResetDatabase();
            });
            await supabase.auth.signOut();
            router.replace("/sign-in");
          },
        },
      ]
    );
  };

  const handleSync = () => {
    if (!session?.user) return;
    queueSync();
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor,
      }}
    >
      <View style={styles.container}>
        <View style={styles.heading}>
          <ThemedText
            style={{
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            Settings
          </ThemedText>
        </View>
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleSync}
            disabled={syncing}
            style={[
              styles.button,
              {
                backgroundColor: pastelGreen600,
              },
            ]}
          >
            <ThemedText style={{ color: pastelGreen950 }}>Sync</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleLogout}
            style={[
              styles.button,
              {
                backgroundColor: pastelGreen600,
              },
            ]}
          >
            <ThemedText style={{ color: pastelGreen950 }}>Logout</ThemedText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    padding: 12,
  },
  heading: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
});
