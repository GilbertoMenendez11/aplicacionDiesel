import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import api from "../api";

function HomePage({ onLogout }) {
  // Estados para los datos crudos de la API
  const [vehiculosData, setVehiculosData] = useState([]);
  const [conductoresData, setConductoresData] = useState([]);

  // Estados para los valores seleccionados
  const [vehiculoId, setVehiculoId] = useState(null);
  const [conductorId, setConductorId] = useState(null);

  const [galones, setGalones] = useState("");
  const [vueltas, setVueltas] = useState("");

  // ESTADO CLAVE: Usado para forzar el reinicio visual de SelectList
  const [resetKey, setResetKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
const fetchData = async () => {
    try {
        setLoading(true);
        const [vehiculosRes, conductoresRes] = await Promise.all([
            api.get('/vehiculos'),
            api.get('/conductores')
        ]);
        
        // --- FILTRO FINAL: ROBUSTO CONTRA ESPACIOS Y MAYÚSCULAS ---
        const vehiculosFormateados = vehiculosRes.data
            //.filter(v => v.estado && v.estado.trim().toUpperCase() === "ACTIVO") 
            .map(v => ({
                key: v.vehiculo_id,
                value: `${v.numero_unidad} - ${v.placa} (${v.modelo})`
            }));

        const conductoresFormateados = conductoresRes.data
            .filter(c => c.estado && c.estado.trim().toUpperCase() === "ACTIVO")
            .map(c => ({
                key: c.conductor_id,
                value: `${c.nombre_completo} - ${c.dui || 'Sin DUI'}`
            }));

        setVehiculosData(vehiculosFormateados);
        setConductoresData(conductoresFormateados);
        setError('');
    } catch (err) {
        // ... (resto del código igual)
    } finally {
        setLoading(false);
    }
};
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!vehiculoId || !conductorId || !galones || !vueltas) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    // Validar que sean números
    const galonesFloat = parseFloat(galones);
    const vueltasInt = parseInt(vueltas);

    if (
      isNaN(galonesFloat) ||
      galonesFloat <= 0 ||
      isNaN(vueltasInt) ||
      vueltasInt < 0
    ) {
      Alert.alert(
        "Error",
        "Galones debe ser un número positivo y Vueltas un número válido."
      );
      return;
    }

    const datosCarga = {
      vehiculo_id: vehiculoId,
      conductor_id: conductorId,
      tanque_id: 1, // Asumimos el tanque 1 por defecto
      galones_cargados: galonesFloat,
      vueltas_desde_ultima_carga: vueltasInt,
    };

    setLoading(true);
    try {
      await api.post("/cargas", datosCarga);
      Alert.alert("Éxito", "Carga registrada correctamente.");

      // --- REINICIO COMPLETO DEL FORMULARIO ---
      setGalones("");
      setVueltas("");
      setVehiculoId(null);
      setConductorId(null);
      setResetKey((prev) => prev + 1); // <--- Incrementa para forzar el reinicio visual
      // ------------------------------------------
    } catch (err) {
      console.error("Error al guardar:", err);
      const errorMsg =
        err.response?.data?.error || "Error al conectar con el servidor.";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && vehiculosData.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Registrar Carga</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* --- Buscador de Vehículos (con Key de reinicio) --- */}
        <Text style={styles.label}>Vehículo (Buscar por unidad o placa)</Text>
        <SelectList
          key={`vehiculo-${resetKey}`} // Reinicio
          setSelected={(val) => setVehiculoId(val)}
          data={vehiculosData}
          save="key"
          placeholder="Buscar vehículo..."
          searchPlaceholder="Escriba unidad o placa"
          boxStyles={styles.dropdownBox}
          dropdownStyles={styles.dropdownList}
        />

        {/* --- Buscador de Conductores (con Key de reinicio) --- */}
        <Text style={styles.label}>Conductor (Buscar por nombre)</Text>
        <SelectList
          key={`conductor-${resetKey}`} // Reinicio
          setSelected={(val) => setConductorId(val)}
          data={conductoresData}
          save="key"
          placeholder="Buscar conductor..."
          searchPlaceholder="Escriba nombre"
          boxStyles={styles.dropdownBox}
          dropdownStyles={styles.dropdownList}
        />

        <Text style={styles.label}>Galones Cargados</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 50.5"
          value={galones}
          onChangeText={setGalones}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Vueltas Realizadas</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 10"
          value={vueltas}
          onChangeText={setVueltas}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Guardando..." : "Guardar Carga"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { width: "100%", backgroundColor: "#f4f4f4" },
  container: { flex: 1, padding: 20, paddingTop: 50, paddingBottom: 100 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
    color: "#333",
  },

  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  dropdownBox: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
    height: 50,
    alignItems: "center",
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
  },

  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: { backgroundColor: "#aaa" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  logoutButton: { alignSelf: "center", marginTop: 30, padding: 10 },
  logoutButtonText: { color: "#e74c3c", fontSize: 16, fontWeight: "bold" },
  errorText: { color: "#e74c3c", textAlign: "center", marginBottom: 10 },
});

export default HomePage;
