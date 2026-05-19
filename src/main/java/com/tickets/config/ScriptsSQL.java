package com.tickets.config;

public class ScriptsSQL {

	public static final String TABLA_USUARIOS = """
		CREATE TABLE IF NOT EXISTS usuarios (
		    id SERIAL PRIMARY KEY,
		    nombre VARCHAR(100) NOT NULL,
		    correo VARCHAR(150) NOT NULL UNIQUE,
		    departamento VARCHAR(100),
		    rol VARCHAR(20) NOT NULL,
			contrasena VARCHAR(255) NOT NULL,
		    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		    CONSTRAINT chk_rol
		    CHECK (rol IN ('SOLICITANTE', 'SOPORTE'))
		)
	""";

	public static final String TABLA_TICKETS = """
		CREATE TABLE IF NOT EXISTS tickets (
		    id SERIAL PRIMARY KEY,
		    codigo VARCHAR(20) NOT NULL UNIQUE,
		    descripcion TEXT NOT NULL,
		    estado_actual VARCHAR(20) NOT NULL,
		    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		    fecha_cierre TIMESTAMP,
		    creado_por INTEGER NOT NULL,
		    asignado_a INTEGER,
		    CONSTRAINT fk_ticket_creado_por
		        FOREIGN KEY (creado_por)
		        REFERENCES usuarios(id),
		    CONSTRAINT fk_ticket_asignado_a
		        FOREIGN KEY (asignado_a)
		        REFERENCES usuarios(id),
		    CONSTRAINT chk_estado_ticket
		    CHECK (
		        estado_actual IN (
		            'CREADO',
		            'ASIGNADO',
		            'VALIDACION',
		            'DEVUELTO',
		            'FINALIZADO',
		            'RECHAZADO'
		        )
		    )
		)
	""";

	public static final String TABLA_TICKET_ADJUNTOS = """
		CREATE TABLE IF NOT EXISTS ticket_adjuntos (
		    id SERIAL PRIMARY KEY,
		    ticket_id INTEGER NOT NULL,
		    nombre_original VARCHAR(255) NOT NULL,
		    nombre_guardado VARCHAR(255) NOT NULL,
		    ruta_archivo TEXT NOT NULL,
		    mime_type VARCHAR(100),
		    tamano BIGINT,
		    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		    CONSTRAINT fk_adjunto_ticket
		        FOREIGN KEY (ticket_id)
		        REFERENCES tickets(id)
		        ON DELETE CASCADE
		)
	""";

	public static final String TABLA_TICKET_TIMELINE = """
		CREATE TABLE IF NOT EXISTS ticket_timeline (
		    id SERIAL PRIMARY KEY,
		    ticket_id INTEGER NOT NULL,
		    actor_id INTEGER NOT NULL,
		    estado VARCHAR(20) NOT NULL,
		    observacion TEXT,
		    fecha_evento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		    CONSTRAINT fk_timeline_ticket
		        FOREIGN KEY (ticket_id)
		        REFERENCES tickets(id)
		        ON DELETE CASCADE,
		    CONSTRAINT fk_timeline_actor
		        FOREIGN KEY (actor_id)
		        REFERENCES usuarios(id),
		    CONSTRAINT chk_timeline_estado
		    CHECK (
		        estado IN (
		            'CREADO',
		            'ASIGNADO',
		            'VALIDACION',
		            'DEVUELTO',
		            'FINALIZADO',
		            'RECHAZADO'
		        )
		    )
		)
	""";
}
