import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import api from '../api';

// FlatList necesita un 'listener' especial para saber cuándo volver a cargar
import { useFocusEffect } from '@react-navigation/native';

function HistorialPage() {
  const [cargas, setCargas] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Función para cargar los datos
  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cargas/historial');
      setCargas(response.data);
    } catch (err) {
      console.error('Error cargando historial:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. useFocusEffect se ejecuta CADA VEZ que el usuario abre esta pestaña
  useFocusEffect(
    React.useCallback(() => {
      fetchHistorial();
    }, [])
  );

  // 3. Renderiza cada item de la lista
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.numero_unidad} ({item.placa})</Text>
      <Text style={styles.cardDate}>
        {new Date(item.fecha_hora).toLocaleString()}
      </Text>
      <Text style={styles.cardData}>
        {parseFloat(item.galones_cargados).toFixed(2)} Gal. | {item.vueltas_desde_ultima_carga} Vueltas
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Cargas</Text>
      <TouchableOpacity onPress={fetchHistorial}>
        <Text style={styles.refreshText}>Tocar para recargar</Text>
      </TouchableOpacity>
      
      {loading ? (
        <ActivityIndicator size="large" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={cargas}
          renderItem={renderItem}
          keyExtractor={(item) => item.carga_id.toString()}
          style={styles.list}
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
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  refreshText: {
    textAlign: 'center',
    color: '#007bff',
    marginBottom: 20,
  },
  list: {
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  cardData: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default HistorialPage;