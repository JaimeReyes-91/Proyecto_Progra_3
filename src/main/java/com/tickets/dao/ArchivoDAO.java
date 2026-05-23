package com.tickets.dao;

/* La clase archivcos Dao Es para poder madejar los datos de los
archivos adjuntos de los tickets.*/

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import com.tickets.modelo.Archivo;
import com.tickets.util.ConexionDB;

public class ArchivoDAO {


        // Guarda los archivos ajuntos a la base de datos

    public void guardarArchivo(Archivo archivo) throws Exception {

        String sql = """
                INSERT INTO ticket_adjuntos(
                ticket_id,
                nombre_original,
                nombre_guardado,
                ruta_archivo,
                mime_type,
                tamano
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """;

        try (Connection con = ConexionDB.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, archivo.getTicketId());
            ps.setString(2, archivo.getNombreOriginal());
            ps.setString(3, archivo.getNombreGuardado());
            ps.setString(4, archivo.getRutaArchivo());
            ps.setString(5, archivo.getMimeType());
            ps.setLong(6, archivo.getTamano());

            ps.executeUpdate();
        }
    }

        // lista los archivos de un ticket
    public List<Archivo> listarPorTicket(int ticketId)
            throws Exception {

        List<Archivo> lista = new ArrayList<>();

        String sql = """
                SELECT *
                FROM ticket_adjuntos
                WHERE ticket_id = ?
                """;

        try (Connection con = ConexionDB.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, ticketId);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {

                Archivo archivo = new Archivo();

                archivo.setId(rs.getInt("id"));
                archivo.setTicketId(rs.getInt("ticket_id"));
                archivo.setNombreOriginal(
                        rs.getString("nombre_original")
                );
                archivo.setNombreGuardado(
                        rs.getString("nombre_guardado")
                );
                archivo.setRutaArchivo(
                        rs.getString("ruta_archivo")
                );
                archivo.setMimeType(rs.getString("mime_type"));
                archivo.setTamano(rs.getLong("tamano"));

                lista.add(archivo);
            }
        }

        return lista;
    }

    // busca el archivo por su Id
    public Archivo obtenerPorId(int id) throws Exception {

        String sql = "SELECT * FROM ticket_adjuntos WHERE id = ?";

        try (Connection con = ConexionDB.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {

                Archivo archivo = new Archivo();

                archivo.setId(rs.getInt("id"));
                archivo.setTicketId(rs.getInt("ticket_id"));
                archivo.setNombreOriginal(
                        rs.getString("nombre_original")
                );
                archivo.setNombreGuardado(
                        rs.getString("nombre_guardado")
                );
                archivo.setRutaArchivo(
                        rs.getString("ruta_archivo")
                );
                archivo.setMimeType(rs.getString("mime_type"));
                archivo.setTamano(rs.getLong("tamano"));

                return archivo;
            }
        }

        return null;
    }
}

