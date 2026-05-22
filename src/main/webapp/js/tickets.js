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
        if (!response.ok) throw new Error("No se pudieron cargar los tickets");

        tickets = await response.json();

        await Promise.all(tickets.map(async ticket => {
            try {
                const res = await fetch(`${API_URL}/archivos/ticket/${ticket.id}`);
                ticket.archivos = res.ok ? await res.json() : [];
            } catch {
                ticket.archivos = [];
            }
        }));

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
        <th>Archivo</th>
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
               <span class="badge ${ticket.estadoActual} R">
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
                ${ticket.archivos && ticket.archivos.length
                    ? ticket.archivos.map(a => `
                        <a class="btn small secondary"
                        href="${API_URL}/archivos/download/${a.id}"
                        target="_blank"
                        title="${escapar(a.nombreOriginal)}">
                            📎 ${escapar(a.nombreOriginal)}
                        </a>`).join("")
                    : "-"
                }
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
