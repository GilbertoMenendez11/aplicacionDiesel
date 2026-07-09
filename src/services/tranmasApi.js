// src/services/tranmasApi.js
// IMPORTANTE: Recuerda instalar 'react-native-dotenv' si usarás variables de entorno.
// Por ahora, como prueba, podrías poner la contraseña directamente, pero el manual
// recomienda encarecidamente usar un archivo .env[cite: 308].

const BASE_URL = 'https://tranmas.xyz/api';
const TRANMAS_USER = 'vigilante';
const TRANMAS_PASS = 'vigilanteCM'; // Reemplaza con la contraseña real 

// Paso 1 - Login en TRANMAS
// Paso 1 - Login en TRANMAS
export async function loginTranmas() { 
    try {
        console.log("Intentando conectar con TRANMAS...");
        const res = await fetch(`${BASE_URL}/login`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ username: TRANMAS_USER, password: TRANMAS_PASS }) 
        });
        
        const data = await res.json();
        console.log("Respuesta del servidor TRANMAS:", data); // <--- ESPÍAMOS LA RESPUESTA
        
        if (!res.ok) throw new Error(data.message || 'Error al loguear'); 
        
        // El manual dice "user id" en el JSON, pero luego usa data.user_id. 
        // Vamos a asegurar de agarrar cualquiera de los dos
        const id = data.user_id || data["user id"]; 
        console.log("ID obtenido:", id);
        
        return id;
    } catch (error) {
        console.error("Error en loginTranmas:", error.message);
        throw error;
    }
}

// Paso 2 - Ver listado de accidentes
export async function getAccidentes(tranmasUserId, filtros = {}) { // [cite: 230]
    const params = new URLSearchParams({ user_id: tranmasUserId, ...filtros }); // [cite: 231]
    const res = await fetch(`${BASE_URL}/accidentes?${params}`); // [cite: 234]
    
    if (res.status === 403) throw new Error('Sin autorización'); // [cite: 234]
    if (!res.ok) throw new Error('Error al obtener accidentes'); // [cite: 235]
    
    return res.json(); // [cite: 235]
}

// Paso 3 - Registrar un accidente
export async function registrarAccidente(tranmasUserId, datos, fotos = []) { // [cite: 259]
    const formData = new FormData(); // [cite: 260]
    
    formData.append('user_id', String(tranmasUserId)); // Obligatorio [cite: 261]
    formData.append('equipo', datos.equipo); // [cite: 262]
    formData.append('lugar_accidente', datos.lugar); // [cite: 263]
    formData.append('descripcion', datos.descripcion || ''); // [cite: 264]
    formData.append('fecha_registro', datos.fecha); // Formato 'YYYY-MM-DD' [cite: 265]

    // Fotos opcionales (máximo 3) [cite: 266]
    fotos.slice(0, 3).forEach((foto, i) => { // [cite: 267]
        formData.append(`foto${i + 1}`, { // [cite: 268]
            uri: foto.uri, // [cite: 270]
            name: foto.fileName || `foto${i + 1}.jpg`, // [cite: 271]
            type: foto.type || 'image/jpeg', // [cite: 273]
        });
    });

    const res = await fetch(`${BASE_URL}/accidentes`, { // [cite: 274]
        method: 'POST', // [cite: 275]
        body: formData, // [cite: 276]
        // NO pongas Content-Type manualmente [cite: 277]
    });

    if (res.status == 403) throw new Error('Sin autorización'); // [cite: 279]
    if (!res.ok) { // [cite: 279]
        const err = await res.json().catch(() => ({})); // [cite: 282]
        throw new Error(err.error || 'Error al registrar'); // [cite: 283]
    }
    
    return res.json(); // [cite: 284]
}