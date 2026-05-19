let tickets = [];

const transiciones = {
    CREADO: ["ASIGNADO", "RECHAZADO"],
    ASIGNADO: ["VALIDACION", "RECHAZADO"],
    VALIDACION: ["FINALIZADO", "DEVUELTO"],
    DEVUELTO: ["ASIGNADO"],
    FINALIZADO: [],
    RECHAZADO: []
};

document.addEventListener("DOMContentLoaded", () => {
    protegerSesion();
    prepararNavegacion();
    prepararFormulario();
    listarTickets();
});

function protegerSesion() {
    if (!localStorage.getItem("usuarioId")) {
        window.location.href = "login.html";
    }
}

function prepararNavegacion() {
    const nombre = localStorage.getItem("nombre") || "Usuario";
    const rol = localStorage.getItem("rol") || "";
    const usuarioActivo = document.getElementById("usuarioActivo");
    const linkUsuarios = document.getElementById("linkUsuarios");
    const logoutLink = document.getElementById("logoutLink");

    usuarioActivo.textContent = `${nombre} · ${rol}`;

    if (rol !== "SOPORTE" && linkUsuarios) {
        linkUsuarios.style.display = "none";
    }

    logoutLink.addEventListener("click", cerrarSesion);
}

function prepararFormulario() {
    const usuarioId = localStorage.getItem("usuarioId");
    const creadoPor = document.getElementById("creadoPor");
    const filtro = document.getElementById("filtroTickets");

    creadoPor.value = usuarioId || "";

    document.getElementById("ticketForm").addEventListener("submit", crearTicket);
    filtro.addEventListener("input", renderTickets);
}

async function listarTickets() {
    try {
        const response = await fetch(API_URL + "/tickets");

        if (!response.ok) {
            throw new Error("No se pudieron cargar los tickets");
        }

        tickets = await response.json();
        renderTickets();
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo conectar con tickets", "error");
    }
}

function renderTickets() {
    const tabla = document.getElementById("tablaTickets");
    const filtro = document.getElementById("filtroTickets").value.trim().toLowerCase();
    const visibles = tickets.filter(ticket => {
        const texto = [
            ticket.codigo,
            ticket.descripcion,
            ticket.estadoActual,
            ticket.creadoPor
        ].join(" ").toLowerCase();

        return texto.includes(filtro);
    });

    if (!visibles.length) {
        tabla.innerHTML = `<tr><td class="empty" colspan="5">No hay tickets para mostrar.</td></tr>`;
        return;
    }

    tabla.innerHTML = visibles.map(ticket => `
        <tr>
            <td>${escapar(ticket.codigo || "-")}</td>
            <td>${escapar(ticket.descripcion || "-")}</td>
            <td><span class="badge ${ticket.estadoActual}">${formatearEstado(ticket.estadoActual)}</span></td>
            <td>${ticket.creadoPor || "-"}</td>
            <td>
                <div class="actions">
                    ${botonesEstado(ticket)}
                    <button class="btn small danger" type="button" onclick="eliminarTicket(${ticket.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function botonesEstado(ticket) {
    return (transiciones[ticket.estadoActual] || []).map(estado => `
        <button class="btn small secondary" type="button" onclick="cambiarEstado(${ticket.id}, '${estado}')">
            ${formatearEstado(estado)}
        </button>
    `).join("");
}

async function crearTicket(event) {
    event.preventDefault();

    const descripcion = document.getElementById("descripcion").value.trim();
    const creadoPor = parseInt(document.getElementById("creadoPor").value, 10);

    mostrarMensaje("", "");

    try {
        const response = await fetch(API_URL + "/tickets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                descripcion,
                creadoPor
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "No se pudo crear el ticket");
        }

        document.getElementById("ticketForm").reset();
        document.getElementById("creadoPor").value = localStorage.getItem("usuarioId") || "";
        mostrarMensaje("Ticket creado correctamente", "ok");
        await listarTickets();
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

async function cambiarEstado(id, estado) {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}/${estado}`, {
            method: "PUT"
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "No se pudo actualizar el estado");
        }

        mostrarMensaje("Estado actualizado", "ok");
        await listarTickets();
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

async function eliminarTicket(id) {
    if (!confirm("¿Eliminar este ticket?")) {
        return;
    }

    try {
        const response = await fetch(API_URL + "/tickets/" + id, {
            method: "DELETE"
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "No se pudo eliminar el ticket");
        }

        mostrarMensaje("Ticket eliminado", "ok");
        await listarTickets();
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById("mensaje");

    mensaje.textContent = texto;
    mensaje.className = texto ? `message show ${tipo}` : "message";
}

function formatearEstado(estado) {
    return String(estado || "").replace("_", " ");
}

function escapar(valor) {
    return String(valor)
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
