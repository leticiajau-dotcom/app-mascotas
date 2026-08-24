import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { EventCategory } from "./event";

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  MedicalTab: undefined;
  StoreTab: undefined;
  ProfileTab: undefined;
};

/**
 * Stack por encima de las tabs: así "AddEventModal" es una única pantalla
 * accesible desde cualquier tab (Inicio, Historial) en vez de vivir
 * anidada dentro de una sola de ellas.
 */
export type MainStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList>;
  AddEventModal: { petId: string; eventId?: string; category?: EventCategory } | undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type DashboardScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "HomeTab">,
  NativeStackScreenProps<MainStackParamList>
>;

export type MedicalHistoryScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "MedicalTab">,
  NativeStackScreenProps<MainStackParamList>
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
