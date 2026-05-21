let tickets = [];

let _pendienteId = null;
let _pendienteEstado = null;

document.addEventListener("DOMContentLoaded", () => {

    protegerSesion();
    prepararNavegacion();
    prepararFormulario();
    listarTickets();

});

function protegerSesion() {

    const usuarioId = localStorage.getItem("usuarioId");
    const rol = localStorage.getItem("rol");

    if (!usuarioId) {

        window.location.href = "login.html";
        return;

    }

    // Esta vista es SOLO para solicitantes
    if (rol !== "SOLICITANTE") {

        window.location.href = "dashboardSoporte.html";

    }

}

function prepararNavegacion() {

    const nombre = localStorage.getItem("nombre") || "Usuario";
    const rol = localStorage.getItem("rol") || "";

    const usuarioActivo = document.getElementById("usuarioActivo");
    const logoutLink = document.getElementById("logoutLink");
    const linkDashboard = document.getElementById("linkDashboard");

    if (usuarioActivo) {

        usuarioActivo.textContent = `${nombre} · ${rol}`;

    }

    if (linkDashboard) {

        linkDashboard.href = "dashboardSolicitante.html";

    }

    if (logoutLink) {

        logoutLink.addEventListener("click", cerrarSesion);

    }

}

function prepararFormulario() {

    const creadoPor = document.getElementById("creadoPor");

    if (creadoPor) {

        creadoPor.value =
            localStorage.getItem("usuarioId") || "";

    }

    const ticketForm = document.getElementById("ticketForm");

    if (ticketForm) {

        ticketForm.addEventListener(
            "submit",
            crearTicket
        );

    }

    const filtro = document.getElementById("filtroTickets");

    if (filtro) {

        filtro.addEventListener(
            "input",
            renderTickets
        );

    }

    const archivo = document.getElementById("archivo");

    if (archivo) {

        archivo.addEventListener("change", function () {

            const nombre =
                this.files[0]?.name ||
                "Ningún archivo seleccionado";

            document.getElementById(
                "nombreArchivo"
            ).textContent = nombre;

        });

    }

}

async function listarTickets() {

    try {

        const response = await fetch(
            API_URL + "/tickets"
        );

        if (!response.ok) {

            throw new Error(
                "No se pudieron cargar los tickets"
            );

        }

        const data = await response.json();

        const usuarioId = parseInt(
            localStorage.getItem("usuarioId"),
            10
        );

        // El solicitante SOLO ve sus tickets
        tickets = data.filter(
            ticket => ticket.creadoPor === usuarioId
        );

        renderTickets();

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "No se pudieron cargar los tickets",
            "error"
        );

    }

}

function renderTickets() {

    const tabla = document.getElementById("tablaTickets");

    const filtro = document
        .getElementById("filtroTickets")
        .value
        .trim()
        .toLowerCase();

    const visibles = tickets.filter(ticket => {

        const texto = [
            ticket.codigo,
            ticket.descripcion,
            ticket.estadoActual
        ]
        .join(" ")
        .toLowerCase();

        return texto.includes(filtro);

    });

    if (!visibles.length) {

        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No hay tickets registrados.
                </td>
            </tr>
        `;

        return;

    }

    tabla.innerHTML = visibles.map(ticket => `

        <tr>

            <td>
                ${escapar(ticket.codigo || "-")}
            </td>

            <td>
                ${escapar(ticket.descripcion || "-")}
            </td>

            <td>
                <span class="badge ${ticket.estadoActual}">
                    ${formatearEstado(ticket.estadoActual)}
                </span>
            </td>

            <td>

                <button
                    class="btn small secondary"
                    type="button"
                    onclick="verTimeline(
                        ${ticket.id},
                        '${escapar(ticket.codigo)}'
                    )"
                >
                    🕓
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

function renderAcciones(ticket) {

    // El solicitante SOLO actúa
    // cuando el ticket está en VALIDACION

    if (ticket.estadoActual === "VALIDACION") {

        return `

            <button
                class="btn small"
                type="button"
                onclick="cambiarEstado(
                    ${ticket.id},
                    'FINALIZADO'
                )"
            >
                Aprobar
            </button>

            <button
                class="btn small danger"
                type="button"
                onclick="cambiarEstado(
                    ${ticket.id},
                    'DEVUELTO'
                )"
            >
                Devolver
            </button>

        `;

    }

    // Puede eliminar únicamente si aún no fue tomado

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

    return `
        <span class="text-muted">
            Sin acciones disponibles
        </span>
    `;

}

async function crearTicket(event) {

    event.preventDefault();

    const descripcion = document
        .getElementById("descripcion")
        .value
        .trim();

    const creadoPor = parseInt(
        document.getElementById("creadoPor").value,
        10
    );

    const archivo = document
        .getElementById("archivo")
        .files[0];

    if (!descripcion) {

        mostrarMensaje(
            "La descripción es obligatoria",
            "error"
        );

        return;

    }

    try {

        const formData = new FormData();

        formData.append(
            "descripcion",
            descripcion
        );

        formData.append(
            "creadoPor",
            creadoPor
        );

        if (archivo) {

            formData.append(
                "archivo",
                archivo
            );

        }

        const response = await fetch(
            API_URL + "/tickets",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "No se pudo crear el ticket"
            );

        }

        document
            .getElementById("ticketForm")
            .reset();

        document.getElementById(
            "nombreArchivo"
        ).textContent =
            "Ningún archivo seleccionado";

        document.getElementById(
            "creadoPor"
        ).value =
            localStorage.getItem("usuarioId") || "";

        mostrarMensaje(
            "Ticket creado correctamente",
            "ok"
        );

        await listarTickets();

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            error.message,
            "error"
        );

    }

}

