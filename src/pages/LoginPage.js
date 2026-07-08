import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api"; // Nuestro conector de API

function LoginPage({ onLoginSuccess }) {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!nombreUsuario || !password) {
      setError("Por favor, ingrese usuario y contraseña");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        nombre_usuario: nombreUsuario,
        password: password,
      });

      const token = response.data.token;
      await AsyncStorage.setItem("token", token); // Guarda el token

      onLoginSuccess(token); // Avisa al App.js que el login fue exitoso
    } catch (err) {
      console.error(err);
      setError("Credenciales inválidas. Verifique sus datos.");
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Control de Diesel</Text>
      <Text style={styles.subtitle}>Registro de Operador</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de Usuario"
        value={nombreUsuario}
        onChangeText={setNombreUsuario}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry // Oculta la contraseña
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Ingresando..." : "Entrar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// --- Estilos (como CSS, pero en JavaScript) ---
const styles = StyleSheet.create({
  container: {
    width: "80%",
    flex: 1, 
    justifyContent: 'center',
    color: "#ffffff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#777",
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default LoginPage;
