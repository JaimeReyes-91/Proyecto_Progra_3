document.addEventListener("DOMContentLoaded", () => {
    protegerSesion();
    prepararNavegacion();
    prepararFormulario();
});

function protegerSesion() {
    const usuarioId = localStorage.getItem("usuarioId");
    const rol = localStorage.getItem("rol");

    if (!usuarioId) {
        window.location.href = "login.html";
        return;
    }

    if (rol !== "SOLICITANTE") {
        window.location.href = "dashboardSoporte.html";
    }
}

function prepararNavegacion() {
    const nombre = localStorage.getItem("nombre") || "Usuario";
    const rol    = localStorage.getItem("rol") || "";

    const usuarioActivo = document.getElementById("usuarioActivo");

    if (usuarioActivo) {
        usuarioActivo.textContent = `${nombre} · ${rol}`;
    }

    const linkDashboard = document.getElementById("linkDashboard");
    if (linkDashboard) {
        linkDashboard.href = "dashboardSolicitante.html";
    }

    const toggleSidebar = document.getElementById("toggleSidebar");
    if (toggleSidebar) {
        toggleSidebar.addEventListener("click", () => {
            document.getElementById("sidebar").classList.toggle("collapsed");
        });
    }

    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
        logoutLink.addEventListener("click", cerrarSesion);
    }
}

function prepararFormulario() {
    const creadoPor = document.getElementById("creadoPor");
    if (creadoPor) {
        creadoPor.value = localStorage.getItem("usuarioId") || "";
    }

    const ticketForm = document.getElementById("ticketForm");
    if (ticketForm) {
        ticketForm.addEventListener("submit", crearTicket);
    }

    const archivo = document.getElementById("archivo");
    if (archivo) {
        archivo.addEventListener("change", function () {
            const nombre = this.files[0]?.name || "Ningún archivo seleccionado";
            document.getElementById("nombreArchivo").textContent = nombre;
        });
    }
}

async function crearTicket(event) {
    event.preventDefault();

    const descripcion = document.getElementById("descripcion").value.trim();
    const creadoPor   = parseInt(document.getElementById("creadoPor").value, 10);
    const archivo     = document.getElementById("archivo").files[0];

    if (!descripcion) {
        mostrarMensaje("La descripción es obligatoria", "error");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("descripcion", descripcion);
        formData.append("creadoPor", creadoPor);
        if (archivo) {
            formData.append("archivo", archivo);
        }

        const response = await fetch(API_URL + "/tickets", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "No se pudo crear el ticket");
        }

        document.getElementById("ticketForm").reset();
        document.getElementById("nombreArchivo").textContent = "Ningún archivo seleccionado";
        document.getElementById("creadoPor").value = localStorage.getItem("usuarioId") || "";

        mostrarMensaje("✅ Ticket creado correctamente", "ok");

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById("mensaje");
    if (!mensaje) return;
    mensaje.textContent = texto;
    mensaje.className = texto ? `message show ${tipo}` : "message";
}

function cerrarSesion(event) {
    event.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
}

// — modales (necesarios si se reutilizan desde dashboard) —
function cerrarModal() {
    document.getElementById("modalTimeline")?.classList.remove("activo");
}

function cerrarModalObs() {
    document.getElementById("modalObservacion")?.classList.remove("activo");
}
