package com.tickets.util;

public class CodigoTicketUtil {

	public static String generarCodigo(int id) {
		return String.format("TKT-%04d", id);
	}
}
