package com.tickets.util;

// Este es el generador de codigos para cada ticket, Ej. TKM-...
public class CodigoTicketUtil {

	// Genera el codigo a partir del id, rellena con ceros hasta que la parte entera tenga cuatro dígitos.
	public static String generarCodigo(int id) {
		return String.format("TKT-%04d", id);
	}
}
