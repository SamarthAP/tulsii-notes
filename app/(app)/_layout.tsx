import { Redirect, SplashScreen, Tabs } from "expo-router";
import { pastelGreen500 } from "@/constants/Colors";
import { DatabaseProvider } from "@nozbe/watermelondb/DatabaseProvider";
import { useSession } from "@/contexts/SessionContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import CustomDrawerContent from "@/components/CustomDrawerContent";
import { database } from "@/lib/watermelon";

export default function DrawerLayout() {
  const { session, loadingSession } = useSession();
  const backgroundColor = useThemeColor({}, "background");
  const cardBackgroundColor = useThemeColor({}, "cardBackground");
  const mutedColor = useThemeColor({}, "textMutedExtra");

  if (loadingSession) {
    return <ThemedText>Loading...</ThemedText>;
  }

  SplashScreen.hideAsync();

  if (!session) {
    return <Redirect href={"/sign-in"} />;
  }

  return (
    <DatabaseProvider database={database}>
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
        </Drawer>
      </GestureHandlerRootView>
    </DatabaseProvider>
  );
}
