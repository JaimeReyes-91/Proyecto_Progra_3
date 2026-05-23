package com.tickets.recursos;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;

import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;

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

// Es el archivo que se encarga de las peticiones con realacion a los archivos

@Path("/archivos")
public class ArchivoRecurso {

    private final ArchivoServicio archivoServicio =
            new ArchivoServicio();

        // Este metodo sirver para subir un archivo
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

    //Esta funcion nos ayuda a ver el archivo de un ticket

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

    // Este metodo sirve para para descargar y o abrir el archivo

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

             String mimeType = archivo.getMimeType();
                if (mimeType == null || mimeType.isBlank() || mimeType.equals("application/octet-stream")) {
                mimeType = java.nio.file.Files.probeContentType(file.toPath());
                if (mimeType == null) mimeType = "application/octet-stream";
                }

        return Response.ok(new FileInputStream(file))
                .type(mimeType)
                .header("Content-Disposition",
                        "inline; filename=\"" + archivo.getNombreOriginal() + "\"")
                .header("Content-Length", file.length())
                .build();

        } catch (Exception e) {

            return Response.serverError()
                    .entity(e.getMessage())
                    .build();
        }
    }
}
