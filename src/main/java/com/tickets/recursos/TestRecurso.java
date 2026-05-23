package com.tickets.recursos;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;

// valida que el backen este activo

@Path("/test")
public class TestRecurso {

    @GET
    @Produces("text/plain")
    public String test() {

        return "Backend funcionando";
    }
}