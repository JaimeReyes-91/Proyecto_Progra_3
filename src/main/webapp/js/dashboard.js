document.addEventListener("DOMContentLoaded", () => {
    protegerSesion();
    prepararNavegacion();
    cargarDashboard();
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

async function cargarDashboard() {
    try {
        const response = await fetch(API_URL + "/tickets");

        if (!response.ok) {
            throw new Error("No se pudieron cargar los tickets");
        }

        const tickets = await response.json();

        mostrarResumen(tickets);
        mostrarRecientes(tickets.slice(0, 8));
    } catch (error) {
        console.error(error);
        mostrarRecientes([]);
    }
}

function mostrarResumen(tickets) {
    const conteo = tickets.reduce((acc, ticket) => {
        acc.total += 1;
        acc[ticket.estadoActual] = (acc[ticket.estadoActual] || 0) + 1;
        return acc;
    }, { total: 0 });

    document.getElementById("totalTickets").textContent = conteo.total;
    document.getElementById("ticketsCreados").textContent = conteo.CREADO || 0;
    document.getElementById("ticketsAsignados").textContent = conteo.ASIGNADO || 0;
    document.getElementById("ticketsValidacion").textContent = conteo.VALIDACION || 0;
    document.getElementById("ticketsCerrados").textContent =
        (conteo.FINALIZADO || 0) + (conteo.RECHAZADO || 0);
}

function mostrarRecientes(tickets) {
    const tabla = document.getElementById("tablaRecientes");

    if (!tickets.length) {
        tabla.innerHTML = `<tr><td class="empty" colspan="4">No hay tickets para mostrar.</td></tr>`;
        return;
    }

    tabla.innerHTML = tickets.map(ticket => `
        <tr>
            <td>${escapar(ticket.codigo || "-")}</td>
            <td>${escapar(ticket.descripcion || "-")}</td>
            <td><span class="badge ${ticket.estadoActual}">${formatearEstado(ticket.estadoActual)}</span></td>
            <td>${ticket.creadoPor || "-"}</td>
        </tr>
    `).join("");
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
