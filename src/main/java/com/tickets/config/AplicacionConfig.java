package com.tickets.config;

import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;

public class AplicacionConfig extends ResourceConfig {

    public AplicacionConfig() {

        DatabaseManager.inicializarBaseDatos();

        DatabaseInitializer.inicializar();

        packages("com.tickets.recursos");

        register(JacksonFeature.class);

        register(MultiPartFeature.class);
    }
}
