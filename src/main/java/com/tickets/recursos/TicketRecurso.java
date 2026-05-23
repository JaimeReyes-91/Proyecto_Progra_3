package com.tickets.recursos;

import java.io.InputStream;
import java.util.Map;

import org.glassfish.jersey.media.multipart.FormDataParam;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;

import com.tickets.modelo.EstadoTicket;
import com.tickets.modelo.Ticket;
import com.tickets.servicio.ArchivoServicio;
import com.tickets.servicio.TicketServicio;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/tickets")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TicketRecurso {

    private final TicketServicio ticketServicio = new TicketServicio();
    
    private final ArchivoServicio archivoServicio = new ArchivoServicio();


    @GET
    public Response listar() {
        try {
            return Response.ok(ticketServicio.listar()).build();
        } catch (Exception e) {
            return Response.serverError()
                    .entity(Map.of("error", e.getMessage())).build();
        }
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") int id) {
        try {
            return Response.ok(ticketServicio.buscarPorId(id)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", e.getMessage())).build();
        }
    }

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response crear(
    		 @FormDataParam("descripcion") String descripcion,
	        @FormDataParam("creadoPor") int creadoPor,
	        @FormDataParam("archivo") InputStream archivoStream,
	        @FormDataParam("archivo") FormDataContentDisposition archivoInfo
    ) {

        try {

            Ticket creado =
                    ticketServicio.crear(descripcion, creadoPor);
            
            if (archivoInfo != null && archivoInfo.getFileName() != null) {
                archivoServicio.subirArchivo(
                        creado.getId(),
                        archivoInfo.getFileName(),
                        null,
                        -1,
                        archivoStream
                );
            }

            return Response.status(
                    Response.Status.CREATED
            ).entity(creado).build();

        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage())).build();
        }
    }

    // /system/tickets/{id}/{estado}/{actorId}
    @PUT
    @Path("/{id}/{estado}/{actorId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response cambiarEstado(
            @PathParam("id") int id,
            @PathParam("estado") String estado,
            @PathParam("actorId") int actorId,
    		Map<String, String> body){
        try {
                EstadoTicket nuevoEstado = EstadoTicket.valueOf(estado);
                
                String observacion = (body != null && body.get("observacion") != null && !body.get("observacion").isBlank())
                        ? body.get("observacion")
                        : switch (nuevoEstado) {
                            case ASIGNADO   -> "Ticket aceptado por el técnico";
                            case RECHAZADO  -> "Ticket rechazado";
                            case VALIDACION -> "Enviado a validación";
                            case DEVUELTO   -> "Solución rechazada por el solicitante";
                            case FINALIZADO -> "Solución aprobada por el solicitante";
                            default         -> "Estado actualizado a " + nuevoEstado.name();
                        };
                
                Ticket ticketActual = ticketServicio.buscarPorId(id);

                Integer asignadoA = nuevoEstado == EstadoTicket.ASIGNADO 
                    ? Integer.valueOf(actorId)
                    : ticketActual.getAsignadoA();
                
                ticketServicio.cambiarEstado(
                    id,
                    nuevoEstado,
                    actorId,
                    observacion,
                    asignadoA
            );

            return Response.ok(Map.of("mensaje", "Estado actualizado")).build();

        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Estado inválido: " + estado)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage())).build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response eliminar(@PathParam("id") int id) {
        try {
            ticketServicio.eliminar(id);
            return Response.ok(Map.of("mensaje", "Ticket eliminado")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage())).build();
        }
    }
}
