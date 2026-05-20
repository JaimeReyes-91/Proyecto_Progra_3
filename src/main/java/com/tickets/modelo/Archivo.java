package com.tickets.modelo;
import java.time.LocalDateTime;
public class Archivo {

	private int id;
	private int ticketId;
	private String nombreOriginal;
	private String nombreGuardado;
	private String rutaArchivo;
	private String mimeType;
	private long tamano;
	private LocalDateTime fechaSubida;

	public Archivo(int id, int ticketId, String nombreOriginal, String nombreGuardado, String rutaArchivo,
			String mimeType, long tamano, LocalDateTime fechaSubida) {
		super();
		this.id = id;
		this.ticketId = ticketId;
		this.nombreOriginal = nombreOriginal;
		this.nombreGuardado = nombreGuardado;
		this.rutaArchivo = rutaArchivo;
		this.mimeType = mimeType;
		this.tamano = tamano;
		this.fechaSubida = fechaSubida;
	}

	public Archivo() {

	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getTicketId() {
		return ticketId;
	}

	public void setTicketId(int ticketId) {
		this.ticketId = ticketId;
	}

	public String getNombreOriginal() {
		return nombreOriginal;
	}

	public void setNombreOriginal(String nombreOriginal) {
		this.nombreOriginal = nombreOriginal;
	}

	public String getNombreGuardado() {
		return nombreGuardado;
	}

	public void setNombreGuardado(String nombreGuardado) {
		this.nombreGuardado = nombreGuardado;
	}

	public String getRutaArchivo() {
		return rutaArchivo;
	}

	public void setRutaArchivo(String rutaArchivo) {
		this.rutaArchivo = rutaArchivo;
	}

	public String getMimeType() {
		return mimeType;
	}

	public void setMimeType(String mimeType) {
		this.mimeType = mimeType;
	}

	public long getTamano() {
		return tamano;
	}

	public void setTamano(long tamano) {
		this.tamano = tamano;
	}

	public LocalDateTime getFechaSubida() {
		return fechaSubida;
	}

	public void setFechaSubida(LocalDateTime fechaSubida) {
		this.fechaSubida = fechaSubida;
	}



}
