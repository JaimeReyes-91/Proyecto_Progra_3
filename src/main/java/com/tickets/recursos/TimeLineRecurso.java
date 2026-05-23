package com.tickets.recursos;

import java.util.List;

import com.tickets.modelo.LineaTiempoEvento;
import com.tickets.servicio.TimeLineServicio;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/timeline")
@Produces(MediaType.APPLICATION_JSON)
public class TimeLineRecurso {

	private final TimeLineServicio servicio = new TimeLineServicio();

	// sirve para consultar el historial de tiempo de in ticket
	@GET
	@Path("/{ticketId}")
	public Response listarPorTicket(@PathParam("ticketId") int ticketId) {
		try {
			List<LineaTiempoEvento> eventos = servicio.listarPorTicket(ticketId);
			return Response.ok(eventos).build();
		} catch (Exception e) {
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
					.entity("Error al cargar timeline: " + e.getMessage()).build();
		}
	}
}