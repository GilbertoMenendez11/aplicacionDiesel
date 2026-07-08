import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api";

const screenWidth = Dimensions.get("window").width;

function TanquePage() {
  const [tanque, setTanque] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTanque = async () => {
    try {
      const response = await api.get("/inventario/tanques");
      if (response.data && response.data.length > 0) {
        setTanque(response.data[0]);
      }
    } catch (error) {
      console.error("Error al cargar tanque:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTanque();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTanque();
  };

  if (loading && !tanque) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Preparar datos para la gráfica
  const nivelActual = tanque ? parseFloat(tanque.nivel_actual_galones) : 0;
  const capacidad = tanque ? parseFloat(tanque.capacidad_galones) : 100;
  const vacio = Math.max(0, capacidad - nivelActual);
  const porcentaje = ((nivelActual / capacidad) * 100).toFixed(1);

  // Configuración de datos para la gráfica de dona
  const data = [
    {
      name: "Lleno",
      population: nivelActual,
      color: "#007bff",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
    {
      name: "Vacío",
      population: vacio,
      color: "#e0e0e0",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
  ];

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Estado del Tanque</Text>

      {tanque ? (
        <View style={styles.card}>
          {/* Gráfica de Dona */}
          <View style={styles.chartWrapper}>
            <PieChart
              data={data}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"80"} // Centrar la gráfica visualmente
              center={[0, 0]}
              absolute={false}
              hasLegend={false} // Ocultamos la leyenda fea por defecto
            />
            {/* Texto Flotante en el Centro (Truco visual) */}
            <View style={styles.centerLabel}>
              <Text style={styles.percentageText}>{porcentaje}%</Text>
              <Text style={styles.subText}>Lleno</Text>
            </View>
          </View>

          {/* Leyenda Personalizada y Datos */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={[styles.dot, { backgroundColor: "#007bff" }]} />
              <Text style={styles.infoLabel}>Nivel Actual:</Text>
              <Text style={styles.infoValue}>
                {nivelActual.toFixed(2)} Gal.
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.dot, { backgroundColor: "#e0e0e0" }]} />
              <Text style={styles.infoLabel}>Espacio Vacío:</Text>
              <Text style={styles.infoValue}>{vacio.toFixed(2)} Gal.</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { fontWeight: "bold", marginLeft: 22 },
                ]}
              >
                Capacidad Total:
              </Text>
              <Text style={[styles.infoValue, { fontWeight: "bold" }]}>
                {capacidad.toFixed(0)} Gal.
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <Text>No hay datos disponibles.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#f4f7f6",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 30,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  chartWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  centerLabel: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    left: "41%", // Ajuste manual para centrar sobre la dona (puede variar según pantalla)
  },
  percentageText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  subText: {
    fontSize: 14,
    color: "#ffffffff",
  },
  infoContainer: {
    width: "100%",
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 18,
    color: "#34495e",
    flex: 1,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
});

export default TanquePage;
