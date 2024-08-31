import { Stack } from "expo-router";

// stack layout with hidden header
export default function AllNotesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
