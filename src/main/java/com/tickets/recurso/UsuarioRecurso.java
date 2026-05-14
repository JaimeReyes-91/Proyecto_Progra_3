package com.tickets.recurso;

import com.tickets.modelo.Usuario;
import com.tickets.servicio.UsuarioServicio;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
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
    public Response listarUsuarios() {

        try {

            return Response.ok(
                    usuarioServicio.listarUsuarios()
            ).build();

        } catch (Exception e) {

            return Response.serverError()
                    .entity(e.getMessage())
                    .build();
        }
    }

    @POST
    public Response crearUsuario(Usuario usuario) {

        try {

            usuarioServicio.crearUsuario(usuario);

            return Response.status(Response.Status.CREATED)
                    .entity("Usuario creado correctamente")
                    .build();

        } catch (Exception e) {

            return Response.serverError()
                    .entity(e.getMessage())
                    .build();
        }
    }


}
