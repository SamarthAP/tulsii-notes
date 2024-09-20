import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
  DrawerItem,
} from "@react-navigation/drawer";
import { useThemeColor } from "@/hooks/useThemeColor";

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");

  return (
    <DrawerContentScrollView
      {...props}
      style={[{ backgroundColor }]}
      contentContainerStyle={[{ backgroundColor }]}
    >
      {props.state.routes.map((route, index) => {
        const focused = index === props.state.index;
        const { drawerLabel, title, drawerItemStyle } =
          props.descriptors[route.key].options;

        return (
          <DrawerItem
            key={route.key}
            label={
              drawerLabel !== undefined
                ? drawerLabel
                : title !== undefined
                ? title
                : route.name
            }
            focused={focused}
            activeTintColor={
              props.descriptors[route.key].options.drawerActiveTintColor
            }
            inactiveTintColor={
              props.descriptors[route.key].options.drawerInactiveTintColor
            }
            activeBackgroundColor={
              props.descriptors[route.key].options.drawerActiveBackgroundColor
            }
            style={{
              borderWidth: focused ? 1 : 0,
              borderColor: focused ? borderColor : "transparent",
              borderRadius: 8,
            }}
            onPress={() => props.navigation.navigate(route.name)}
          />
        );
      })}
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
