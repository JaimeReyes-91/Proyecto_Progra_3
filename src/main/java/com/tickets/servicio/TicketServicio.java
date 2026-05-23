package com.tickets.servicio;

import java.util.List;

import com.tickets.dao.TicketDAO;
import com.tickets.modelo.EstadoTicket;
import com.tickets.modelo.Ticket;
import com.tickets.util.CodigoTicketUtil;

// El archivo de ticketServicio es la encargadar de la logica de los tickets

public class TicketServicio {

	private final TicketDAO ticketDAO = new TicketDAO();

	private final TimeLineServicio timelineServicio = new TimeLineServicio();

	public Ticket crear(String descripcion, int creadoPor) throws Exception {

		if (descripcion == null || descripcion.trim().isEmpty()) {
			throw new Exception("La descripcion no puede estar vacia");
		}

		int idGenerado = ticketDAO.obtenerSiguienteId();

		String codigo = CodigoTicketUtil.generarCodigo(idGenerado);

		Ticket ticket = new Ticket();
		ticket.setId(idGenerado);
		ticket.setCodigo(codigo);
		ticket.setDescripcion(descripcion);
		ticket.setCreadoPor(creadoPor);
		ticket.setEstadoActual(EstadoTicket.CREADO);

		ticketDAO.crear(ticket);

		timelineServicio.registrarEvento(idGenerado, creadoPor, EstadoTicket.CREADO.name(), "Ticket creado");

		return ticket;
	}

	public Ticket buscarPorId(int id) throws Exception {

		Ticket ticket = ticketDAO.buscarPorId(id);

		if (ticket == null) {
			throw new Exception("Ticket no encontrado con id: " + id);
		}

		return ticket;
	}

	public List<Ticket> listar() throws Exception {

		return ticketDAO.listar();
	}

	public void cambiarEstado(int id, EstadoTicket nuevoEstado) throws Exception {

		cambiarEstado(id, nuevoEstado, 0, "Estado actualizado", null);
	}

	public void cambiarEstado(int id, EstadoTicket nuevoEstado, int actorId, String observacion, Integer asignadoA)
			throws Exception {

		Ticket ticket = ticketDAO.buscarPorId(id);

		if (ticket == null) {
			throw new Exception("Ticket no encontrado con id: " + id);
		}

		validarCambioEstado(ticket.getEstadoActual(), nuevoEstado);

		ticketDAO.actualizarEstado(id, nuevoEstado, asignadoA);

		if (actorId > 0) {
			timelineServicio.registrarEvento(id, actorId, nuevoEstado.name(), observacion);
		}
	}

	public void eliminar(int id) throws Exception {

		Ticket ticket = ticketDAO.buscarPorId(id);

		if (ticket == null) {
			throw new Exception("Ticket no encontrado con id: " + id);
		}

		ticketDAO.eliminar(id);
	}

	private void validarCambioEstado(EstadoTicket actual, EstadoTicket nuevo) throws Exception {

        boolean permitido = switch (actual) {
            case CREADO ->
                    nuevo == EstadoTicket.ASIGNADO
                    || nuevo == EstadoTicket.RECHAZADO;
            case ASIGNADO ->
                    nuevo == EstadoTicket.VALIDACION
                    || nuevo == EstadoTicket.RECHAZADO;
            case VALIDACION ->
                    nuevo == EstadoTicket.FINALIZADO
                    || nuevo == EstadoTicket.DEVUELTO;
            case DEVUELTO ->
                    nuevo == EstadoTicket.VALIDACION;
            case FINALIZADO, RECHAZADO ->
                    false;
        };

		if (!permitido) {
			throw new Exception("Cambio de estado no permitido: " + actual + " -> " + nuevo);
		}
	}
}
