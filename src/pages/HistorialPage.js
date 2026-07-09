import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import api from "../api";

// FlatList necesita un 'listener' especial para saber cuándo volver a cargar
import { useFocusEffect } from "@react-navigation/native";

// --- FUNCIONES AUXILIARES PARA COMPARAR Y DETECTAR DÍAS ---
const esMismoDia = (fechaStr1, fechaStr2) => {
  if (!fechaStr1 || !fechaStr2) return false;
  const d1 = new Date(fechaStr1);
  const d2 = new Date(fechaStr2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const obtenerEtiquetaFecha = (fechaHoraStr) => {
  const fecha = new Date(fechaHoraStr);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);

  if (esMismoDia(fecha, hoy)) {
    return "Hoy";
  } else if (esMismoDia(fecha, ayer)) {
    return "Ayer";
  } else {
    // Si es un día anterior, muestra la fecha formateada (ej: 08/07/2026)
    return fecha.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
};

function HistorialPage() {
  const [cargas, setCargas] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Función para cargar los datos
  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const response = await api.get("/cargas/historial"); //
      setCargas(response.data); //
    } catch (err) {
      console.error("Error cargando historial:", err); //
    } finally {
      setLoading(false); //
    }
  };

  // 2. useFocusEffect se ejecuta CADA VEZ que el usuario abre esta pestaña
  useFocusEffect(
    React.useCallback(() => {
      fetchHistorial();
    }, []), //
  );

  // 3. Renderiza cada item de la lista detectando el cambio de día
  const renderItem = ({ item, index }) => {
    // Determinar si debemos mostrar la división visual de fecha:
    // Se muestra si es el primer elemento (index === 0) o si el registro anterior pertenece a un día diferente
    const mostrarDivision =
      index === 0 || !esMismoDia(item.fecha_hora, cargas[index - 1].fecha_hora);

    return (
      <View style={styles.itemContainer}>
        {/* División visual e identificación del inicio de jornada */}
        {mostrarDivision && (
          <View style={styles.dateDividerContainer}>
            <Text style={styles.dateDividerText}>
              {obtenerEtiquetaFecha(item.fecha_hora)}
            </Text>
            <View style={styles.dateDividerLine} />
          </View>
        )}

        {/* Tarjeta de registro individual */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {item.numero_unidad} ({item.placa})
          </Text>
          <Text style={styles.cardDate}>
            {new Date(item.fecha_hora).toLocaleString()}
          </Text>
          <Text style={styles.cardData}>
            {parseFloat(item.galones_cargados).toFixed(2)} Gal. |{" "}
            {item.vueltas_desde_ultima_carga} Vueltas
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Cargas</Text>
      <TouchableOpacity onPress={fetchHistorial}>
        <Text style={styles.refreshText}>Tocar para recargar</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} /> //
      ) : (
        <FlatList
          data={cargas} //
          renderItem={renderItem} // Pasamos la función modificada
          keyExtractor={(item) => item.carga_id.toString()} //
          style={styles.list} //
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#f4f4f4", //
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10, //
  },
  refreshText: {
    textAlign: "center",
    color: "#007bff",
    marginBottom: 20, //
  },
  list: {
    width: "100%", //
  },
  itemContainer: {
    width: "100%",
  },
  // --- NUEVOS ESTILOS PARA LA DIVISIÓN VISUAL ---
  dateDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  dateDividerText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#007bff", // Azul principal para resaltar el cambio de día
    marginRight: 10,
    letterSpacing: 0.5,
  },
  dateDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc", // Línea gris sutil divisoria
  },
  // ----------------------------------------------
  card: {
    backgroundColor: "#fff", //
    padding: 15, //
    borderRadius: 8, //
    marginBottom: 10, //
    shadowColor: "#000", //
    shadowOpacity: 0.1, //
    shadowRadius: 5, //
    elevation: 3, //
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold", //
  },
  cardDate: {
    fontSize: 14,
    color: "#666", //
    marginTop: 5, //
  },
  cardData: {
    fontSize: 16,
    marginTop: 10, //
  },
});

export default HistorialPage;
