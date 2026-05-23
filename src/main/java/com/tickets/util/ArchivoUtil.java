package com.tickets.util;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

// Este apartado se ha configurado para gestionar archivos ajuntos subidos por los usuarios, en especial al crear tickets.
public class ArchivoUtil {

	// En este directorio se guardan todos los archivos.
	private static final String directorio_upload = "C:/tickets/uploads/";

	
	// En esta configuración se trata de aplicar la orden de guardar un archivo. Si ya existe le modifica el nombre de forma aleatoria 
    public static String guardarArchivo(
            InputStream input,
            String nombreOriginal
    ) throws Exception {

        File directorio = new File(directorio_upload);

        if (!directorio.exists()) {
            directorio.mkdirs();
        }

        String extension = obtenerExtension(nombreOriginal);

        String nombreGuardado =
                UUID.randomUUID() + extension;

        Path ruta = Paths.get(
                directorio_upload + nombreGuardado
        );

        Files.copy(
                input,
                ruta,
                StandardCopyOption.REPLACE_EXISTING
        );

        return nombreGuardado;
    }

    // Este codigo se encarga de extraer la extención de un archivo que se ha guardado.
    public static String obtenerExtension(String nombre) {

        int index = nombre.lastIndexOf('.');

        if (index == -1) {
            return "";
        }

        return nombre.substring(index);
    }

    // Acá se construye la ruta absoluta para un archivo qu está almacenado.
    public static String obtenerRutaCompleta(
            String nombreGuardado
    ) {

        return directorio_upload + nombreGuardado;
    }

}
