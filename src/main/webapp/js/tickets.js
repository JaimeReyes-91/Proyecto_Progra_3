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
	const linkDashboard = document.getElementById("linkDashboard");

	const iniciales = nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
	usuarioActivo.innerHTML = `
	    <div class="avatar">${iniciales}</div>
	    <div class="info">
	        <div class="nombre">${nombre}</div>
	        <div class="rol">${rol}</div>
	    </div>
	`;

	if (rol !== "SOPORTE" && linkUsuarios) {
	    linkUsuarios.style.display = "none";
	}
	
	if (linkDashboard) {
	    linkDashboard.href = localStorage.getItem("rol") === "SOLICITANTE"
	        ? "dashboardSolicitante.html"
	        : "dashboard.html";
	}
	
	if (localStorage.getItem("rol") === "SOPORTE") {
	    const formulario = document.getElementById("ticketForm").closest("article");
	    formulario.style.display = "none";
	    formulario.closest("section").style.gridTemplateColumns = "1fr";
	}

    logoutLink.addEventListener("click", cerrarSesion);
}

function prepararFormulario() {
    const usuarioId = localStorage.getItem("usuarioId");
    const creadoPor = document.getElementById("creadoPor");
    const filtro = document.getElementById("filtroTickets");

	if (localStorage.getItem("rol") === "SOLICITANTE") {
	    document.getElementById("creadoPorField").style.display = "none";
	}
	
	if (localStorage.getItem("rol") === "SOPORTE") {
	    document.getElementById("ticketForm").closest("article").style.display = "none";
	}
	
    creadoPor.value = usuarioId || "";

    document.getElementById("ticketForm").addEventListener("submit", crearTicket);
    filtro.addEventListener("input", renderTickets);
	
	document.getElementById("archivo").addEventListener("change", function () {
        const nombre = this.files[0]?.name || "Ningún archivo seleccionado";
        document.getElementById("nombreArchivo").textContent = nombre;
    });
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
	const tabla    = document.getElementById("tablaTickets");
	const filtro   = document.getElementById("filtroTickets").value.trim().toLowerCase();
	const usuarioId = parseInt(localStorage.getItem("usuarioId"), 10);
	const rol       = localStorage.getItem("rol");
	const esSolicitante = rol === "SOLICITANTE";
	
	document.querySelector("#tablaTickets").closest("table").querySelector("thead tr").innerHTML = `
	    <th>Código</th>
	    <th>Descripción</th>
	    <th>Estado</th>
	    ${!esSolicitante ? "<th>Solicitante</th>" : ""}
	    <th>Timeline</th>
	    <th>Acciones</th>
	`;

	let visibles = tickets.filter(ticket => {
	    const texto = [
	        ticket.codigo,
	        ticket.descripcion,
	        ticket.estadoActual,
	        ticket.creadoPor
	    ].join(" ").toLowerCase();

	    const coincideFiltro = texto.includes(filtro);

	    // Solicitante solo ve sus propios tickets
	    const esSuyo = !esSolicitante || ticket.creadoPor === usuarioId;

	    return coincideFiltro && esSuyo;
	});

	if (!visibles.length) {
	    tabla.innerHTML = `<tr><td class="empty" colspan="5">No hay tickets para mostrar.</td></tr>`;
	    return;
	}

	tabla.innerHTML = visibles.map(ticket => `
		<tr>
           <td>${escapar(ticket.codigo || "-")}</td>
           <td>${escapar(ticket.descripcion || "-")}</td>
           <td>
               <span class="badge ${ticket.estadoActual}">
                   ${formatearEstado(ticket.estadoActual)}
               </span>
           </td>
           ${!esSolicitante ? `<td>${ticket.creadoPor || "-"}</td>` : ""}
           <td>
               <button class="btn small secondary" type="button" onclick="verTimeline(${ticket.id}, '${escapar(ticket.codigo)}')">
                   🕓
               </button>
           </td>
           <td>
               <div class="actions">
                   ${botonesEstado(ticket, esSolicitante)}
                   ${!esSolicitante || ticket.estadoActual === "CREADO"
                       ? `<button class="btn small icon" type="button" onclick="eliminarTicket(${ticket.id})" title="Eliminar">🗑️</button>`
                       : ""}
               </div>
           </td>
        </tr>
	`).join("");
}

