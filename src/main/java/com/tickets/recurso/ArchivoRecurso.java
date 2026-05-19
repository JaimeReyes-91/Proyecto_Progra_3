package com.tickets.recurso;

import com.tickets.modelo.Archivo;
import com.tickets.servicio.ArchivoServicio;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;

@Path("/archivos")
public class ArchivoRecurso {

    private final ArchivoServicio archivoServicio =
            new ArchivoServicio();

    @POST
    @Path("/upload/{ticketId}")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response subirArchivo(
            @PathParam("ticketId") int ticketId,

            @FormDataParam("archivo")
            InputStream input,

            @FormDataParam("archivo")
            FormDataContentDisposition fileDetail
    ) {

        try {

            archivoServicio.subirArchivo(
                    ticketId,
                    fileDetail.getFileName(),
                    "application/octet-stream",
                    0,
                    input
            );

            return Response.ok(
                    "Archivo subido correctamente"
            ).build();

        } catch (Exception e) {

            return Response.serverError()
                    .entity(e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/ticket/{ticketId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response listarArchivos(
            @PathParam("ticketId") int ticketId
    ) {

        try {

            return Response.ok(
                    archivoServicio.listarArchivos(ticketId)
            ).build();

        } catch (Exception e) {

            return Response.serverError()
                    .entity(e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/download/{id}")
    public Response descargarArchivo(
            @PathParam("id") int id
    ) {

        try {

            Archivo archivo = archivoServicio.obtenerArchivo(id);

            if (archivo == null) {

                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Archivo no encontrado")
                        .build();
            }

            File file = new File(archivo.getRutaArchivo());

            if (!file.exists()) {

                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Archivo físico no encontrado")
                        .build();
            }

            return Response.ok(
                    new FileInputStream(file)
            )
                    .header(
                            "Content-Disposition",
                            "attachment; filename=\""
                                    + archivo.getNombreOriginal()
                                    + "\""
                    )
                    .build();

        } catch (Exception e) {

            return Response.serverError()
                    .entity(e.getMessage())
                    .build();
        }
    }
}
