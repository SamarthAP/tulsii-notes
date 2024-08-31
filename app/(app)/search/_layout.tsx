import { Stack } from "expo-router";

// stack layout with hidden header
export default function SearchLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[note_id]" />
    </Stack>
  );
}
