import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function UserPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil de Operador</Text>
      <Text style={styles.info}>Nombre: {global.nombreUsuario || 'Cargando...'}</Text>
      <Text style={styles.info}>Rol: Operador</Text>
      <Text style={styles.info}>Función: Solo Registro de Cargas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 80,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2c3e50',
    },
    info: {
        fontSize: 16,
        marginBottom: 10,
        color: '#555',
    }
});

export default UserPage;