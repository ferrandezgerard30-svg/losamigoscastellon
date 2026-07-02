# Web — Peluquería Barbería Los Amigos (Castellón de la Plana)

Sitio estático: HTML + CSS + JS puro. Sin librerías, sin CDNs, funciona offline.
Páginas: `index.html` · `servicios.html` · `galeria.html` · `contacto.html`.

## Publicar en GitHub Pages (3 pasos)
1. Crea un repositorio y sube TODO el contenido de esta carpeta a la raíz (incluye `.nojekyll`).
2. En GitHub: Settings → Pages → Source: "Deploy from a branch" → rama `main`, carpeta `/ (root)`.
3. Espera ~1 minuto y abre la URL que te da GitHub. Después sustituye en las 4 páginas
   `https://losamigosbarberia.example/...` (etiqueta `<link rel="canonical">`) por tu URL real.

## Cómo editar datos (buscar y reemplazar en los 4 HTML)
- Teléfono: busca `617034680` (enlaces tel/WhatsApp) y `617 03 46 80` (texto visible).
- Horario: busca `9:00` / `17:00` / `21:00` y también la tabla de `contacto.html`.
- Valoración/reseñas: busca `4,8` y `155`.
- Dirección: busca `Joaqu&iacute;n Costa`.
- Precios: en `servicios.html`, bloques `.price`.
- Los acentos van con entidades HTML (`&aacute;`, `&ntilde;`, `&euro;`…): mantenlo al editar.

## Qué revisar / confirmar con el negocio
- **Perfilar — 5 €**: en la foto del escaparate se lee parcialmente ("…ilar 5€"). Confírmalo.
- Los precios de **Arreglo de barba**, **Corte + barba** y **Corte con diseño** salen cortados
  en la foto → están como "Consultar". Si te pasan las cifras, sustitúyelas en `servicios.html`.
- El rótulo del escaparate muestra dos líneas más ("Corte de pelo + la…" y "Corte + Barba + la…",
  seguramente "+ lavado"): no se añadieron por no ser legibles. Añádelas cuando las confirmen.
- WhatsApp: incluido porque la placa del horario muestra el icono de WhatsApp junto al teléfono.
- No hay mapa embebido (rompería el modo offline y añade cookies de terceros): hay tarjeta de
  ubicación + enlace "Cómo llegar" a Google Maps. Si prefieres iframe de Maps, dímelo.
- El Instagram @peluquerialosamigos1 NO se ha incluido: no está confirmado que sea del local
  (muestra otro teléfono y otro horario). Si lo confirman, se añade en footer y contacto.

## Notas técnicas
- Tipografías locales en `assets/fonts` (Fraunces, Oswald, Karla — subseteadas, ~200 KB total).
- Animaciones solo con transform/opacity; respetan `prefers-reduced-motion`; fallback `<noscript>`
  y failsafe: nada queda invisible si el JS falla.
- El preloader solo se muestra una vez por sesión (sessionStorage).
- Imágenes en `assets/img` (.webp optimizadas). `og-image.jpg`, `favicon.png` y
  `apple-touch-icon.png` generados desde la foto de la fachada y el wordmark.