function cambiarEstado(id, estado) {

    _pendienteId = id;
    _pendienteEstado = estado;

    const titulos = {

        FINALIZADO:
            "Aprobar solución",

        DEVUELTO:
            "Devolver ticket"

    };

    document.getElementById(
        "modalObsTitulo"
    ).textContent =
        titulos[estado] || "Observación";

    document.getElementById(
        "inputObservacion"
    ).value = "";

    document
        .getElementById("modalObservacion")
        .classList.add("activo");

}

async function confirmarCambioEstado() {

    const observacion = document
        .getElementById("inputObservacion")
        .value
        .trim();

    const actorId = localStorage.getItem(
        "usuarioId"
    );

    const id = _pendienteId;
    const estado = _pendienteEstado;

    // DEVUELTO requiere observación
    if (
        estado === "DEVUELTO" &&
        !observacion
    ) {

        mostrarMensaje(
            "Debe indicar el motivo de devolución",
            "error"
        );

        return;

    }

    try {

        const response = await fetch(
            `${API_URL}/tickets/${id}/${estado}/${actorId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    observacion
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "No se pudo actualizar el estado"
            );

        }

        cerrarModalObs();

        mostrarMensaje(
            "Estado actualizado correctamente",
            "ok"
        );

        await listarTickets();

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            error.message,
            "error"
        );

    }

}

async function eliminarTicket(id) {

    const confirmar = confirm(
        "¿Desea eliminar este ticket?"
    );

    if (!confirmar) {

        return;

    }

    try {

        const response = await fetch(
            `${API_URL}/tickets/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "No se pudo eliminar"
            );

        }

        mostrarMensaje(
            "Ticket eliminado correctamente",
            "ok"
        );

        await listarTickets();

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            error.message,
            "error"
        );

    }

}

async function verTimeline(ticketId, codigo) {

    try {

        const response = await fetch(
            `${API_URL}/timeline/${ticketId}`
        );

        if (!response.ok) {

            throw new Error(
                "No se pudo cargar el timeline"
            );

        }

        const eventos = await response.json();

        const contenido = eventos.length
            ? eventos.map(evento => {

                const fecha =
                    evento.fechaEvento
                        ? evento.fechaEvento
                            .replace("T", " ")
                            .substring(0, 16)
                        : "";

                return `

                    <div class="timeline-item">

                        <div class="timeline-dot ${evento.estado}">
                        </div>

                        <div class="timeline-info">

                            <span class="timeline-fecha">
                                ${fecha}
                            </span>

                            <span class="timeline-estado">
                                ${formatearEstado(
                                    evento.estado
                                )}
                            </span>

                            <span class="timeline-obs">
                                ${escapar(
                                    evento.observacion ||
                                    "Sin observación"
                                )}
                            </span>

                        </div>

                    </div>

                `;

            }).join("")
            : `
                <p>
                    No hay eventos registrados.
                </p>
            `;

        document.getElementById(
            "modalTitulo"
        ).textContent =
            `Timeline de ${codigo}`;

        document.getElementById(
            "modalContenido"
        ).innerHTML = contenido;

        document
            .getElementById("modalTimeline")
            .classList.add("activo");

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            error.message,
            "error"
        );

    }

}

function cerrarModal() {

    document
        .getElementById("modalTimeline")
        .classList.remove("activo");

}

function cerrarModalObs() {

    document
        .getElementById("modalObservacion")
        .classList.remove("activo");

    _pendienteId = null;
    _pendienteEstado = null;

}

function mostrarMensaje(texto, tipo) {

    const mensaje = document.getElementById(
        "mensaje"
    );

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