let tickets      = [];
let mapaUsuarios = {};
let ticketPendiente  = null;
let estadoPendiente  = null;

document.addEventListener("DOMContentLoaded", () => {
    protegerSesion();
    prepararNavegacion();
    prepararFiltros();
    cargarTickets();
});

// ─────────────────────────────────────────
// SESIÓN
// ─────────────────────────────────────────
function protegerSesion() {
    const usuarioId = localStorage.getItem("usuarioId");
    const rol       = localStorage.getItem("rol");

    if (!usuarioId) {
        window.location.href = "login.html";
        return;
    }

    if (rol !== "SOPORTE") {
        window.location.href = "dashboardSolicitante.html";
    }
}

// ─────────────────────────────────────────
// NAVEGACIÓN
// ─────────────────────────────────────────
function prepararNavegacion() {
    const nombre = localStorage.getItem("nombre") || "Usuario";
    const rol    = localStorage.getItem("rol") || "";

    document.getElementById("usuarioNombre").textContent = nombre;
    document.getElementById("usuarioRol").textContent    = rol;

    const iniciales = nombre
        .split(" ")
        .map(p => p[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    document.getElementById("usuarioAvatar").textContent = iniciales;

    document
        .getElementById("logoutLink")
        .addEventListener("click", cerrarSesion);

    document
        .getElementById("toggleSidebar")
        .addEventListener("click", () => {
            document.getElementById("sidebar").classList.toggle("collapsed");
        });
}

// ─────────────────────────────────────────
// FILTROS
// ─────────────────────────────────────────
function prepararFiltros() {
    document.getElementById("filtroTexto").addEventListener("input",  renderTickets);
    document.getElementById("filtroEstado").addEventListener("change", renderTickets);
}

// ─────────────────────────────────────────
// CARGA PRINCIPAL
// ─────────────────────────────────────────
async function cargarTickets() {
    try {
        const [resTickets, resUsuarios] = await Promise.all([
            fetch(API_URL + "/tickets"),
            fetch(API_URL + "/usuarios")
        ]);

        if (!resTickets.ok) throw new Error("No se pudieron cargar los tickets");

        tickets = await resTickets.json();

        // Construye el mapa id → nombre para resolver solicitantes
        if (resUsuarios.ok) {
            const usuarios = await resUsuarios.json();
            mapaUsuarios   = {};
            usuarios.forEach(u => mapaUsuarios[u.id] = u.nombre);
        }

        // Carga los archivos adjuntos de cada ticket
        await Promise.all(tickets.map(async ticket => {
            try {
                const res      = await fetch(`${API_URL}/archivos/ticket/${ticket.id}`);
                ticket.archivos = res.ok ? await res.json() : [];
            } catch {
                ticket.archivos = [];
            }
        }));

        renderTickets();

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

// ─────────────────────────────────────────
// TABLA
// ─────────────────────────────────────────
function renderTickets() {
    const tabla       = document.getElementById("tablaTickets");
    const filtroTexto = document.getElementById("filtroTexto").value.trim().toLowerCase();
    const filtroEstado = document.getElementById("filtroEstado").value;
    const usuarioId   = parseInt(localStorage.getItem("usuarioId"), 10);

    const visibles = tickets.filter(ticket => {

        const texto = `
            ${ticket.codigo}
            ${ticket.descripcion}
            ${ticket.estadoActual}
        `.toLowerCase();

        const coincideTexto  = texto.includes(filtroTexto);
        const coincideEstado = !filtroEstado || ticket.estadoActual === filtroEstado;

        // CREADO visible para todos; el resto solo si está asignado al técnico actual
        const visible =
            ticket.estadoActual === "CREADO" ||
            (
                Number(ticket.asignadoA) === usuarioId &&
                (
                    ticket.estadoActual === "ASIGNADO"   ||
                    ticket.estadoActual === "VALIDACION" ||
                    ticket.estadoActual === "DEVUELTO"   ||
                    ticket.estadoActual === "FINALIZADO" ||
                    ticket.estadoActual === "RECHAZADO"
                )
            );

        return coincideTexto && coincideEstado && visible;
    });

    if (!visibles.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    No hay tickets disponibles.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = visibles.map(ticket => `
        <tr>
            <td>${escapar(ticket.codigo)}</td>
            
            <td>${escapar(ticket.descripcion)}</td>

			<td>
                <span class="badge ${ticket.estadoActual} S">
                    ${formatearEstado(ticket.estadoActual)}
                </span>
            </td>
						
            <!-- Nombre del solicitante resuelto desde el mapa de usuarios -->
            <td>${escapar(obtenerNombreSolicitante(ticket.creadoPor))}</td>

            <td>
                <button
                    class="btn small secondary"
                    onclick="verTimeline(${ticket.id}, '${ticket.codigo}')"
                >
                    <i class="fa-solid fa-clock-rotate-left"></i>
                </button>
            </td>

            <td>
                ${ticket.archivos && ticket.archivos.length
                    ? ticket.archivos.map(a => `
                        <a class="btn small secondary"
                           href="${API_URL}/archivos/download/${a.id}"
                           target="_blank">
                            <img src="img/carpetas_1.png" alt="Archivo" class="icono-timeline">
                        </a>`).join("")
                    : "-"
                }
            </td>

            <td class="actions">
                ${renderAcciones(ticket)}
            </td>
        </tr>
    `).join("");
}

// ─────────────────────────────────────────
// ACCIONES POR ESTADO
// ─────────────────────────────────────────
function renderAcciones(ticket) {
    switch (ticket.estadoActual) {

        case "CREADO":
            return `
                <button class="btn small"
                        onclick="abrirModalEstado(${ticket.id}, 'ASIGNADO')">
                    Aceptar
                </button>
                <button class="btn small danger"
                        onclick="abrirModalEstado(${ticket.id}, 'RECHAZADO')">
                    Rechazar
                </button>
            `;

        case "ASIGNADO":
            return `
                <button class="btn small secondary"
                        onclick="abrirModalEstado(${ticket.id}, 'VALIDACION')">
                    Enviar a validación
                </button>
            `;

        case "DEVUELTO":
            return `
                <button class="btn small warning"
                        onclick="abrirModalEstado(${ticket.id}, 'VALIDACION')">
                    Reenviar validación
                </button>
            `;

        default:
            return `<span class="text-muted">Sin acciones</span>`;
    }
}

// ─────────────────────────────────────────
// CAMBIO DE ESTADO (con modal de observación)
// ─────────────────────────────────────────
function abrirModalEstado(id, estado) {
    ticketPendiente  = id;
    estadoPendiente  = estado;

	// ASIGNADO no requiere observación, se confirma directo
    if (estado === "ASIGNADO") {
        confirmarCambioEstado();
        return;
    }
	
    const titulos = {
        RECHAZADO:  "Rechazar ticket",
        VALIDACION: "Enviar a validación"
    };

    document.getElementById("modalObsTitulo").textContent = titulos[estado];
    document.getElementById("inputObservacion").value     = "";
    document.getElementById("modalObservacion").classList.add("activo");
}

async function confirmarCambioEstado() {
	const observacion = document.getElementById("inputObservacion").value.trim();

    // Solo RECHAZADO exige observación; VALIDACION la acepta pero no la requiere
    if (estadoPendiente === "RECHAZADO" && !observacion) {
        mostrarMensaje("Debe ingresar el motivo del rechazo", "error");
        return;
    }

    const actorId = localStorage.getItem("usuarioId");

    try {
        const response = await fetch(
            `${API_URL}/tickets/${ticketPendiente}/${estadoPendiente}/${actorId}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ observacion })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "No se pudo actualizar");
        }

        cerrarModalObs();
        mostrarMensaje("Estado actualizado correctamente", "ok");
        await cargarTickets();

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

// ─────────────────────────────────────────
// TIMELINE
// ─────────────────────────────────────────
async function verTimeline(ticketId, codigo) {
	try {
        const response = await fetch(`${API_URL}/timeline/${ticketId}`);

        if (!response.ok) throw new Error("No se pudo cargar el timeline");

        const eventos = await response.json();

        document.getElementById("modalTitulo").textContent = `Timeline - ${codigo}`;

        document.getElementById("modalContenido").innerHTML = eventos.length
            ? eventos.map(e => {
                const nombreActor = mapaUsuarios[e.actorId] || `Usuario ${e.actorId}`;
                return `
                    <div class="timeline-item">
                        <div class="timeline-dot ${e.estado}"></div>
                        <div class="timeline-info">
                            <span class="timeline-fecha">${formatearFecha(e.fechaEvento)}</span>
                            <strong class="timeline-estado">${formatearEstado(e.estado)}</strong>
                            <span class="timeline-obs">${nombreActor} — ${escapar(e.observacion || "")}</span>
                        </div>
                    </div>
                `;
            }).join("")
            : `<p class="empty">No hay eventos registrados.</p>`;

        document.getElementById("modalTimeline").classList.add("activo");

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

// ─────────────────────────────────────────
// MODALES
// ─────────────────────────────────────────
function cerrarModal() {
    document.getElementById("modalTimeline")?.classList.remove("activo");
}

function cerrarModalObs() {
    document.getElementById("modalObservacion")?.classList.remove("activo");
    ticketPendiente = null;
    estadoPendiente = null;
}

// ─────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────
function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById("mensaje");
    mensaje.textContent = texto;
    mensaje.className   = texto ? `message show ${tipo}` : "message";
}

function obtenerNombreSolicitante(id) {
    return mapaUsuarios[id] || "Sin nombre";
}

function formatearFecha(fecha) {
    if (!fecha) return "";
    return fecha.replace("T", " ").substring(0, 16);
}

function formatearEstado(estado) {
    return String(estado || "").replaceAll("_", " ");
}

function escapar(valor) {
    return String(valor || "")
        .replaceAll("&",  "&amp;")
        .replaceAll("<",  "&lt;")
        .replaceAll(">",  "&gt;")
        .replaceAll('"',  "&quot;")
        .replaceAll("'",  "&#039;");
}

function cerrarSesion(event) {
    event.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
}