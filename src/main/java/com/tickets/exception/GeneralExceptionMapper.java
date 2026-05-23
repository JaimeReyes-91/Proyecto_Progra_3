package com.tickets.exception;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

// Acá se manejan de forma general las excepciones no configuradas en la aplicación.
@Provider
public class GeneralExceptionMapper implements ExceptionMapper<Exception> {

	// Convierte una exception en una respuesta http 500
	@Override
    public Response toResponse(Exception exception) {

        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(exception.getMessage()) // En esta línea se establece el mensaje de la excepción
                .type(MediaType.TEXT_PLAIN)
                .build();
    }
}
