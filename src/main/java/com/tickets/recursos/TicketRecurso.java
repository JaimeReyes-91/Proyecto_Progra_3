package com.tickets.recursos;

import java.io.InputStream;
import java.util.Map;

import org.glassfish.jersey.media.multipart.FormDataParam;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;

import com.tickets.dao.TimeLineDAO;
import com.tickets.modelo.EstadoTicket;
import com.tickets.modelo.LineaTiempoEvento;
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

        private TimeLineDAO timeLineDAO = new TimeLineDAO();

    @GET
    public Response listar() {

        try {

            return Response.ok(
                    ticketServicio.listar()
            ).build();

        } catch (Exception e) {

            return Response.serverError()
                    .entity(
                            Map.of(
                                    "error",
                                    e.getMessage()
                            )
                    )
                    .build();
        }
    }

    @GET
    @Path("/{id}")
    public Response buscar(
            @PathParam("id")
            int id
    ) {

        try {

            return Response.ok(
                    ticketServicio.buscarPorId(id)
            ).build();

        } catch (Exception e) {

            return Response.status(
                    Response.Status.NOT_FOUND
            ).entity(
                    Map.of(
                            "error",
                            e.getMessage()
                    )
            ).build();
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
                        archivoInfo.getType(),
                        -1,
                        archivoStream
                );
            }

            return Response.status(
                    Response.Status.CREATED
            ).entity(creado).build();

        } catch (Exception e) {

            return Response.status(
                    Response.Status.BAD_REQUEST
            ).entity(
                    Map.of(
                            "error",
                            e.getMessage()
                    )
            ).build();
        }
    }

    @PUT
    @Path("/{id}/{estado}/{actorId}")
    public Response cambiarEstado(
            @PathParam("id")
            int id,

            @PathParam("estado")
            String estado,

            @PathParam("actorId")
            int actorId
    ) {

        try {
                EstadoTicket nuevoEstado = EstadoTicket.valueOf(estado);

                ticketServicio.cambiarEstado(
                    id,
                    nuevoEstado
            );

                LineaTiempoEvento evento = new LineaTiempoEvento(
                        id,
                        actorId,
                        nuevoEstado.name(),
                        "Estado actualizado a " + nuevoEstado.name()
                );

                timeLineDAO.registrar(evento);

            return Response.ok(
                    Map.of(
                            "mensaje",
                            "Estado actualizado"
                    )
            ).build();

        } catch (IllegalArgumentException e) {

            return Response.status(
                    Response.Status.BAD_REQUEST
            ).entity(
                    Map.of(
                            "error",
                            "Estado inválido"
                    )
            ).build();

        } catch (Exception e) {

            return Response.status(
                    Response.Status.BAD_REQUEST
            ).entity(
                    Map.of(
                            "error",
                            e.getMessage()
                    )
            ).build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response eliminar(
            @PathParam("id")
            int id
    ) {

        try {

            ticketServicio.eliminar(id);

            return Response.ok(
                    Map.of(
                            "mensaje",
                            "Ticket eliminado"
                    )
            ).build();

        } catch (Exception e) {

            return Response.status(
                    Response.Status.BAD_REQUEST
            ).entity(
                    Map.of(
                            "error",
                            e.getMessage()
                    )
            ).build();
        }
    }
}
