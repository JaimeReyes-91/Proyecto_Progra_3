package com.tickets.servicio;

import com.tickets.dao.ArchivoDAO;
import com.tickets.modelo.Archivo;
import com.tickets.util.ArchivoUtil;

import java.io.InputStream;
import java.util.List;

public class ArchivoServicio {

    private final ArchivoDAO archivoDAO = new ArchivoDAO();

    public void subirArchivo(
            int ticketId,
            String nombreOriginal,
            String mimeType,
            long tamano,
            InputStream input
    ) throws Exception {

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

    public List<Archivo> listarArchivos(int ticketId)
            throws Exception {

        return archivoDAO.listarPorTicket(ticketId);
    }

    public Archivo obtenerArchivo(int id) throws Exception {

        return archivoDAO.obtenerPorId(id);
    }
}
