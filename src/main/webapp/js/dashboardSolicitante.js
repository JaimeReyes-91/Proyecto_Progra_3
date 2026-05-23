//lista para guardar los tickets del solicitante actual
let tickets = [];

//Relacion de id usuario con su nombre
let mapaUsuarios = {};

// Variables temporales para guardar el ticket y el estado que se va a cambiar
let _pendienteId    = null;
let _pendienteEstado = null;

document.addEventListener("DOMContentLoaded", () => {
    protegerSesion();
    prepararNavegacion();
    cargarDashboard();
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

	
	//verificar, si el usuario no es solicitante lo redirige al dashboard de soporte
    if (rol !== "SOLICITANTE") {
        window.location.href = "dashboardSoporte.html";
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

    const iniciales = nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
    document.getElementById("usuarioAvatar").textContent = iniciales;

    const toggleSidebar = document.getElementById("toggleSidebar");
    if (toggleSidebar) {
        toggleSidebar.addEventListener("click", () => {
            document.getElementById("sidebar").classList.toggle("collapsed");
        });
    }

    document.getElementById("logoutLink").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "login.html";
    });
}

// ─────────────────────────────────────────
// CARGA PRINCIPAL
// ─────────────────────────────────────────
async function cargarDashboard() {
    const usuarioId = parseInt(localStorage.getItem("usuarioId"), 10);

	
	//cargar los tickets y usuarios desde el backend
    try {
		const [resTickets, resUsuarios] = await Promise.all([
            fetch(API_URL + "/tickets"),
            fetch(API_URL + "/usuarios")
        ]);

        if (!resTickets.ok) throw new Error("Error al cargar tickets");

        const todos    = await resTickets.json();
        const usuarios = await resUsuarios.json();
		
		mapaUsuarios = {};
		usuarios.forEach(u => mapaUsuarios[u.id] = u.nombre);

        // Solo los tickets del solicitante actual
        tickets = todos.filter(t => t.creadoPor === usuarioId);

		
		//obtener la ultima observacion de cada ticket para mostrar en la tabla
		await Promise.all(tickets.map(async ticket => {
	        try {
	            const res    = await fetch(`${API_URL}/timeline/${ticket.id}`);
	            const eventos = await res.json();
	            const ultimo  = eventos.filter(e => e.observacion).at(-1);
	            ticket.ultimaObservacion = ultimo?.observacion || null;
	        } catch {
	            ticket.ultimaObservacion = null;
	        }
	    }));
        actualizarKPIs();
        mostrarAlertaValidacion();
        renderTickets();

        // Activar búsqueda en tiempo real
        const filtro = document.getElementById("filtroTickets");
        if (filtro) {
            filtro.addEventListener("input", renderTickets);
        }

    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudieron cargar los tickets", "error");
    }
}

// ─────────────────────────────────────────
// KPIs
// ─────────────────────────────────────────
function actualizarKPIs() {
    document.getElementById("totalTickets").textContent      = tickets.length;
    document.getElementById("ticketsCreados").textContent    = tickets.filter(t => t.estadoActual === "CREADO").length;
    document.getElementById("ticketsAsignados").textContent  = tickets.filter(t => t.estadoActual === "ASIGNADO").length;
    document.getElementById("ticketsValidacion").textContent = tickets.filter(t => t.estadoActual === "VALIDACION").length;
    document.getElementById("ticketsCerrados").textContent   = tickets.filter(t => ["FINALIZADO", "RECHAZADO", "DEVUELTO"].includes(t.estadoActual)).length;
}

// ─────────────────────────────────────────
// ALERTA DE VALIDACIÓN PENDIENTE (idea nueva)
// Muestra una sección destacada si hay tickets
// que el solicitante necesita aprobar o devolver
// ─────────────────────────────────────────
function mostrarAlertaValidacion() {
    const pendientes = tickets.filter(t => t.estadoActual === "VALIDACION");
    const seccion    = document.getElementById("seccionValidacion");
    const lista      = document.getElementById("listaValidacion");

    if (!pendientes.length) {
        seccion.style.display = "none";
        return;
    }

    seccion.style.display = "block";

    lista.innerHTML = pendientes.map(ticket => `
        <div class="validacion-item">
            <div class="validacion-info">
                <span class="validacion-codigo">${escapar(ticket.codigo || "-")}</span>
                <span class="validacion-desc">${escapar(ticket.descripcion || "-")}</span>
            </div>
            <div class="validacion-acciones">
                <button
                    class="btn small"
                    type="button"
                    onclick="cambiarEstado(${ticket.id}, 'FINALIZADO')"
                >
                    ✅ Aprobar
                </button>
                <button
                    class="btn small danger"
                    type="button"
                    onclick="cambiarEstado(${ticket.id}, 'DEVUELTO')"
                >
                    ↩️ Devolver
                </button>
            </div>
        </div>
    `).join("");
}

