# HTTP Status Codes – Project Conventions

Este documento describe **cuándo usar cada HTTP status code en este backend**.
No es una referencia general de HTTP, sino las decisiones de este proyecto.

---

## 200 OK

Se usa cuando:

- Una operación GET o PATCH devuelve un recurso correctamente.
- El recurso existe y se devuelve contenido.

Ejemplos:

- GET /users/:id
- PATCH /users/:id

---

## 201 Created

Se usa cuando:

- Se crea un nuevo recurso como resultado de un POST.

Ejemplos:

- POST /users

Notas:

- El response body contiene el recurso creado.

---

## 204 No Content

Se usa cuando:

- La operación se ha realizado correctamente
- No hay contenido que devolver

Ejemplos:

- DELETE /users/:id

---

## 400 Bad Request

Se usa cuando:

- El cliente envía datos inválidos
- Fallan validaciones de entrada (Zod)

Ejemplos:

- Email con formato inválido
- Body mal formado

Notas:

- No usar para errores de negocio.

---

## 404 Not Found

Se usa cuando:

- El recurso solicitado no existe

Ejemplos:

- GET /users/:id (id inexistente)
- PATCH /users/:id (id inexistente)

---

## 409 Conflict

Se usa cuando:

- La petición es válida
- Pero viola una restricción del dominio

Ejemplos:

- Crear usuario con email duplicado
- Cambiar email a uno ya existente

---

## 401 Unauthorized

Se usará cuando:

- El endpoint requiere autenticación
- El cliente no está autenticado o el token es inválido

---

## 403 Forbidden

Se usará cuando:

- El cliente está autenticado
- Pero no tiene permisos para la operación

---

## 500 Internal Server Error

Se usa cuando:

- Se produce un error inesperado
- No atribuible al cliente

Notas:

- Nunca lanzar explícitamente desde un use case.
