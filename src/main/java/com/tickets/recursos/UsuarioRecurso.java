package com.tickets.recursos;

import java.util.Map;

import com.tickets.modelo.Usuario;
import com.tickets.servicio.UsuarioServicio;

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

@Path("/usuarios")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UsuarioRecurso {

    private final UsuarioServicio usuarioServicio =
            new UsuarioServicio();

    @GET
    public Response listar()
    {

        try {

            return Response.ok(
                    usuarioServicio.listarUsuarios()
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

    @POST
    public Response crear(
            Usuario usuario
    ) {

        try {

            usuarioServicio.crearUsuario(
                    usuario
            );

            return Response.status(
                    Response.Status.CREATED
            ).entity(
                    Map.of(
                            "mensaje",
                            "Usuario creado"
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

    @PUT
    @Path("/{id}")
    public Response actualizar(
            @PathParam("id")
            Integer id,

            Usuario usuario
    ) {

        try {

            usuarioServicio.actualizarUsuario(
                    id,
                    usuario
            );

            return Response.ok(
                    Map.of(
                            "mensaje",
                            "Usuario actualizado"
                    )
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

    @DELETE
    @Path("/{id}")
    public Response eliminar(
            @PathParam("id")
            Integer id
    ) {

        try {

            usuarioServicio.eliminarUsuario(
                    id
            );

            return Response.ok(
                    Map.of(
                            "mensaje",
                            "Usuario eliminado"
                    )
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
}