function botonesEstado(ticket, esSolicitante) {
	if (esSolicitante) {
	    // El solicitante SOLO actúa cuando está en VALIDACION
	    if (ticket.estadoActual === "VALIDACION") {
	        return `
	            <button class="btn small secondary" type="button" onclick="cambiarEstado(${ticket.id}, 'FINALIZADO')">Aprobar</button>
	            <button class="btn small secondary" type="button" onclick="cambiarEstado(${ticket.id}, 'DEVUELTO')">Rechazar</button>
	        `;
	    }
	    return "";
	}

	// Técnico/admin: flujo completo
	const transiciones = {
	    CREADO:     ["ASIGNADO", "RECHAZADO"],
	    ASIGNADO:   ["VALIDACION"],
	    VALIDACION: [],
	    DEVUELTO:   ["VALIDACION"],
	    FINALIZADO: [],
	    RECHAZADO:  []
	};
	
	const etiquetas = {
	    ASIGNADO:   "Aceptar",
	    RECHAZADO:  "Rechazar",
	    VALIDACION: "Enviar a Validación"
	};

	return (transiciones[ticket.estadoActual] || []).map(estado => `
	    <button class="btn small secondary" type="button" onclick="cambiarEstado(${ticket.id}, '${estado}')">
	        ${etiquetas[estado] || estado}
	    </button>
	`).join("");
}

async function crearTicket(event) {
    event.preventDefault();

    const descripcion = document.getElementById("descripcion").value.trim();
    const creadoPor = parseInt(document.getElementById("creadoPor").value, 10);
	const archivo     = document.getElementById("archivo").files[0];

    mostrarMensaje("", "");

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

let _pendienteId = null;
let _pendienteEstado = null;

function cambiarEstado(id, estado) {

	    _pendienteId = id;
	    _pendienteEstado = estado;

	    const titulos = {
	        ASIGNADO:   "Aceptar ticket",
	        RECHAZADO:  "Rechazar ticket",
	        VALIDACION: "Enviar a validación",
	        DEVUELTO:   "Rechazar solución",
	        FINALIZADO: "Aprobar solución"
	    };

	    document.getElementById("modalObsTitulo").textContent = titulos[estado] || "Observación";
	    document.getElementById("inputObservacion").value = "";
	    document.getElementById("modalObservacion").classList.add("activo");
	
}

async function confirmarCambioEstado() {
    const observacion = document.getElementById("inputObservacion").value.trim();
    const actorId = localStorage.getItem("usuarioId");
	
	const id = _pendienteId;
    const estado = _pendienteEstado;

    cerrarModalObs(); // ahora sí puede resetear las variables

    try {
        const response = await fetch(`${API_URL}/tickets/${id}/${estado}/${actorId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ observacion })
        });

        const text = await response.text();
        console.log("Respuesta:", response.status, text);

        if (!response.ok) {
            try {
                const data = JSON.parse(text);
                throw new Error(data.error || "No se pudo actualizar el estado");
            } catch {
                throw new Error("Error del servidor: " + response.status);
            }
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

async function verTimeline(ticketId, codigo) {
    try {
        const response = await fetch(`${API_URL}/timeline/${ticketId}`);

        if (!response.ok) {
            throw new Error("No se pudo cargar el timeline");
        }

        const eventos = await response.json();

        
        const contenido = eventos.length
            ? eventos.map(e =>		{
                const fecha = e.fechaEvento ? e.fechaEvento.replace("T", " ").substring(0, 16) : "";
                return `
                    <div class="timeline-item">
                        <div class="timeline-dot ${e.estado}"></div>
                        <div class="timeline-info">
                            <span class="timeline-fecha">${fecha}</span>
                            <span class="timeline-estado">${formatearEstado(e.estado)}</span>
                            <span class="timeline-obs">${escapar(e.observacion || "Sin observación")}</span>
                        </div>
                    </div>
                `;
            }).join("")
            : "<p>No hay eventos registrados.</p>";
        
        const modal = document.getElementById("modalTimeline");
        document.getElementById("modalTitulo").textContent = `Timeline de ${codigo}`;
        document.getElementById("modalContenido").innerHTML = contenido;
        modal.classList.add("activo"); // <- cambia modal.style.display = "flex"

	    } catch (error) {
	        console.error(error);
	        mostrarMensaje(error.message, "error");
	    }
	}
	
	function cerrarModal() {
	    document.getElementById("modalTimeline").classList.remove("activo");
}

	function cerrarModalObs() {
	    document.getElementById("modalObservacion").classList.remove("activo");
	    _pendienteId = null;
	    _pendienteEstado = null;
}
