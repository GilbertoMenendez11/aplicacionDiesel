// src/services/tranmasApi.js
// IMPORTANTE: Recuerda instalar 'react-native-dotenv' si usarás variables de entorno.
// Por ahora, como prueba, podrías poner la contraseña directamente, pero el manual
// recomienda encarecidamente usar un archivo .env[cite: 308].

const BASE_URL = 'https://tranmas.xyz/api'; // [cite: 182]
const TRANMAS_USER = 'vigilante'; // [cite: 183]
const TRANMAS_PASS = 'vigilanteCM'; // Reemplaza con la contraseña real 

// Paso 1 - Login en TRANMAS
export async function loginTranmas() { // [cite: 185]
    const res = await fetch(`${BASE_URL}/login`, { // [cite: 189]
        method: 'POST', // [cite: 190]
        headers: { 'Content-Type': 'application/json' }, // [cite: 191]
        body: JSON.stringify({ username: TRANMAS_USER, password: TRANMAS_PASS }) // [cite: 192]
    });
    
    if (!res.ok) throw new Error('No se pudo conectar con TRANMAS'); // [cite: 194]
    
    const data = await res.json();
    return data.user_id; // Esto devuelve el ID entero que necesitamos [cite: 195]
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