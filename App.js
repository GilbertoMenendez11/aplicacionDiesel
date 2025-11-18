import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native'; // Añadimos Text para el loading
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 

// 1. Importaciones corregidas (Asumo que renombraste HistorialPage a HistorialPage)
import LoginPage from './src/pages/LoginPage';
import HomePage from './src/pages/HomePage'; // Registrar Carga
import HistorialPage from './src/pages/HistorialPage'; // Historial
import UserPage from './src/pages/UserPage'; // El placeholder que acabamos de crear

const Tab = createBottomTabNavigator();

// --- Este es el contenedor de la App Principal (con pestañas) ---
function AppTabs({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Carga') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Historial') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Usuario') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff', 
        tabBarInactiveTintColor: 'gray',
        headerShown: false 
      })}
    >
      <Tab.Screen name="Carga">
        {props => <HomePage {...props} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Historial" component={HistorialPage} /> 
      <Tab.Screen name="Usuario" component={UserPage} />
    </Tab.Navigator>
  );
}


// --- Este sigue siendo el componente principal 'App' ---
export default function App() {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);
      } catch (e) { console.error(e); }
      setIsLoading(false);
    };
    checkToken();
  }, []);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setToken(null);
    } catch(e) { console.error(e); }
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
        <AppTabs onLogout={handleLogout} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});