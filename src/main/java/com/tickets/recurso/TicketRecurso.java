package com.tickets.recurso;

import java.io.File;
import java.io.FileInputStream;
import com.tickets.modelo.Archivo;
import com.tickets.modelo.Ticket;
import com.tickets.servicio.TicketServicio;
import com.tickets.servicio.TimeLineServicio;


import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;


@Path("/tickets")

public class TicketRecurso {
	
	private final TicketServicio ticketServicio =
            new TicketServicio();
	

	
	 @GET
	    public Response listarTickets() {

	        try {

	            return Response.ok(
	            		ticketServicio.listar()
	            ).build();

	        } catch (Exception e) {

	            return Response.serverError()
	                    .entity(e.getMessage())
	                    .build();
	        }
	    }
	 
	 @GET @Path("/{id}")
	    @Produces(MediaType.APPLICATION_JSON)
	    public Response obtenerPorId(@PathParam("id") int id) {
		 try {

	            Ticket ticket = ticketServicio.buscarPorId(id);

	            if (ticket == null) {

	                return Response.status(Response.Status.NOT_FOUND)
	                        .entity("Ticket no encontrado")
	                        .build();
	            }
	            
	            return Response.ok(ticket)
	            		.build();

	        } catch (Exception e) {

	            return Response.serverError()
	                    .entity(e.getMessage())
	                    .build();
	        }
	    }
	 

	    @POST
	    public Response crearTicket(Ticket ticket) {

	        try {

	        	Ticket ticketCreado = ticketServicio.crear(
	                    ticket.getDescripcion(),
	                    ticket.getCreadoPor()
	                );

	                return Response.status(Response.Status.CREATED)
	                        .entity(ticketCreado)
	                        .build();

	        } catch (Exception e) {

	            return Response.status(Response.Status.BAD_REQUEST)
	                    .entity(e.getMessage())
	                    .build();
	        }
	        
	    }
	    
	 // PUT /api/tickets/{id}/estado
	    @PUT
	    @Path("/{id}/estado")
	    public Response cambiarEstado(
	            @PathParam("id") int id,
	            Ticket ticket
	    ) {
	        try {
	            ticketServicio.cambiarEstado(id, 
	            		ticket.getEstadoActual(),
	            		ticket.getCreadoPor(),
	                    ticket.getDescripcion());
	            
	            return Response.ok("Estado actualizado correctamente").build();
	            
	        } catch (Exception e) {
	            return Response
	                    .status(Response.Status.BAD_REQUEST)
	                    .entity("Error al cambiar estado: " + e.getMessage())
	                    .build();
	        }
	    }
	    
	   /* @PUT @Path("/{id}/estado")
	    @Consumes(MediaType.APPLICATION_JSON)
	    @Produces(MediaType.APPLICATION_JSON)
	    public Response actualizar(@PathParam("id") int ticketId, CambioEstadoRequest request) {
	    	try {

	            ticketServicio.cambiarEstado(
	            		ticketId,
	                    request.getNuevoEstado(),
	                    request.getActorId(),
	                    request.getObservacion()
	            );

	            return Response.ok("Estado actualizado correctamente").build();

	        } catch (Exception e) {

	            return Response.status(Response.Status.BAD_REQUEST)
	                    .entity(e.getMessage())
	                    .build();
	    }

	    }*/
}
