document.addEventListener("DOMContentLoaded", verificarBackend);


//Hace una petición de prueba al backend y muestra si la conexión está funcionando.

async function verificarBackend() {
    const estado = document.getElementById("estadoBackend");

    try {
        const response = await fetch(API_URL + "/test");

        if (!response.ok) {
            estado.textContent = "El backend respondió con error.";
            return;
        }

        estado.textContent = "Backend conectado correctamente.";
    } catch (error) {
        console.error(error);
        estado.textContent = "No se pudo conectar con el backend.";
    }
}
