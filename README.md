<!-- Test Conexa -->

Proyecto desarrollado en NestJS con TypeORM y MySQL.

# Requisitos previos

Antes de iniciar la aplicación, asegúrate de tener instaladas las siguientes tecnologías:

Node.js v20 o superior (te recomiendo usar Node.js 23)

npm (incluido con Node.js)

MySQL (versión 5.7 o superior)

Git

# Configuración de la base de datos

Instalar MySQL si no lo tienes.

Crear una base de datos, por ejemplo: test_conexa_bdd.

Configurar las credenciales de acceso en un archivo .env en la raíz del proyecto:

DB_HOST=127.0.0.1

DB_PORT=3306

DB_USERNAME=root

DB_PASSWORD=Prueba123

DB_NAME=test_conexa_bdd

JWT_SECRET=secretoSuperSeguro

JWT_EXPIRES_IN=1h

STAR_WARS_API_URL=https://swapi.dev/api

El .env ademas nos ayudara a configurar otras variables globales

# Instalación y ejecución

## Instalar las dependencias:

npm install

## Iniciar la aplicación:

npm run start

Esta configurado en el init del app module para insertar un user admin siempre y cuando no exista otro user con role admin

# Endpoints principales

La API expone los siguientes endpoints principales:

Autenticación: /auth/login, /auth/register

Usuarios: /users

Películas: /movies

Puedes probarlos con SWAGGER en http://localhost:3000/api

# Notas

Si tienes problemas con la versión de Node.js, puedes usar nvm para administrar versiones.
Se recomienda no usar credenciales en texto plano en .env, sino almacenarlas de forma segura, usando docker compose por ejemplo.


