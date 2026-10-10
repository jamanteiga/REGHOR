# REGHOR — Cambios pendientes en Supabase (3 de las 9 mejoras)

Estos 3 puntos no los puedo ejecutar yo directamente (no tengo acceso al panel de Supabase ni conexión de red a tu proyecto desde aquí). Cópialos y pégalos en **Supabase → SQL Editor → New query** y dale a "Run". Puedes pegar los tres bloques juntos o uno a uno, en el orden en que aparecen aquí.

## 1. Columnas `created_at` / `updated_at`

Añade fecha de creación y de última modificación a cada registro (útil para auditoría, para saber si algo se editó después de guardarlo, y es la base técnica que necesitan backups/sincronización más finos en el futuro).

```sql
alter table public.obras add column if not exists created_at timestamptz not null default now();
alter table public.obras add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_obras_set_updated_at on public.obras;
create trigger trg_obras_set_updated_at
before update on public.obras
for each row execute function public.set_updated_at();
```

Los registros que ya existen se quedan con `created_at`/`updated_at` = el momento en que ejecutes esto (no hay forma de recuperar la fecha real de creación de los antiguos, porque nunca se guardó). A partir de ahora, cada INSERT pone `created_at` automáticamente y cada UPDATE actualiza `updated_at` solo.

## 2. Restricción única para evitar duplicados de AOYV

Esto es un cinturón de seguridad en la propia base de datos, además del arreglo que ya se hizo en `app.js` (que comprobaba duplicados antes de insertar, pero una condición de carrera entre dos pestañas a la vez todavía podía colarse). Con esto, Supabase rechaza directamente un segundo registro "AOYV" en la misma fecha, pase lo que pase en el navegador.

```sql
create unique index if not exists idx_obras_aoyv_unico_por_fecha
on public.obras (fecha)
where tarea = 'AOYV';
```

⚠️ Antes de ejecutar esto, comprueba que no tengas ya dos registros "AOYV" en la misma fecha en tus datos actuales (por ejemplo, los días en los que hubo el problema que arreglamos). Si los hay, la creación del índice fallará con un error de "duplicate key" — avísame y te digo cuáles son para borrar el duplicado antes de reintentar.

## 3. Autenticación real + RLS (Row Level Security)

Esto es el cambio más grande de los tres y el único que requiere tocar también ficheros de la app (`login.html` y `auth.js`), que no tengo en mi copia de trabajo — la protección actual por contraseña en `login.html`/`auth.js` es solo una pantalla en el navegador: cualquiera que tenga la clave pública de Supabase (visible en `config.js`, que es un fichero público en GitHub Pages) puede leer y escribir en la tabla `obras` directamente, sin pasar por `login.html`. Esto lo arregla de raíz.

**Paso 1 — Crear tu usuario en Supabase Auth** (una sola vez, desde el panel):
Supabase → Authentication → Users → "Add user" → pon tu email y una contraseña. Puedes desactivar "Auto Confirm User" si quieres confirmarlo por email, o dejarlo activado para no complicarte.

**Paso 2 — Activar RLS y las políticas de acceso** (SQL Editor):

```sql
alter table public.obras enable row level security;

create policy "obras_select_autenticados" on public.obras
for select using (auth.role() = 'authenticated');

create policy "obras_insert_autenticados" on public.obras
for insert with check (auth.role() = 'authenticated');

create policy "obras_update_autenticados" on public.obras
for update using (auth.role() = 'authenticated');

create policy "obras_delete_autenticados" on public.obras
for delete using (auth.role() = 'authenticated');
```

A partir de aquí, **cualquier petición a `obras` sin una sesión de Supabase Auth iniciada dejará de funcionar** — incluida la propia app, hasta que se complete el Paso 3.

**Paso 3 — Adaptar `login.html`/`auth.js` (pendiente de tu confirmación)**:
Necesito que me pegues el contenido actual de `login.html` y `auth.js` para poder integrarlos sin romper nada (ahora mismo no los tengo). El cambio, en resumen: en vez de comparar una contraseña fija en el navegador, `login.html` pasaría a llamar a `supabaseClient.auth.signInWithPassword({ email, password })` con el usuario que crees en el Paso 1, y cada página (`index.html`, `graficos.html`, `Semana.html`, etc.) comprobaría al cargar que hay una sesión activa (`supabaseClient.auth.getSession()`), redirigiendo a `login.html` si no la hay.

**Importante**: no ejecutes el Paso 2 hasta que el Paso 3 esté listo y subido — si activas RLS antes, la app dejará de poder leer/escribir datos hasta que el login nuevo esté en producción. Dime cuándo quieres hacerlo y te aviso del momento exacto para subir los ficheros nuevos a la vez.
