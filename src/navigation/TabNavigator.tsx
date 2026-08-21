import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home, ShoppingBag, Stethoscope, User } from "lucide-react-native";
import Colors from "@/constants/Colors";
import DashboardScreen from "@/screens/home/DashboardScreen";
import AddEventModal from "@/screens/home/AddEventModal";
import MedicalHistoryScreen from "@/screens/medical/MedicalHistoryScreen";
import StoreScreen from "@/screens/store/StoreScreen";
import ProfileScreen from "@/screens/profile/ProfileScreen";
import { HomeStackParamList, MainTabParamList } from "@/types/navigation";

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Inicio" }}
      />
      <HomeStack.Screen
        name="AddEventModal"
        component={AddEventModal}
        options={{ title: "Evento médico", presentation: "modal" }}
      />
    </HomeStack.Navigator>
  );
}

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
        component={HomeStackNavigator}
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
          tabBarIcon: ({ color, size }) => <Stethoscope color={color} size={size} />,
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
