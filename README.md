# LOTUS (PIC_TPM) — Aplicación Domino / XPages (diseño on-disk)

Este repositorio contiene el **diseño** de una aplicación **HCL Domino (Notes/Domino)** exportada a disco (“Domino Designer on-disk project”). No es un proyecto tipo Node/React tradicional: aquí se versionan **XPages, Formularios, Vistas, Librerías de Script y Recursos** que finalmente viven dentro de una **base NSF**.

## Qué hay en este proyecto

- **UI web (XPages)**: páginas en `XPages/` con namespaces `xp:` (XPages core) y `xc:` (custom controls).
- **Controles reutilizables**: `CustomControls/` (por ejemplo `ccLayout`, `ccLayoutVista`) que proveen layout, recursos globales (Bootstrap/jQuery) y componentes comunes.
- **Lógica de servidor**: JavaScript server-side en `Code/ScriptLibraries/*.jss` (destaca `ssCommon.jss`).
- **Lógica de cliente**: JavaScript en `Code/ScriptLibraries/*.js` (convención `JSFr*` por dominio funcional).
- **LotusScript / Agentes**: `Code/ScriptLibraries/*.lss` y `Code/Agents/` para automatizaciones y lógica clásica de Notes.
- **Diseño Notes**:
  - Formularios: `Forms/`
  - Vistas: `Views/` (incluye vistas programáticas tipo `(Prog ...)`)
  - Framesets y páginas clásicas: `Framesets/`, `Pages/`
  - Elementos compartidos: `SharedElements/` (subforms, fields, columns)
- **Recursos**:
  - Recursos de diseño Domino: `Resources/` (themes, stylesheets, imágenes, archivos)
  - Recursos web estáticos: `WebContent/` (incluye CKEditor y otros assets)
- **Configuración/metadata del proyecto**:
  - `plugin.xml`, `.project`, `.classpath` (propios del proyecto Designer/Eclipse)
  - `AppProperties/` (metadata de la base; puede contener información de entorno)
  - `WebContent/WEB-INF/` (p. ej. `xsp.properties`)

## Convenciones y patrones importantes

### Prefijos de XPages

- **`xv*`**: páginas de **vista/listado** que normalmente usan `xp:dominoView` y muestran datos desde `Views/` (vistas `vw*`).
- **`xa*`**: páginas de **servicio/AJAX**. Ejemplo: `XPages/xaServicios.xsp` usa un parámetro `accion` y despacha en `afterRenderResponse` para responder (frecuentemente) JSON.

### Librerías clave

- **`Code/ScriptLibraries/ssCommon.jss`**: helpers y utilidades del lado servidor (por ejemplo escritura de respuesta HTTP/JSON).
- **`CustomControls/ccLayout.xsp`**: layout global, carga de CSS/JS y variables “globales” usadas por pantallas.

## Estructura (vista rápida)

```text
LOTUS/
  AppProperties/
  Code/
    Agents/
    ScriptLibraries/
  CustomControls/
  Forms/
  Framesets/
  Pages/
  Resources/
  SharedElements/
  Views/
  WebContent/
  XPages/
  plugin.xml
  .project
  .classpath
```

## Cómo trabajar con este repositorio

### Requisitos

- **HCL Domino Designer** (versión alineada con tu entorno Domino).
- Acceso a un servidor Domino o entorno local para probar (según tu proceso interno).

### Abrir en Domino Designer

1. Importa/abre el proyecto como **“Domino Designer on-disk project”** (Team Development / Source Control / NSF on-disk).
2. Verifica que el builder de sincronización esté activo (en `.project` se referencia el builder de Designer).
3. Sincroniza el diseño hacia la NSF según el flujo de tu equipo.

> Nota: este repo versiona el **diseño**, no la NSF en sí.

## Git

- Existe un `.gitignore` en la raíz para ignorar ruido local (logs, `.settings/`, outputs, `node_modules`, etc.).
- **No** se ignoran carpetas de diseño (`XPages/`, `Forms/`, `Views/`, `Code/`, `Resources/`, `WebContent/`).

## Contexto para IA (Cursor)

Para que la IA tenga siempre presente el contexto Domino/XPages (estructura, stack y convenciones), hay una regla en:

- `.cursor/rules/lotus-tpm-contexto.mdc`

## Seguridad / datos sensibles

- Evita publicar en issues/PRs información de entorno que pueda aparecer en metadata (rutas de servidor, nombres de personas del ACL, etc.).

