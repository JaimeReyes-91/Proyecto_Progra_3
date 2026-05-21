document.addEventListener("DOMContentLoaded", () => {

    protegerSesion();
    prepararNavegacion();
    cargarDashboard();

});

function protegerSesion() {

    const usuarioId = localStorage.getItem("usuarioId");
    const rol = localStorage.getItem("rol");

    if (!usuarioId) {

        window.location.href = "login.html";
        return;

    }

    // Solo soporte puede entrar aquí
    if (rol !== "SOPORTE") {

        window.location.href = "dashboardSolicitante.html";

    }

}

function prepararNavegacion() {

    const nombre = localStorage.getItem("nombre") || "Usuario";
    const rol = localStorage.getItem("rol") || "";

    document.getElementById("usuarioNombre").textContent = nombre;
    document.getElementById("usuarioRol").textContent = rol;

    const iniciales = nombre
        .split(" ")
        .map(p => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    document.getElementById("usuarioAvatar").textContent = iniciales;

    const logoutLink = document.getElementById("logoutLink");

    if (logoutLink) {
        logoutLink.addEventListener("click", cerrarSesion);
    }

    const toggleSidebar = document.getElementById("toggleSidebar");

    if (toggleSidebar) {

        toggleSidebar.addEventListener("click", () => {

            document
                .getElementById("sidebar")
                .classList
                .toggle("collapsed");

        });

    }

}

async function cargarDashboard() {

    try {

        const response = await fetch(API_URL + "/tickets");

        if (!response.ok) {

            throw new Error("No se pudieron cargar los tickets");

        }

        const tickets = await response.json();

        const usuarioId = parseInt(
            localStorage.getItem("usuarioId"),
            10
        );

        // Tickets nuevos para revisión
        const nuevos = tickets.filter(
            t => t.estadoActual === "CREADO"
        );

        // Tickets asignados al técnico actual
        const asignados = tickets.filter(
            t =>
                t.estadoActual === "ASIGNADO" &&
                t.asignadoA === usuarioId
        );

        // Tickets enviados a validación
        const validacion = tickets.filter(
            t =>
                t.estadoActual === "VALIDACION" &&
                t.asignadoA === usuarioId
        );

        // Tickets devueltos por el solicitante
        const devueltos = tickets.filter(
            t =>
                t.estadoActual === "DEVUELTO" &&
                t.asignadoA === usuarioId
        );

        document.getElementById("ticketsNuevos").textContent =
            nuevos.length;

        document.getElementById("ticketsAsignados").textContent =
            asignados.length;

        document.getElementById("ticketsValidacion").textContent =
            validacion.length;

        document.getElementById("ticketsDevueltos").textContent =
            devueltos.length;

        renderTablaNuevos(nuevos);

        renderMisTickets([
            ...asignados,
            ...validacion,
            ...devueltos
        ]);

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "No se pudieron cargar los tickets",
            "error"
        );

    }

}

function renderTablaNuevos(tickets) {

    const tabla = document.getElementById("tablaNuevos");

    if (!tickets.length) {

        tabla.innerHTML = `
            <tr>
                <td colspan="4" class="empty">
                    No hay tickets nuevos.
                </td>
            </tr>
        `;

        return;

    }

    tabla.innerHTML = tickets.map(ticket => `

        <tr>

            <td>${escapar(ticket.codigo || "-")}</td>

            <td>${escapar(ticket.descripcion || "-")}</td>

            <td>${escapar(ticket.creadoPorNombre || "Sin nombre")}</td>

            <td class="actions">

                <button
                    class="btn small"
                    onclick="aceptarTicket(${ticket.id})"
                >
                    Aceptar
                </button>

                <button
                    class="btn small danger"
                    onclick="rechazarTicket(${ticket.id})"
                >
                    Rechazar
                </button>

            </td>

        </tr>

    `).join("");

}

function renderMisTickets(tickets) {

    const tabla = document.getElementById("tablaMisTickets");

    if (!tickets.length) {

        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No tiene tickets asignados.
                </td>
            </tr>
        `;

        return;

    }

    tabla.innerHTML = tickets.map(ticket => `

        <tr>

            <td>${escapar(ticket.codigo || "-")}</td>

            <td>
                <span class="badge ${ticket.estadoActual}">
                    ${formatearEstado(ticket.estadoActual)}
                </span>
            </td>

            <td>${escapar(ticket.descripcion || "-")}</td>

            <td>${escapar(ticket.creadoPorNombre || "-")}</td>

            <td class="actions">

                ${renderAccionTicket(ticket)}

            </td>

        </tr>

    `).join("");

}

function renderAccionTicket(ticket) {

    // Solo tickets ASIGNADO o DEVUELTO
    // pueden volver a VALIDACION

    if (
        ticket.estadoActual === "ASIGNADO" ||
        ticket.estadoActual === "DEVUELTO"
    ) {

        return `
            <button
                class="btn small secondary"
                onclick="enviarValidacion(${ticket.id})"
            >
                Enviar a validación
            </button>
        `;

    }

    // VALIDACION ya no puede modificarse
    return `
        <span class="text-muted">
            En espera del solicitante
        </span>
    `;

}

async function aceptarTicket(id) {

    const actorId = localStorage.getItem("usuarioId");

    try {

        const response = await fetch(
            `${API_URL}/tickets/${id}/ASIGNADO/${actorId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    observacion: "Ticket aceptado y asignado al técnico"
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error || "No se pudo aceptar el ticket"
            );

        }

        mostrarMensaje(
            "Ticket aceptado correctamente",
            "ok"
        );

        await cargarDashboard();

    } catch (error) {

        console.error(error);

        mostrarMensaje(error.message, "error");

    }

}

async function rechazarTicket(id) {

    const actorId = localStorage.getItem("usuarioId");

    const observacion = prompt(
        "Ingrese la observación del rechazo:"
    );

    if (!observacion || observacion.trim() === "") {

        mostrarMensaje(
            "La observación es obligatoria",
            "error"
        );

        return;

    }

    try {

        const response = await fetch(
            `${API_URL}/tickets/${id}/RECHAZADO/${actorId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    observacion: observacion.trim()
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error || "No se pudo rechazar el ticket"
            );

        }

        mostrarMensaje(
            "Ticket rechazado correctamente",
            "ok"
        );

        await cargarDashboard();

    } catch (error) {

        console.error(error);

        mostrarMensaje(error.message, "error");

    }

}

async function enviarValidacion(id) {

    const actorId = localStorage.getItem("usuarioId");

    const observacion = prompt(
        "Describa la solución aplicada:"
    );

    if (!observacion || observacion.trim() === "") {

        mostrarMensaje(
            "Debe describir la solución aplicada",
            "error"
        );

        return;

    }

    try {

        const response = await fetch(
            `${API_URL}/tickets/${id}/VALIDACION/${actorId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    observacion: observacion.trim()
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "No se pudo enviar a validación"
            );

        }

        mostrarMensaje(
            "Ticket enviado a validación",
            "ok"
        );

        await cargarDashboard();

    } catch (error) {

        console.error(error);

        mostrarMensaje(error.message, "error");

    }

}

function mostrarMensaje(texto, tipo) {

    const mensaje = document.getElementById("mensaje");

    if (!mensaje) return;

    mensaje.textContent = texto;

    mensaje.className = texto
        ? `message show ${tipo}`
        : "message";

}

function formatearEstado(estado) {

    return String(estado || "")
        .replaceAll("_", " ");

}

function escapar(valor) {

    return String(valor || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

function cerrarSesion(event) {

    event.preventDefault();

    localStorage.clear();

    window.location.href = "login.html";

}