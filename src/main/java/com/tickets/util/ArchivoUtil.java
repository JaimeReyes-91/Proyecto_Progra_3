package com.tickets.util;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

public class ArchivoUtil {

	private static final String directorio_upload = "C:/tickets/uploads/";

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

    public static String obtenerExtension(String nombre) {

        int index = nombre.lastIndexOf('.');

        if (index == -1) {
            return "";
        }

        return nombre.substring(index);
    }

    public static String obtenerRutaCompleta(
            String nombreGuardado
    ) {

        return directorio_upload + nombreGuardado;
    }

}