// ─────────────────────────────────────────
// TABLA CON BÚSQUEDA + TIMELINE + ACCIONES
// ─────────────────────────────────────────
function renderTickets() {
    const tabla  = document.getElementById("tablaTickets");
    const filtro = document.getElementById("filtroTickets").value.trim().toLowerCase();

	
	//filtro de busqueda
    const visibles = tickets.filter(ticket => {
        const texto = [
            ticket.codigo,
            ticket.descripcion,
            ticket.estadoActual
        ].join(" ").toLowerCase();

        return texto.includes(filtro);
    });

	//Si no hay resultados solo muestra un mensaje
    if (!visibles.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No hay tickets para mostrar.
                </td>
            </tr>
        `;
        return;
    }

	// Generar una fila para cada ticket visible, ultima observacion, timeline y acciones disponibles

	    tabla.innerHTML = visibles.map(ticket => `
	        <tr>
	            <td>${escapar(ticket.codigo || "-")}</td>
	            <td>${escapar(ticket.descripcion || "-")}</td>
	            <td>
	                <span class="badge ${ticket.estadoActual} R">
	                    ${formatearEstado(ticket.estadoActual)}
	                </span>
	            </td>
				
				<td class="obs-col">
		            ${ticket.ultimaObservacion
		                ? ticket.ultimaObservacion
		                : `<span style="color:#ccc;">—</span>`
		            }
				</td>
				
	            <td>
	                <button
	                    class="btn small secondary btn-timeline"
	                    type="button"
	                    onclick="verTimeline(${ticket.id}, '${escapar(ticket.codigo)}')"
	                    title="Ver Timeline"
	                >
	                    <img src="img/cronologia.png" alt="Timeline" class="icono-timeline">
	                </button>
	            </td>
	            <td>
	                <div class="actions">
	                    ${renderAcciones(ticket)}
	                </div>
	            </td>
	        </tr>
	    `).join("");
	}

	// ... (sigue el código con renderAcciones)


function renderAcciones(ticket) {

    // Cuando se encuentra en VALIDACION: puede aprobar o devolver
    if (ticket.estadoActual === "VALIDACION") {
        return `
            <button
                class="btn small"
                type="button"
                onclick="cambiarEstado(${ticket.id}, 'FINALIZADO')"
            >
                Aprobar
            </button>
            <button
                class="btn small danger"
                type="button"
                onclick="cambiarEstado(${ticket.id}, 'DEVUELTO')"
            >
                Devolver
            </button>
        `;
    }

    // En CREADO: puede eliminar
    if (ticket.estadoActual === "CREADO") {
        return `
            <button
                class="btn small danger"
                type="button"
                onclick="eliminarTicket(${ticket.id})"
            >
                Eliminar
            </button>
        `;
    }
	
	//Para el solicitante los demas estados no tienen acciones disponibles
    return `<span class="text-muted">Sin acciones</span>`;
}

// ─────────────────────────────────────────
// CAMBIO DE ESTADO (con modal de observación)
// ─────────────────────────────────────────
function cambiarEstado(id, estado) {
    _pendienteId    = id;
    _pendienteEstado = estado;

	//Finalizado no requiere una observacion
	if (estado === "FINALIZADO") {
	        confirmarCambioEstado();
	        return;
	    }
	
	//Para mostrar el modal con su titulo correspondiente	
    const titulos = {
        DEVUELTO:   "Devolver ticket"
    };

    document.getElementById("modalObsTitulo").textContent = titulos[estado] || "Observación";
    document.getElementById("inputObservacion").value = "";
    document.getElementById("modalObservacion").classList.add("activo");
}

async function confirmarCambioEstado() {
	
	    if (!_pendienteId || !_pendienteEstado) {
	        cerrarModalObs();
	        return;
	    }
    const observacion = document.getElementById("inputObservacion").value.trim();
    const actorId     = localStorage.getItem("usuarioId");
    const id          = _pendienteId;
    const estado      = _pendienteEstado;

	//Al devolver exige una observacion con el motivo de devolucion]
    if (estado === "DEVUELTO" && !observacion) {
		const error = document.getElementById("errorObservacion");
	    error.textContent = "Debe indicar el motivo de devolución";
	    error.style.display = "block";
	    return;
    }

	//Para enviar la petición PUT al backend con el nuevo estado y el actor que realiza el cambio
    try {
        const response = await fetch(
            `${API_URL}/tickets/${id}/${estado}/${actorId}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ observacion })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "No se pudo actualizar el estado");
        }

        cerrarModalObs();
        mostrarMensaje("Estado actualizado correctamente", "ok");

        // Recargar para reflejar cambios en KPIs, alerta y tabla
        await cargarDashboard();

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

// ─────────────────────────────────────────
// ELIMINAR
// ─────────────────────────────────────────
async function eliminarTicket(id) {
	//Confirmar la acción de eliminar o cancelar
    const confirmar = confirm("¿Desea eliminar este ticket?");
    if (!confirmar) return;

    try {
        const response = await fetch(`${API_URL}/tickets/${id}`, { method: "DELETE" });
        const data     = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "No se pudo eliminar");
        }

        mostrarMensaje("Ticket eliminado correctamente", "ok");
        await cargarDashboard();

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

        const contenido = eventos.length
            ? eventos.map(evento => {
                const fecha = evento.fechaEvento
                    ? evento.fechaEvento.replace("T", " ").substring(0, 16)
                    : "";
				const nombreActor = mapaUsuarios[evento.actorId] || `Usuario ${evento.actorId}`;

                return `
                    <div class="timeline-item">
                        <div class="timeline-dot ${evento.estado}"></div>
                        <div class="timeline-info">
                            <span class="timeline-fecha">${fecha}</span>
                            <span class="timeline-estado">${formatearEstado(evento.estado)}</span>
                            <span class="timeline-obs">${nombreActor} — ${escapar(evento.observacion || "Sin observación")}</span>
                        </div>
                    </div>
                `;
            }).join("")
            : `<p>No hay eventos registrados.</p>`;

        document.getElementById("modalTitulo").textContent   = `Timeline de ${codigo}`;
        document.getElementById("modalContenido").innerHTML  = contenido;
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

	const error = document.getElementById("errorObservacion");
	    if (error) error.style.display = "none";
		
	    _pendienteId = null;
	    _pendienteEstado = null;
}

// ─────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────
function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById("mensaje");
    if (!mensaje) return;
    mensaje.textContent = texto;
    mensaje.className   = texto ? `message show ${tipo}` : "message";
}

function formatearEstado(estado) {
    return String(estado || "").replaceAll("_", " ");
}

function escapar(valor) {
    return String(valor || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
