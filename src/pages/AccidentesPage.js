import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import { Image } from 'expo-image';
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { registrarAccidente, getAccidentes } from "../services/tranmasApi"; // Importamos la petición GET

function AccidentesPage({ tranmasId }) {
  // Estado principal para controlar el interruptor visual
  const [vista, setVista] = useState("formulario"); // 'formulario' o 'listado'

  // --- ESTADOS DEL FORMULARIO ---
  const [equipo, setEquipo] = useState("");
  const [lugar, setLugar] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fotos, setFotos] = useState([]);
  const [loadingForm, setLoadingForm] = useState(false);

  // --- ESTADOS DEL LISTADO ---
  const [listaAccidentes, setListaAccidentes] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // --- ESTADOS PARA VER FOTO EN GRANDE ---
  const [modalFotoVisible, setModalFotoVisible] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState("");

  const abrirFoto = (url) => {
    setFotoSeleccionada(url);
    setModalFotoVisible(true);
  };

  // 1. Lógica para descargar el listado de accidentes desde la API
  const fetchHistorial = async () => {
    if (!tranmasId) return;
    setLoadingList(true);
    try {
      const data = await getAccidentes(tranmasId);
      console.log("FOTOS RECIBIDAS DEL SERVIDOR:", data.map(a => a.fotos));
      setListaAccidentes(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo cargar el historial de accidentes.");
    } finally {
      setLoadingList(false);
    }
  };

  // 2. Recargar listado cada vez que entra a la pestaña o cambia al botón de "Historial"
  useFocusEffect(
    useCallback(() => {
      if (vista === "listado") {
        fetchHistorial();
      }
    }, [vista, tranmasId]),
  );

  // --- LÓGICA DEL FORMULARIO ---
  const tomarFoto = async () => {
    if (fotos.length >= 3) {
      Alert.alert("Límite", "Solo puedes subir hasta 3 fotos por reporte."); // Límite establecido por TRANMAS
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "La aplicación necesita acceso a la cámara.",
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images',],
      quality: 0.4,
    });

    if (!result.canceled) {
      const nuevaFoto = result.assets[0];
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
      ); // Validaciones obligatorias
      return;
    }

    setLoadingForm(true);
    try {
      const fechaActual = new Date().toISOString().split("T")[0];
      const datos = { equipo, lugar, descripcion, fecha: fechaActual }; //

      await registrarAccidente(tranmasId, datos, fotos); // Envío multipart/form-data

      Alert.alert("Éxito", "El reporte ha sido enviado correctamente.");

      // Limpiamos los campos
      setEquipo("");
      setLugar("");
      setDescripcion("");
      setFotos([]);

      // Cambiamos automáticamente al historial para que el operario vea su nuevo registro
      setVista("listado");
    } catch (error) {
      Alert.alert("Error al enviar", error.message);
    } finally {
      setLoadingForm(false);
    }
  };

  // --- COMPONENTE DE TARJETA PARA CADA ACCIDENTE ---
  const renderAccidente = ({ item }) => {
    // Nueva función para acortar la fecha
    const formatearFecha = (fechaString) => {
      if (!fechaString) return "";
      const fecha = new Date(fechaString);
      // Esto la convertirá a formato: 09 jul 2026 (ajustado a tu región)
      return fecha.toLocaleDateString("es-SV", {
        timeZone: 'UTC',
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardEquipo}>{item.equipo}</Text>

          {/* APLICAMOS LA FUNCIÓN A LA FECHA AQUÍ */}
          <Text style={styles.cardFecha}>
            {formatearFecha(item.fecha_registro)}
          </Text>
        </View>
        <Text style={styles.cardLugar}>
          <Ionicons name="location" size={14} /> {item.lugar_accidente}
        </Text>

        {item.descripcion ? (
          <Text style={styles.cardDesc}>{item.descripcion}</Text>
        ) : null}

      {item.fotos && item.fotos.length > 0 && (
          <View style={styles.fotosList}>
            {item.fotos.map((fotoUrl, index) => {
              
              // 1. Creamos una nueva variable que cambia http por https
              const urlSegura = fotoUrl.replace('http://', 'https://');

              // 2. Usamos esa nueva urlSegura en el botón y en la imagen
              return (
                <TouchableOpacity key={index} onPress={() => abrirFoto(urlSegura)}>
                  <Image source={{ uri: urlSegura }} style={styles.fotoThumbList} />
                </TouchableOpacity>
              );
              
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {/* TÍTULO PRINCIPAL */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Accidentes</Text>
      </View>

      {/* INTERRUPTOR (TOGGLE) DE VISTAS */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            vista === "formulario" && styles.toggleActive,
          ]}
          onPress={() => setVista("formulario")}
        >
          <Text
            style={[
              styles.toggleText,
              vista === "formulario" && styles.toggleTextActive,
            ]}
          >
            Reportar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            vista === "listado" && styles.toggleActiveList,
          ]}
          onPress={() => setVista("listado")}
        >
          <Text
            style={[
              styles.toggleText,
              vista === "listado" && styles.toggleTextActive,
            ]}
          >
            Historial
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO DINÁMICO DEPENDIENDO DE LA VISTA */}
      {vista === "formulario" ? (
        // --- VISTA 1: FORMULARIO ---
        <ScrollView
          style={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
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

          <View style={styles.fotoSection}>
            <Text style={styles.label}>
              Evidencia Fotográfica ({fotos.length}/3)
            </Text>
            <TouchableOpacity style={styles.fotoButton} onPress={tomarFoto}>
              <Text style={styles.fotoButtonText}>+ Tomar Foto</Text>
            </TouchableOpacity>

            <View style={styles.fotosPreviewContainer}>
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

          <TouchableOpacity
            style={[styles.submitButton, loadingForm && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loadingForm}
          >
            {loadingForm ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Enviar Reporte</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        // --- VISTA 2: LISTADO / HISTORIAL ---
        <View style={styles.contentContainer}>
          {loadingList ? (
            <ActivityIndicator
              size="large"
              color="#007bff"
              style={{ marginTop: 20 }}
            />
          ) : (
            <FlatList
              data={listaAccidentes}
              renderItem={renderAccidente}
              keyExtractor={(item) => item.id.toString()} // ID único del accidente
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No hay accidentes registrados aún.
                </Text>
              }
            />
          )}
        </View>
      )}
    {/* VISOR DE IMAGEN EN PANTALLA COMPLETA */}
      <Modal visible={modalFotoVisible} transparent={true} animationType="fade">
        <View style={styles.modalFondo}>
          <TouchableOpacity 
            style={styles.modalCerrarBoton} 
            onPress={() => setModalFotoVisible(false)}
          >
            <Ionicons name="close-circle" size={45} color="#fff" />
          </TouchableOpacity>
          
          {fotoSeleccionada ? (
            <Image 
              source={{ uri: fotoSeleccionada }} 
              style={styles.fotoGigante} 
              resizeMode="contain" // Mantiene las proporciones sin cortar la foto
            />
          ) : null}
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#f4f4f4", paddingTop: 40 },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#333", marginLeft: 10 },

  // Estilos del Interruptor
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
  toggleButton: { flex: 1, paddingVertical: 12, alignItems: "center" },
  toggleActive: { backgroundColor: "#e74c3c" }, // Rojo para reportar
  toggleActiveList: { backgroundColor: "#007bff" }, // Azul para el historial
  toggleText: { fontSize: 16, fontWeight: "bold", color: "#555" },
  toggleTextActive: { color: "#fff" },

  contentContainer: { flex: 1, paddingHorizontal: 20 },

  // Estilos del formulario
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
  fotosPreviewContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
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

  // Estilos para las tarjetas del listado
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  cardEquipo: { fontSize: 18, fontWeight: "bold", color: "#333" },
  cardFecha: { fontSize: 14, color: "#777", fontWeight: "bold" },
  cardLugar: { fontSize: 15, color: "#555", marginBottom: 10 },
  cardDesc: {
    fontSize: 14,
    color: "#444",
    fontStyle: "italic",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 5,
  },
  fotosList: { flexDirection: "row", marginTop: 10, gap: 10 },
  fotoThumbList: {
    width: 60,
    height: 60,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 30,
  },

  // Estilos para el Modal de foto gigante
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCerrarBoton: { position: "absolute", top: 50, right: 20, zIndex: 10 },
  fotoGigante: { width: "100%", height: "80%" },
});

export default AccidentesPage;
