package com.tickets.modelo;

import java.time.LocalDateTime;

public class Ticket {

	private int id;
	private String codigo;
	private String descripcion;
	private EstadoTicket estadoActual;
	private LocalDateTime fechaCreacion;
	private LocalDateTime fechaCierre;
	private int creadoPor;
	private Integer asignadoA;

	public Ticket() {
	}

	public Ticket(int id, String codigo, String descripcion, EstadoTicket estadoActual, LocalDateTime fechaCreacion,
			LocalDateTime fechaCierre, int creadoPor, Integer asignadoA) {
		this.id = id;
		this.codigo = codigo;
		this.descripcion = descripcion;
		this.estadoActual = estadoActual;
		this.fechaCreacion = fechaCreacion;
		this.fechaCierre = fechaCierre;
		this.creadoPor = creadoPor;
		this.asignadoA = asignadoA;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getCodigo() {
		return codigo;
	}

	public void setCodigo(String codigo) {
		this.codigo = codigo;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public EstadoTicket getEstadoActual() {
		return estadoActual;
	}

	public void setEstadoActual(EstadoTicket estadoActual) {
		this.estadoActual = estadoActual;
	}

	public LocalDateTime getFechaCreacion() {
		return fechaCreacion;
	}

	public void setFechaCreacion(LocalDateTime fechaCreacion) {
		this.fechaCreacion = fechaCreacion;
	}

	public LocalDateTime getFechaCierre() {
		return fechaCierre;
	}

	public void setFechaCierre(LocalDateTime fechaCierre) {
		this.fechaCierre = fechaCierre;
	}

	public int getCreadoPor() {
		return creadoPor;
	}

	public void setCreadoPor(int creadoPor) {
		this.creadoPor = creadoPor;
	}

	public Integer getAsignadoA() {
		return asignadoA;
	}

	public void setAsignadoA(Integer asignadoA) {
		this.asignadoA = asignadoA;
	}

}
