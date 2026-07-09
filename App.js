import React, { useState, useEffect } from "react";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native"; // Añadimos Text para el loading
import AsyncStorage from "@react-native-async-storage/async-storage";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// 1. Importaciones corregidas
import LoginPage from "./src/pages/LoginPage";
import HomePage from "./src/pages/HomePage"; // Registrar Carga
import HistorialPage from "./src/pages/HistorialPage"; // Historial
import UserPage from "./src/pages/UserPage"; //Usuario
import TanquePage from "./src/pages/TanquePage"; //Tanque
import { loginTranmas } from "./src/services/tranmasApi";
import AccidentesPage from './src/pages/AccidentesPage';
const Tab = createBottomTabNavigator();

// --- Este es el contenedor de la App Principal (con pestañas) ---
function AppTabs({ onLogout, tranmasId }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Carga") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Historial") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Tanque") {
            iconName = focused ? "pie-chart" : "pie-chart-outline";
          } else if (route.name === "Usuario") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Accidentes") {
            iconName = focused ? "warning" : "warning-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Carga">
        {(props) => <HomePage {...props} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Historial" component={HistorialPage} />
      <Tab.Screen name="Tanque" component={TanquePage} />
      <Tab.Screen name="Accidentes">{props => <AccidentesPage {...props} tranmasId={tranmasId} />}</Tab.Screen>
      <Tab.Screen name="Usuario" component={UserPage} />
    </Tab.Navigator>
  );
}

// --- Este sigue siendo el componente principal 'App' ---
export default function App() {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tranmasId, setTranmasId] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
        try {
          const id = await loginTranmas(); // [cite: 198]
          setTranmasId(id); // Guarda el user_id en el estado global [cite: 199, 302]
        } catch (tranmasError) {
          console.error("Fallo login TRANMAS:", tranmasError); // [cite: 200]
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setToken(null);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!token ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AppTabs onLogout={handleLogout} tranmasId={tranmasId} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
