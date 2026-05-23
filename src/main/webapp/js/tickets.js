// Al cargar la página inicializa la sesión, navegación y formulario
document.addEventListener("DOMContentLoaded", () => {
    protegerSesion();
    prepararNavegacion();
    prepararFormulario();
});
 
// Verifica que haya sesión activa y que el usuario sea SOLICITANTE
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
 
// Muestra el nombre y rol del usuario en el header y configura el sidebar
function prepararNavegacion() {
    const nombre = localStorage.getItem("nombre") || "Usuario";
    const rol    = localStorage.getItem("rol") || "";
 
    const usuarioActivo = document.getElementById("usuarioActivo");
 
    // Muestra nombre y rol juntos en el chip del header
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
 
// Prepara el formulario según el rol y conecta los eventos de envío, filtro y archivo
function prepararFormulario() {
    const creadoPor = document.getElementById("creadoPor");
    const filtro = document.getElementById("filtroTickets");
 
	// El solicitante no necesita ver el campo de id porque se llena automáticamente
	if (localStorage.getItem("rol") === "SOLICITANTE") {
	    document.getElementById("creadoPorField").style.display = "none";
	}
	
	// El soporte no necesita el formulario de creación, solo gestiona tickets existentes
	if (localStorage.getItem("rol") === "SOPORTE") {
	    document.getElementById("ticketForm").closest("article").style.display = "none";
	}
	
    // Rellena el campo con el id del usuario logueado
    creadoPor.value = usuarioId || "";
 
    // Conecta el formulario con la función de crear ticket
    document.getElementById("ticketForm").addEventListener("submit", crearTicket);
 
    // Filtra la tabla en tiempo real mientras el usuario escribe
    filtro.addEventListener("input", renderTickets);
	
	// Muestra el nombre del archivo cuando el usuario selecciona uno
	document.getElementById("archivo").addEventListener("change", function () {
        const nombre = this.files[0]?.name || "Ningún archivo seleccionado";
        document.getElementById("nombreArchivo").textContent = nombre;
    });
}
 
// Obtiene todos los tickets del backend y carga sus archivos adjuntos
async function listarTickets() {
    try {
        const response = await fetch(API_URL + "/tickets");
        if (!response.ok) throw new Error("No se pudieron cargar los tickets");
 
        tickets = await response.json();
 
        // Por cada ticket consulta sus archivos adjuntos en paralelo
        await Promise.all(tickets.map(async ticket => {
            try {
                const res = await fetch(`${API_URL}/archivos/ticket/${ticket.id}`);
                // Si la respuesta es exitosa guarda los archivos, si no deja la lista vacía
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
 
// Construye y muestra la tabla de tickets aplicando el filtro de búsqueda
function renderTickets() {
	const tabla    = document.getElementById("tablaTickets");
	const filtro   = document.getElementById("filtroTickets").value.trim().toLowerCase();
	const usuarioId = parseInt(localStorage.getItem("usuarioId"), 10);
	const rol       = localStorage.getItem("rol");
	const esSolicitante = rol === "SOLICITANTE";
	
    // Construye el encabezado dinámicamente, ocultando la columna Solicitante si es SOLICITANTE
    document.querySelector("#tablaTickets").closest("table").querySelector("thead tr").innerHTML = `
        <th>Código</th>
        <th>Descripción</th>
        <th>Estado</th>
        ${!esSolicitante ? "<th>Solicitante</th>" : ""}
        <th>Timeline</th>
        <th>Archivo</th>
        <th>Acciones</th>
    `;
 
	// Filtra los tickets por texto de búsqueda y por pertenencia al solicitante
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
 
	// Si no hay resultados muestra un mensaje en la tabla
	if (!visibles.length) {
	    tabla.innerHTML = `<tr><td class="empty" colspan="5">No hay tickets para mostrar.</td></tr>`;
	    return;
	}
 
	// Construye una fila por cada ticket visible
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
 
// Genera los botones de acción según el rol y el estado actual del ticket
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
	// Define qué estados puede alcanzar cada ticket según su estado actual
	const transiciones = {
	    CREADO:     ["ASIGNADO", "RECHAZADO"],
	    ASIGNADO:   ["VALIDACION"],
	    VALIDACION: [],
	    DEVUELTO:   ["VALIDACION"],
	    FINALIZADO: [],
	    RECHAZADO:  []
	};
	
	// Texto visible en cada botón según el estado destino
	const etiquetas = {
	    ASIGNADO:   "Aceptar",
	    RECHAZADO:  "Rechazar",
	    VALIDACION: "Enviar a Validación"
	};
 
	// Genera un botón por cada transición disponible para el estado actual
	return (transiciones[ticket.estadoActual] || []).map(estado => `
	    <button class="btn small secondary" type="button" onclick="cambiarEstado(${ticket.id}, '${estado}')">
	        ${etiquetas[estado] || estado}
	    </button>
	`).join("");
}
 
// Recoge los datos del formulario y envía el nuevo ticket al backend
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
 
        mostrarMensaje("✅ Ticket creado correctamente", "ok");
 
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
 
// modales (necesarios se reutilizan desde dashboard) 
// Cierra el modal del timeline quitándole la clase activo
function cerrarModal() {
    document.getElementById("modalTimeline")?.classList.remove("activo");
}
 
// Cierra el modal de observación quitándole la clase activo
function cerrarModalObs() {
    document.getElementById("modalObservacion")?.classList.remove("activo");
}
 
