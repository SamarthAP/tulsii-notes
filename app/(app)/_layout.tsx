import { Redirect, SplashScreen } from "expo-router";
import { pastelGreen500 } from "@/constants/Colors";
import { DatabaseProvider } from "@nozbe/watermelondb/DatabaseProvider";
import { useSession } from "@/contexts/SessionContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { useThemeColor } from "@/hooks/useThemeColor";
import CustomDrawerContent from "@/components/CustomDrawerContent";
import { database } from "@/lib/watermelon";
import { ActivityIndicator, SafeAreaView } from "react-native";
import { DebouncedSyncProvider } from "@/contexts/DebounceSyncContext";

export default function DrawerLayout() {
  const { session, loadingSession } = useSession();
  const cardBackgroundColor = useThemeColor({}, "cardBackground");
  const mutedColor = useThemeColor({}, "textMutedExtra");

  if (loadingSession) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="small" color={pastelGreen500} />
      </SafeAreaView>
    );
  }

  SplashScreen.hideAsync();

  if (!session) {
    return <Redirect href={"/sign-in"} />;
  }

  return (
    <DatabaseProvider database={database}>
      <DebouncedSyncProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
              headerShown: false,
              drawerActiveBackgroundColor: cardBackgroundColor,
              drawerActiveTintColor: pastelGreen500,
              drawerInactiveTintColor: mutedColor,
              drawerItemStyle: {
                borderRadius: 8,
              },
            }}
            backBehavior="history"
          >
            <Drawer.Screen name="index" options={{ title: "Daily" }} />
            <Drawer.Screen name="all-notes" options={{ title: "All Notes" }} />
            <Drawer.Screen name="search" options={{ title: "Search" }} />
            <Drawer.Screen name="settings" options={{ title: "Settings" }} />
          </Drawer>
        </GestureHandlerRootView>
      </DebouncedSyncProvider>
    </DatabaseProvider>
  );
}
