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
    const rol    = localStorage.getItem("rol") || "";

    document.getElementById("usuarioNombre").textContent = nombre;
    document.getElementById("usuarioRol").textContent    = rol;

    const iniciales = nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
    document.getElementById("usuarioAvatar").textContent = iniciales;

    document.getElementById("logoutLink").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "login.html";
    });
}

async function cargarDashboard() {
    const usuarioId = parseInt(localStorage.getItem("usuarioId"), 10);

    try {
        const response = await fetch(API_URL + "/tickets");
        if (!response.ok) throw new Error("Error al cargar tickets");

        const todos = await response.json();

        const misTickets = todos.filter(t => t.creadoPor === usuarioId);

        document.getElementById("totalTickets").textContent      = misTickets.length;
        document.getElementById("ticketsCreados").textContent    = misTickets.filter(t => t.estadoActual === "CREADO").length;
        document.getElementById("ticketsAsignados").textContent  = misTickets.filter(t => t.estadoActual === "ASIGNADO").length;
        document.getElementById("ticketsValidacion").textContent = misTickets.filter(t => t.estadoActual === "VALIDACION").length;
        document.getElementById("ticketsCerrados").textContent   = misTickets.filter(t => ["FINALIZADO", "RECHAZADO", "DEVUELTO"].includes(t.estadoActual)).length;

        const recientes = [...misTickets].reverse().slice(0, 5);
        const tbody = document.getElementById("tablaRecientes");

        if (!recientes.length) {
            tbody.innerHTML = `<tr><td class="empty" colspan="3">No tienes tickets registrados.</td></tr>`;
            return;
        }

        tbody.innerHTML = recientes.map(t => `
            <tr>
                <td>${t.codigo || "-"}</td>
                <td>${t.descripcion || "-"}</td>
                <td><span class="badge ${t.estadoActual}">${t.estadoActual}</span></td>
            </tr>
        `).join("");

    } catch (error) {
        console.error(error);
    }
}
