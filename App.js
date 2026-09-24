import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TicketListScreen from "./screens/TicketListScreen";
import TicketDetailScreen from "./screens/TicketDetailScreen";
import EvidenceScreen from "./screens/EvidenceScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Ticket list -> detail -> evidence, all nested under the "Tickets" tab.
function TicketsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TicketList"
        component={TicketListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Evidence"
        component={EvidenceScreen}
        options={{ headerShown: false, presentation: "fullScreenModal" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Tickets" component={TicketsStack} />
        {/* Add more bottom-level tabs here later, e.g. "Map" or "Settings" */}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
