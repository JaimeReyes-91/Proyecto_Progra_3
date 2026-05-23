package com.tickets.modelo;

// es el modelo que representa un usuario.

import java.sql.Timestamp;

public class Usuario {
    int id;
    String nombre;
    String correo;
    String departamento;
    String rol;
    Timestamp fecha_creacion;
	String contrasena;

    public Usuario() {}

	public Usuario(int id, String nombre, String correo, String departamento, String rol, Timestamp fecha_creacion, String contrasena) {
		super();
		this.id = id;
		this.nombre = nombre;
		this.correo = correo;
		this.departamento = departamento;
		this.rol = rol;
		this.fecha_creacion = fecha_creacion;
		this.contrasena = contrasena;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getCorreo() {
		return correo;
	}

	public void setCorreo(String correo) {
		this.correo = correo;
	}

	public String getDepartamento() {
		return departamento;
	}

	public void setDepartamento(String departamento) {
		this.departamento = departamento;
	}

	public String getRol() {
		return rol;
	}

	public void setRol(String rol) {
		this.rol = rol;
	}

	public Timestamp getFecha_creacion() {
		return fecha_creacion;
	}

	public void setFecha_creacion(Timestamp fecha_creacion) {
		this.fecha_creacion = fecha_creacion;
	}

	public String getContrasena() {
		return contrasena;
	}

	public void setContrasena(String contrasena) {
		this.contrasena = contrasena;
	}



}
