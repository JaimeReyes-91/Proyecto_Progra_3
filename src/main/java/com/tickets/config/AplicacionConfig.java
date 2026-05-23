package com.tickets.config;

import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;

import jakarta.ws.rs.ApplicationPath;

// Acá se encuentra la configuración principal para JAX-RS.


@ApplicationPath("/system") // system es la ruta para todos los endpoints. 
public class AplicacionConfig extends ResourceConfig {

	// Acá se registran las configuraciones al iniciar la aplicación.
    public AplicacionConfig() {

    	// Inicializa base de datos o la crea si no está. 
        DatabaseManager.inicializarBaseDatos();

        DatabaseInitializer.inicializar();

        // Analiza todo el paquete de recursos para que todas las clases de allí funcionen.
        packages("com.tickets.recursos");
        // Esta instruccion convierte objetos java a json.
        register(JacksonFeature.class);
        // Habilita peticiones de multiples partes para subir archivos adjuntos. 
        register(MultiPartFeature.class);
        // Registra el proveedor programado en ObjectMapper para ser utilizado posteriormente. 
        register(ObjectMapperContextResolver.class); 
    }
}