import { Redirect, SplashScreen, Tabs } from "expo-router";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { pastelGreen500 } from "@/constants/Colors";
import { useSession } from "@/contexts/SessionContext";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function TabLayout() {
  const { session, loadingSession } = useSession();
  const backgroundColor = useThemeColor({}, "background");
  const mutedColor = useThemeColor({}, "textMutedExtra");

  if (loadingSession) {
    return <ThemedText>Loading...</ThemedText>;
  }

  SplashScreen.hideAsync();

  if (!session) {
    return <Redirect href={"/sign-in"} />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: pastelGreen500,
        tabBarInactiveTintColor: mutedColor,
        tabBarInactiveBackgroundColor: backgroundColor,
        tabBarActiveBackgroundColor: backgroundColor,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0, // android
          shadowOpacity: 0, // ios
          // paddingBottom: 0, // when you dont add a background color, the existing padding shows white underneath the actual tab bar
          backgroundColor: backgroundColor,
        },
        // tabBarBackground: () => (
        //   <ThemedView
        //     style={{
        //       backgroundColor: "#ffffff",
        //     }}
        //   />
        // ), // to remove default white bar under tab bar (Not working just changes to black)
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Daily",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "calendar" : "calendar-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="all-notes"
        options={{
          title: "All Notes",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "list" : "list-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "search" : "search-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
