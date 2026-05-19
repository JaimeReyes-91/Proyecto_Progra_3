package com.tickets.recursos;

import java.util.Map;

import com.tickets.modelo.Usuario;
import com.tickets.servicio.UsuarioServicio;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthRecurso {

    private final UsuarioServicio usuarioServicio =
            new UsuarioServicio();

    @POST
    @Path("/login")
    public Response login(
            Usuario credenciales
    ) {

        try {

            Usuario usuario =
                    usuarioServicio.autenticar(
                            credenciales.getCorreo(),
                            credenciales.getContrasena()
                    );

            if (usuario == null) {

                return Response.status(
                        Response.Status.UNAUTHORIZED
                ).entity(
                        Map.of(
                                "autenticado",
                                false,
                                "mensaje",
                                "Correo o contraseña incorrectos"
                        )
                ).build();
            }

            return Response.ok(
                    Map.of(
                            "autenticado",
                            true,
                            "usuarioId",
                            usuario.getId(),
                            "nombre",
                            usuario.getNombre(),
                            "correo",
                            usuario.getCorreo(),
                            "rol",
                            usuario.getRol()
                    )
            ).build();

        } catch (Exception e) {

            return Response.status(
                    Response.Status.BAD_REQUEST
            ).entity(
                    Map.of(
                            "autenticado",
                            false,
                            "mensaje",
                            e.getMessage()
                    )
            ).build();
        }
    }
}
