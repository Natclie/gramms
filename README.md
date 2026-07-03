##  Acortador de URLs

* Acorta cualquier enlace largo.
* Genera un slug aleatorio automáticamente.
* Evita duplicar enlaces para un mismo usuario.
* Genera automaticamente un QR por enlace

##  Autenticación

* Inicio de sesión con Google mediante Supabase Auth.
* Persistencia de la sesión.

##  Dashboard

* Lista todos los enlaces del usuario.
* Muestra la URL original.
* Muestra la URL corta.
* Permite eliminar enlaces.
* Crea un QR para cada enlace.

##  Seguridad

* Rate limiting por IP.
* Captcha matemático sencillo para evitar bots.
* Validación de URLs.
* Validación del slug.
* Reintentos automáticos si un slug ya existe.
* Row Level Security (RLS) mediante Supabase.

##  Feedback

* Formulario para enviar sugerencias o reportar errores.
* No requiere iniciar sesión.

##  Tecnologias

* Vercel.
* Supabase.
* Astro.
* React.
