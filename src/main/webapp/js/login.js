// Al cargar la página verifica si ya hay sesión activa
document.addEventListener("DOMContentLoaded", () => {
 
    const form = document.getElementById("loginForm");
 
    const usuarioId = localStorage.getItem("usuarioId");
 
    // Si ya existe una sesión, pregunta si desea ir al dashboard
    if (usuarioId) {
 
        const irDashboard = confirm(
            "Ya existe una sesión iniciada. ¿Desea ir al dashboard?"
        );
 
        if (irDashboard) {
 
            // Redirige según el rol guardado en localStorage
            redirigirSegunRol(
                localStorage.getItem("rol")
            );
 
            return;
        }
    }
 
    // Si no hay sesión, escucha el envío del formulario
    form.addEventListener("submit", login);
 
});
 
// Maneja el inicio de sesión enviando credenciales al backend
async function login(event) {
 
    event.preventDefault();
 
    const correo = document
        .getElementById("correo")
        .value
        .trim();
 
    const contrasena = document
        .getElementById("contrasena")
        .value;
 
    mostrarMensaje("", "");
 
    try {
 
        // Envía correo y contraseña al endpoint de autenticación
        const response = await fetch(
            API_URL + "/auth/login",
            {
                method: "POST",
 
                headers: {
                    "Content-Type": "application/json"
                },
 
                body: JSON.stringify({
                    correo,
                    contrasena
                })
            }
        );
 
        const data = await response.json();
 
        // Si el backend rechaza las credenciales, muestra el error
        if (!response.ok || !data.autenticado) {
 
            mostrarMensaje(
                data.mensaje || "No se pudo iniciar sesión",
                "error"
            );
 
            return;
        }
 
        // Guarda los datos del usuario en localStorage para usarlos en otras páginas
        localStorage.setItem(
            "usuarioId",
            data.usuarioId
        );
 
        localStorage.setItem(
            "nombre",
            data.nombre || correo
        );
 
        localStorage.setItem(
            "correo",
            data.correo || correo
        );
 
        localStorage.setItem(
            "rol",
            data.rol
        );
 
        // Redirige al dashboard correspondiente según el rol
        redirigirSegunRol(data.rol);
 
    } catch (error) {
 
        // Si no se puede conectar con el servidor muestra el error
        console.error(error);
 
        mostrarMensaje(
            "No se pudo conectar con el backend",
            "error"
        );
 
    }
 
}
 
// Redirige a la página correcta según el rol del usuario
function redirigirSegunRol(rol) {
 
    switch (rol) {
 
        case "SOLICITANTE":
 
            window.location.href =
                "dashboardSolicitante.html";
 
            break;
 
        case "SOPORTE":
 
            window.location.href =
                "dashboardSoporte.html";
 
            break;
 
        // Si el rol no es reconocido vuelve al login
        default:
 
            window.location.href =
                "login.html";
 
    }
 
}
 
// Muestra u oculta el mensaje de error o éxito debajo del formulario
function mostrarMensaje(texto, tipo) {
 
    const mensaje = document.getElementById("mensaje");
 
    mensaje.textContent = texto;
 
    mensaje.className = texto
        ? `message show ${tipo}`
        : "message";
 
}