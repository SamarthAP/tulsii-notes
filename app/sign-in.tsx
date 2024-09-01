import { ThemedText } from "@/components/ThemedText";
import {
  Alert,
  Button,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import z from "zod";
import {
  pastelGreen500,
  pastelGreen600,
  pastelGreen950,
} from "../constants/Colors";
import { syncAndHandleErrors } from "@/lib/sync";

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one symbol");

const emailSchema = z.string().email("Invalid email address");

export default function SignIn() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const textMutedColor = useThemeColor({}, "textMuted");
  const texMutedExtraColor = useThemeColor({}, "textMutedExtra");
  const cardBackground = useThemeColor({}, "cardBackground");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);

    const emailParseData = emailSchema.safeParse(email);
    if (!emailParseData.success) {
      Alert.alert(emailParseData.error.errors[0].message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      await syncAndHandleErrors({ userId: user?.id || "" });
      router.push("/(app)/");
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);

    const emailParseData = emailSchema.safeParse(email);
    if (!emailParseData.success) {
      Alert.alert(emailParseData.error.errors[0].message);
      setLoading(false);
      return;
    }

    const passwordParseData = passwordSchema.safeParse(password);
    if (!passwordParseData.success) {
      Alert.alert(passwordParseData.error.errors[0].message);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert(
        "Account created, please check your email for a verification link and then log in"
      );
    }
    setLoading(false);
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor,
      }}
    >
      <View style={styles.container}>
        <View style={styles.heading}>
          <ThemedText type="title">Tulsii</ThemedText>
          <ThemedText
            type="default"
            style={{
              color: textMutedColor,
            }}
          >
            Notes that flow like conversation.
          </ThemedText>
        </View>

        <View style={styles.body}>
          <TextInput
            editable={!loading}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            autoCapitalize={"none"}
            style={[
              styles.input,
              { color: textColor, backgroundColor: cardBackground },
            ]}
          />

          <TextInput
            editable={!loading}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize={"none"}
            style={[
              styles.input,
              { color: textColor, backgroundColor: cardBackground },
            ]}
          />

          <View>
            <ThemedText style={{ color: texMutedExtraColor }}>
              Password requirements:
            </ThemedText>
            <ThemedText style={{ color: texMutedExtraColor }}>
              - Lowercase
            </ThemedText>
            <ThemedText style={{ color: texMutedExtraColor }}>
              - Uppercase
            </ThemedText>
            <ThemedText style={{ color: texMutedExtraColor }}>
              - Number
            </ThemedText>
            <ThemedText style={{ color: texMutedExtraColor }}>
              - Symbol
            </ThemedText>
          </View>

          <Pressable
            disabled={loading}
            style={[
              styles.button,
              {
                borderWidth: 1,
                borderColor: pastelGreen600,
              },
            ]}
            onPress={signInWithEmail}
          >
            <ThemedText style={{ color: pastelGreen600 }}>Log In</ThemedText>
          </Pressable>

          <Pressable
            disabled={loading}
            style={[
              styles.button,
              {
                backgroundColor: pastelGreen500,
              },
            ]}
            onPress={signUpWithEmail}
          >
            <ThemedText style={{ color: pastelGreen950 }}>Sign Up</ThemedText>
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
    paddingVertical: 24,
  },
  body: {
    flex: 1,
    flexDirection: "column",
    flexGrow: 1,
    rowGap: 12,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  input: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
