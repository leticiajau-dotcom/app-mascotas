import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ClipboardList, Home, ShoppingBag, User } from "lucide-react-native";
import Colors from "@/constants/Colors";
import DashboardScreen from "@/screens/home/DashboardScreen";
import MedicalHistoryScreen from "@/screens/medical/MedicalHistoryScreen";
import StoreScreen from "@/screens/store/StoreScreen";
import ProfileScreen from "@/screens/profile/ProfileScreen";
import { MainTabParamList } from "@/types/navigation";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { borderTopColor: Colors.border },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={DashboardScreen}
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="MedicalTab"
        component={MedicalHistoryScreen}
        options={{
          title: "Historial",
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="StoreTab"
        component={StoreScreen}
        options={{
          title: "Tienda",
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
