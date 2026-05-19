package com.tickets.recursos;

import java.util.Map;

import com.tickets.modelo.EstadoTicket;
import com.tickets.modelo.Ticket;
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

    private final TicketServicio ticketServicio =
            new TicketServicio();

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
    public Response crear(
            Ticket ticket
    ) {

        try {

            Ticket creado =
                    ticketServicio.crear(
                            ticket.getDescripcion(),
                            ticket.getCreadoPor()
                    );

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
    @Path("/{id}/{estado}")
    public Response cambiarEstado(
            @PathParam("id")
            int id,

            @PathParam("estado")
            String estado
    ) {

        try {

            ticketServicio.cambiarEstado(
                    id,
                    EstadoTicket.valueOf(estado)
            );

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
