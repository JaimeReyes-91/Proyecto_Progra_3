package com.tickets.servicio;

import java.io.InputStream;
import java.util.List;

import com.tickets.dao.ArchivoDAO;
import com.tickets.modelo.Archivo;
import com.tickets.util.ArchivoUtil;

public class ArchivoServicio {

    private final ArchivoDAO archivoDAO = new ArchivoDAO();

    public void subirArchivo(
            int ticketId,
            String nombreOriginal,
            String mimeType,
            long tamano,
            InputStream input
    ) throws Exception {

        if (mimeType == null || mimeType.isBlank() || mimeType.equals("application/octet-stream")) {
        mimeType = detectarMime(nombreOriginal);
    }

        String nombreGuardado = ArchivoUtil.guardarArchivo(
                input,
                nombreOriginal
        );

        Archivo archivo = new Archivo();

        archivo.setTicketId(ticketId);
        archivo.setNombreOriginal(nombreOriginal);
        archivo.setNombreGuardado(nombreGuardado);

        archivo.setRutaArchivo(
                ArchivoUtil.obtenerRutaCompleta(nombreGuardado)
        );

        archivo.setMimeType(mimeType);
        archivo.setTamano(tamano);

        archivoDAO.guardarArchivo(archivo);
    }

    private String detectarMime(String nombreArchivo) {
    if (nombreArchivo == null) return "application/octet-stream";
    String n = nombreArchivo.toLowerCase();
    if (n.endsWith(".pdf"))  return "application/pdf";
    if (n.endsWith(".png"))  return "image/png";
    if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
    if (n.endsWith(".doc"))  return "application/msword";
    if (n.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    return "application/octet-stream";
}

    public List<Archivo> listarArchivos(int ticketId)
            throws Exception {

        return archivoDAO.listarPorTicket(ticketId);
    }

    public Archivo obtenerArchivo(int id) throws Exception {

        return archivoDAO.obtenerPorId(id);
    }
}
