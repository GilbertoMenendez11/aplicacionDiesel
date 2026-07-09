import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Librería para la cámara
import { registrarAccidente } from "../services/tranmasApi"; // Nuestra API

function AccidentesPage({ tranmasId }) {
  // Recibimos el ID desde App.js
  const [equipo, setEquipo] = useState("");
  const [lugar, setLugar] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para abrir la cámara
  const tomarFoto = async () => {
    if (fotos.length >= 3) {
      Alert.alert("Límite", "Solo puedes subir hasta 3 fotos por reporte."); // El manual dice máx 3 fotos
      return;
    }

    // Pedir permiso
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "La aplicación necesita acceso a la cámara.",
      );
      return;
    }

    // Abrir cámara
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5, // Comprimir un poco para no saturar los datos
    });

    if (!result.canceled) {
      const nuevaFoto = result.assets[0];
      // Guardar en el formato que espera nuestro servicio
      setFotos([
        ...fotos,
        {
          uri: nuevaFoto.uri,
          type: "image/jpeg",
          fileName:
            nuevaFoto.uri.split("/").pop() || `foto${fotos.length + 1}.jpg`,
        },
      ]);
    }
  };

  const quitarFoto = (index) => {
    const nuevasFotos = [...fotos];
    nuevasFotos.splice(index, 1);
    setFotos(nuevasFotos);
  };

  const handleSubmit = async () => {
    if (!tranmasId) {
      Alert.alert(
        "Error",
        "No se encontró sesión en TRANMAS. Intenta reiniciar la app.",
      );
      return;
    }
    if (!equipo || !lugar) {
      Alert.alert(
        "Datos incompletos",
        "El equipo y lugar son campos obligatorios.",
      ); // Obligatorios según el manual
      return;
    }

    setLoading(true);
    try {
      // Obtenemos la fecha actual automáticamente en formato YYYY-MM-DD
      const fechaActual = new Date().toISOString().split("T")[0];

      const datos = {
        equipo,
        lugar,
        descripcion,
        fecha: fechaActual, //
      };

      // Llamada a la API que hicimos en el paso anterior
      await registrarAccidente(tranmasId, datos, fotos); //

      Alert.alert("Éxito", "El reporte ha sido enviado correctamente.");

      // Limpiar formulario tras éxito
      setEquipo("");
      setLugar("");
      setDescripcion("");
      setFotos([]);
    } catch (error) {
      Alert.alert("Error al enviar", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Reportar Accidente</Text>

      <Text style={styles.label}>Unidad / Equipo *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: EQ07 o Placa"
        value={equipo}
        onChangeText={setEquipo}
      />

      <Text style={styles.label}>Lugar del Incidente *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Predio o Ruta exacta"
        value={lugar}
        onChangeText={setLugar}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Detalles de lo ocurrido..."
        value={descripcion}
        onChangeText={setDescripcion}
        multiline={true}
        numberOfLines={4}
      />

      {/* SECCIÓN DE FOTOS */}
      <View style={styles.fotoSection}>
        <Text style={styles.label}>
          Evidencia Fotográfica ({fotos.length}/3)
        </Text>
        <TouchableOpacity style={styles.fotoButton} onPress={tomarFoto}>
          <Text style={styles.fotoButtonText}>+ Tomar Foto</Text>
        </TouchableOpacity>

        <View style={styles.fotosContainer}>
          {fotos.map((foto, index) => (
            <TouchableOpacity key={index} onPress={() => quitarFoto(index)}>
              <Image source={{ uri: foto.uri }} style={styles.thumbnail} />
              <View style={styles.deleteBadge}>
                <Text style={styles.deleteText}>X</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* BOTÓN ENVIAR */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Enviar Reporte</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 40,
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 10,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#000",
  },
  textArea: { height: 100, textAlignVertical: "top" },

  fotoSection: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  fotoButton: {
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  fotoButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  fotosContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  deleteBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: { color: "white", fontSize: 12, fontWeight: "bold" },

  submitButton: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40,
    marginTop: 10,
  },
  buttonDisabled: { backgroundColor: "#aaa" },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default AccidentesPage;
