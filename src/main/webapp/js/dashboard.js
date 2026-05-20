let ticketsData = [];

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
    const linkUsuarios = document.getElementById("linkUsuarios");
    const logoutLink = document.getElementById("logoutLink");

    const iniciales = nombre.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();

    document.getElementById("usuarioAvatar").textContent = iniciales;
    document.getElementById("usuarioNombre").textContent = nombre;
    document.getElementById("usuarioRol").textContent = rol;

    document.getElementById("toggleSidebar").addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("collapsed");
    });

    if (rol !== "SOPORTE" && linkUsuarios) {
        linkUsuarios.style.display = "none";
    }

    logoutLink.addEventListener("click", cerrarSesion);
}

async function cargarDashboard() {
    try {
        const response = await fetch(API_URL + "/tickets");

        if (!response.ok) throw new Error("No se pudieron cargar los tickets");

        ticketsData = await response.json();

        mostrarResumen(ticketsData);
        mostrarRecientes(ticketsData.slice(0, 8));
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
        tabla.innerHTML = `<tr><td class="empty" colspan="5">No hay tickets para mostrar.</td></tr>`;
        return;
    }

    tabla.innerHTML = tickets.map(ticket => `
        <tr>
            <td>${escapar(ticket.codigo || "-")}</td>
            <td>${escapar(ticket.descripcion || "-")}</td>
            <td><span class="badge ${ticket.estadoActual}">${formatearEstado(ticket.estadoActual)}</span></td>
            <td>${ticket.creadoPor || "-"}</td>
			<td>
			                <button class="btn small secondary" onclick="verTimeline(${ticket.id}, '${escapar(ticket.codigo)}')">
			                    🕓 Timeline
			                </button>
			            </td>
        </tr>
    `).join("");
}


async function verTimeline(ticketId, codigo) {
    try {
        const response = await fetch(`${API_URL}/timeline/${ticketId}`);

        if (!response.ok) throw new Error("No se pudo cargar el timeline");

        const eventos = await response.json();

        document.getElementById("modalTitulo").textContent = `Timeline — ${codigo}`;

        document.getElementById("modalContenido").innerHTML = eventos.length
            ? eventos.map(e => `
                <div class="timeline-item">
                    <div class="timeline-dot ${e.estado}"></div>
                    <div class="timeline-info">
                        <span class="timeline-fecha">${formatearFecha(e.fechaEvento)}</span>
                        <strong class="timeline-estado">${formatearEstado(e.estado)}</strong>
                        <span class="timeline-obs">${escapar(e.observacion || "Sin observación")}</span>
                    </div>
                </div>
            `).join("")
            : "<p>No hay eventos registrados.</p>";

        document.getElementById("modalTimeline").style.display = "flex";

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return "";
    // viene como "2026-05-19T10:00:00"
    const [fecha, hora] = fechaStr.split("T");
    const horaCorta = hora ? hora.substring(0, 5) : "";
    return `${fecha} ${horaCorta}`;
}

function cerrarModal() {
    document.getElementById("modalTimeline").style.display = "none";
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
