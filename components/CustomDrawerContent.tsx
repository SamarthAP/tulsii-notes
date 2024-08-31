import { StyleSheet } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { useThemeColor } from "@/hooks/useThemeColor";

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const backgroundColor = useThemeColor({}, "background");
  const itemBackgroundColor = useThemeColor({}, "cardBackground");
  return (
    <DrawerContentScrollView
      {...props}
      style={[{ backgroundColor }]}
      contentContainerStyle={[styles.container, { backgroundColor }]}
    >
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
  },
});

export default CustomDrawerContent;
