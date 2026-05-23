// Al cargar la página inicializa la sesión, navegación y formulario
document.addEventListener("DOMContentLoaded", () => {
    protegerSesion();
    prepararNavegacion();
    prepararFormulario();
});
 
// Verifica que haya una sesión activa y que el usuario sea SOLICITANTE
function protegerSesion() {
    const usuarioId = localStorage.getItem("usuarioId");
    const rol = localStorage.getItem("rol");
 
    // Si no hay sesión redirige al login
    if (!usuarioId) {
        window.location.href = "login.html";
        return;
    }
 
    // Si el usuario no es solicitante lo manda al dashboard de soporte
    if (rol !== "SOLICITANTE") {
        window.location.href = "dashboardSoporte.html";
    }
}
 
// Muestra el nombre, rol e iniciales del usuario en el header y configura el sidebar
function prepararNavegacion() {
    const nombre = localStorage.getItem("nombre") || "Usuario";
    const rol    = localStorage.getItem("rol") || "";
 
    const usuarioActivo = document.getElementById("usuarioActivo");
 
    // Muestra el nombre y rol en el header
    document.getElementById("usuarioNombre").textContent = nombre;
    document.getElementById("usuarioRol").textContent    = rol;
 
    // Genera las iniciales tomando la primera letra de cada palabra del nombre
    const iniciales = nombre
        .split(" ")
        .map(p => p[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
 
    document.getElementById("usuarioAvatar").textContent = iniciales;
 
    if (usuarioActivo) {
        usuarioActivo.textContent = `${nombre} · ${rol}`;
    }
 
    // Asegura que el link del dashboard apunte al dashboard del solicitante
    const linkDashboard = document.getElementById("linkDashboard");
    if (linkDashboard) {
        linkDashboard.href = "dashboardSolicitante.html";
    }
 
    // Permite colapsar o expandir el sidebar al hacer click en el botón
    const toggleSidebar = document.getElementById("toggleSidebar");
    if (toggleSidebar) {
        toggleSidebar.addEventListener("click", () => {
            document.getElementById("sidebar").classList.toggle("collapsed");
        });
    }
 
    // Conecta el link de salir con la función de cerrar sesión
    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
        logoutLink.addEventListener("click", cerrarSesion);
    }
}
 
// Prepara el formulario con el id del usuario y escucha los eventos de envío y archivo
function prepararFormulario() {
 
    // Rellena el campo oculto con el id del usuario logueado
    const creadoPor = document.getElementById("creadoPor");
    if (creadoPor) {
        creadoPor.value = localStorage.getItem("usuarioId") || "";
    }
 
    // Conecta el formulario con la función de crear ticket
    const ticketForm = document.getElementById("ticketForm");
    if (ticketForm) {
        ticketForm.addEventListener("submit", crearTicket);
    }
 
    // Muestra el nombre del archivo seleccionado cuando el usuario elige uno
    const archivo = document.getElementById("archivo");
    if (archivo) {
        archivo.addEventListener("change", function () {
            const nombre = this.files[0]?.name || "Ningún archivo seleccionado";
            document.getElementById("nombreArchivo").textContent = nombre;
        });
    }
}
 
// Recoge los datos del formulario y envía el ticket al backend
async function crearTicket(event) {
    event.preventDefault();
 
    const descripcion = document.getElementById("descripcion").value.trim();
    const creadoPor   = parseInt(document.getElementById("creadoPor").value, 10);
    const archivo     = document.getElementById("archivo").files[0];
 
    // Valida que la descripción no esté vacía antes de enviar
    if (!descripcion) {
        mostrarMensaje("La descripción es obligatoria", "error");
        return;
    }
 
    try {
 
        // Usa FormData porque puede incluir un archivo adjunto
        const formData = new FormData();
        formData.append("descripcion", descripcion);
        formData.append("creadoPor", creadoPor);
 
        // Solo agrega el archivo si el usuario seleccionó uno
        if (archivo) {
            formData.append("archivo", archivo);
        }
 
        // Envía el ticket al backend
        const response = await fetch(API_URL + "/tickets", {
            method: "POST",
            body: formData
        });
 
        const data = await response.json();
 
        // Si el backend rechaza la solicitud lanza el error recibido
        if (!response.ok) {
            throw new Error(data.error || "No se pudo crear el ticket");
        }
 
        // Limpia el formulario y restaura los valores por defecto
        document.getElementById("ticketForm").reset();
        document.getElementById("nombreArchivo").textContent = "Ningún archivo seleccionado";
        document.getElementById("creadoPor").value = localStorage.getItem("usuarioId") || "";
 
        mostrarMensaje("Ticket creado correctamente", "ok");
 
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}
 
// Muestra u oculta el mensaje de éxito o error debajo del formulario
function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById("mensaje");
    if (!mensaje) return;
    mensaje.textContent = texto;
    mensaje.className = texto ? `message show ${tipo}` : "message";
}
 
// Limpia el localStorage y redirige al login al cerrar sesión
function cerrarSesion(event) {
    event.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
}
 
// Cierra el modal del timeline quitándole la clase activo
function cerrarModal() {
    document.getElementById("modalTimeline")?.classList.remove("activo");
}
 
// Cierra el modal de observación quitándole la clase activo
function cerrarModalObs() {
    document.getElementById("modalObservacion")?.classList.remove("activo");
}
