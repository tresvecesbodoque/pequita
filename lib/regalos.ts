// Lista de deseos — el contenido, que es fijo y vive en el código.
//
// Sale del documento "Regalitos para mi Isi preciosa" (las fotos se importan
// con `scripts/importar-fotos-regalos.py`), pero ya NO es una copia suya: el
// 2026-08-06 se contrastó ficha por ficha con las tiendas y se corrigió lo que
// no cuadraba. Lo ÚNICO que se guarda en la base de datos es quién se apuntó a
// cada cosa: ver `app/api/regalos/route.ts`.
//
// Los `id` son la llave de esa tabla: cambiar uno pierde el "check" que alguien
// ya hizo. Se pueden añadir cosas nuevas sin miedo; renombrar, no.
//
// El orden de las categorías NO es decorativo: primero lo que se consigue hoy
// mismo en el súper o la farmacia, y al final lo que hay que esperar a que
// despachen. El cumpleaños manda.

export type Presupuesto = "detalle" | "regalito" | "regalon";

export const PRESUPUESTOS: { id: Presupuesto; label: string; pista: string }[] = [
  { id: "detalle", label: "Un detalle", pista: "hasta $10.000" },
  { id: "regalito", label: "Un regalito", pista: "$10.000 a $30.000" },
  { id: "regalon", label: "Un regalón", pista: "sobre $30.000" },
];

export type Regalo = {
  id: string;
  nombre: string;
  /** Marca o modelo, en una línea corta bajo el nombre. */
  marca?: string;
  detalle: string;
  /** Precio en pesos, cuando se sabe. Solo para mostrar. */
  precio?: number;
  /** "Desde", "aprox."… cuando el precio no es exacto. */
  precioNota?: string;
  presupuesto: Presupuesto;
  /**
   * Si se consigue hoy mismo (súper, farmacia) o si hay que esperar a que lo
   * despachen. Se deja sin poner cuando depende de dónde se compre —el reloj
   * en una relojería es hoy y en Mercado Libre no—, y entonces no se dice nada.
   */
  plazo?: "hoy" | "dias";
  /** Enlace directo a la ficha del producto. */
  url?: string;
  /** Nombre de la tienda o del sitio (lo que se lee en el botón). */
  tienda?: string;
  /** Si no hay enlace directo: qué buscar. Se abre una búsqueda. */
  busqueda?: string;
  /** Fotos en public/regalos/. La primera manda. */
  fotos?: string[];
  /** Aviso importante para quien compre (tono, talla, trampa del enlace). */
  aviso?: string;
};

export type CategoriaRegalos = {
  id: string;
  titulo: string;
  resumen: string;
  items: Regalo[];
};

export const CATEGORIAS_REGALOS: CategoriaRegalos[] = [
  {
    id: "diario",
    titulo: "Lo de todos los días",
    resumen: "Cosas que ocupa siempre y que ya se le están acabando.",
    items: [
      {
        id: "agua-micelar",
        nombre: "Agua micelar bifásica",
        marca: "Garnier Skin Active",
        detalle:
          "La amarilla: el color viene de la capa de aceite de argán que flota arriba, y hay que agitarla antes de usar. Sirve para maquillaje a prueba de agua, ojos y labios. Formato de 400 ml.",
        presupuesto: "detalle",
        plazo: "hoy",
        tienda: "Farmacia o super",
        busqueda: "agua micelar bifásica Garnier Skin Active 400 ml",
      },
      {
        id: "brillo-extreme-shine",
        nombre: "Brillo de labios Extreme Shine",
        marca: "Essence",
        detalle: "Tono 13 · Glazed Berry, el rosa frambuesa de la foto.",
        precio: 3999,
        presupuesto: "detalle",
        plazo: "hoy",
        tienda: "salcobrand.cl",
        url: "https://salcobrand.cl/products/essence-brillo-de-labios-extreme-shine-13-glazed-berry",
        fotos: ["/regalos/brillo-extreme-shine.jpg"],
        aviso:
          "Ojo con el número: es el 13, no el 101. Este enlace ya va al tono correcto; en otras tiendas hay que elegirlo a mano y la foto es lo que manda.",
      },
      {
        id: "what-a-tint",
        nombre: "Tinte de labios y mejillas",
        marca: "Essence · What a Tint",
        detalle: "Tono vino oscuro / rosewood, el primero de los tres.",
        precio: 4990,
        precioNota: "desde",
        presupuesto: "detalle",
        plazo: "hoy",
        tienda: "dbs.cl",
        url: "https://dbs.cl/tinte-para-labios-y-mejillas-what-a-tint-ee-38242",
        fotos: ["/regalos/what-a-tint.jpg"],
        aviso:
          "El enlace abre la ficha con todos los tonos: hay que elegir el vino oscuro dentro del sitio, el de la foto.",
      },
      {
        id: "esmaltes-permanentes",
        nombre: "Esmaltes permanentes",
        marca: "De cualquier color",
        detalle:
          "Le gusta hacer diseños en sus uñas, así que ningún color le sobra: aquí no hay forma de equivocarse. La lámpara ya la tiene.",
        presupuesto: "detalle",
        plazo: "hoy",
        tienda: "Tienda de belleza",
        busqueda: "esmalte permanente gel uñas lámpara UV LED",
      },
    ],
  },
  {
    id: "dulces",
    titulo: "Dulces y antojos",
    resumen: "Lo que se compra en el súper y le alegra el día igual.",
    items: [
      {
        id: "alpenrahm",
        nombre: "Alpenrahm Schokolade",
        marca: "Chocolate de leche alemán",
        detalle: "El de la barra alemana clásica.",
        presupuesto: "detalle",
        plazo: "hoy",
        tienda: "Jumbo",
        busqueda: "Alpenrahm Schokolade chocolate de leche",
      },
      {
        id: "galletas-ruths",
        nombre: "Galletas Ruths",
        detalle: "Doble chocolate, o bien las de chocolate blanco con frambuesa.",
        presupuesto: "detalle",
        plazo: "hoy",
        tienda: "Jumbo",
        busqueda: "galletas Ruths doble chocolate",
      },
      {
        id: "trento-limon",
        nombre: "Trento limón",
        detalle: "La barra de wafer sabor limón.",
        presupuesto: "detalle",
        plazo: "hoy",
        tienda: "Supermercado",
        busqueda: "Trento limón wafer",
      },
    ],
  },
  {
    id: "accesorios",
    titulo: "Accesorios y regalos",
    resumen: "Lo que no necesita, pero le haría mucha ilusión.",
    items: [
      {
        id: "reloj-casio-rosado",
        nombre: "Reloj Casio",
        marca: "LTP-V002D-4B",
        detalle:
          "El clásico de toda la vida: esfera rosada con la fecha a las tres, caja plateada y pulsera de acero.",
        precio: 31990,
        precioNota: "aprox.",
        presupuesto: "regalon",
        busqueda: "Casio LTP-V002D-4B reloj mujer esfera rosada acero",
        aviso:
          "El código del modelo es lo que hay que buscar: hay muchos Casio rosados y este es el de la esfera rosa con pulsera de acero. Ronda los $32.000, aunque se ha visto hasta en $48.000.",
      },
      {
        id: "neceser-cannes",
        nombre: "Neceser Cannes",
        marca: "Bubba",
        detalle:
          "Un compartimento amplio con cierre arriba, para llevarse lo de siempre a todas partes. Estampado de animal print con detalles en neón.",
        precio: 13993,
        presupuesto: "regalito",
        plazo: "dias",
        tienda: "bubbabags.cl",
        url: "https://bubbabags.cl/products/neceser-cannes-ene-26",
        aviso:
          "Viene en tres estampados y hoy solo queda el Zebra: el Cheeta y el Cow están agotados.",
      },
      {
        id: "polly-pocket",
        nombre: "Polly Pocket clásica",
        detalle:
          "La versión clásica, la de la cajita que se abre. Las nuevas no son lo mismo.",
        presupuesto: "regalito",
        busqueda: "Polly Pocket clásica vintage cajita",
        aviso:
          "Nuevas ya no se hacen: aparecen de segunda mano en Mercado Libre y en ferias. Los precios bailan mucho, conviene comparar antes.",
      },
    ],
  },
  {
    id: "ropa",
    titulo: "Ropa y calzado",
    resumen:
      "Tallas y colores confirmados, para no jugársela. Todo esto viaja por encomienda, así que no llega de un día para otro.",
    items: [
      {
        id: "botas-polonia",
        nombre: "Botas Desmontables Polonia",
        marca: "Tienda Huellas",
        detalle:
          "Ecocuero, taco de 6,5 cm, horma normal. Se les saca la caña y quedan como botín: son dos pares en uno.",
        precio: 39990,
        presupuesto: "regalon",
        plazo: "dias",
        tienda: "tiendahuellas.cl",
        url: "https://tiendahuellas.cl/producto/botas-desmontables-polonia-cafe/",
        fotos: ["/regalos/botas-polonia-larga.jpg", "/regalos/botas-polonia-botin.jpg"],
        aviso:
          "Talla 37, disponible. Este enlace es el del café; el negro tiene su propia ficha en la tienda.",
      },
      {
        id: "hoodie-rosado",
        nombre: "Polerón hoodie rosado",
        marca: "Kadenkas · Otoño Invierno 2026",
        detalle: "Oversize, con gorro y el logo bordado al centro.",
        precio: 34990,
        presupuesto: "regalon",
        plazo: "dias",
        tienda: "kadenkas.com",
        url: "https://kadenkas.com/products/poleron-hoodie-rosado-oversize-con-gorro-logo-bordado",
        fotos: ["/regalos/hoodie-rosado.jpg"],
        aviso: "Talla M, disponible.",
      },
      {
        id: "pantalon-buzo-rosado",
        nombre: "Pantalón buzo rosado",
        marca: "Kadenkas · hace conjunto con el polerón",
        detalle: "Corte recto, logo bordado en la pierna.",
        precio: 24990,
        presupuesto: "regalito",
        plazo: "dias",
        tienda: "kadenkas.com",
        url: "https://kadenkas.com/products/pantalon-buzo-rosado-corte-recto-logo-bordado",
        fotos: ["/regalos/pantalon-buzo-rosado.jpg"],
        aviso: "Talla M, disponible.",
      },
    ],
  },
];

export const REGALOS = CATEGORIAS_REGALOS.flatMap((c) => c.items);

/** Ids válidos: la ruta no acepta ningún otro (nadie llena la tabla de basura). */
export const IDS_REGALOS = new Set(REGALOS.map((r) => r.id));

/** Enlace del botón: la ficha del producto o, si no hay, una búsqueda. */
export function enlaceRegalo(r: Regalo): string | null {
  if (r.url) return r.url;
  if (r.busqueda) {
    return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(r.busqueda)}`;
  }
  return null;
}

export function precioLegible(r: Regalo): string | null {
  if (!r.precio) return null;
  const cifra = `$${r.precio.toLocaleString("es-CL")}`;
  return r.precioNota ? `${cifra} ${r.precioNota}` : cifra;
}

/** Cómo se lee el campo `plazo` en la ficha. */
export const PLAZOS: Record<"hoy" | "dias", string> = {
  hoy: "Se compra hoy",
  dias: "Llega en unos días",
};

/** Avisos de despacho a Talca, al pie del panel. */
export const NOTAS_ENVIO = [
  {
    tienda: "Tienda Huellas",
    texto:
      "Despacha desde Temuco a todo Chile en 5 días hábiles. Envío gratis sobre $100.000; con las botas solas hay que pagarlo, y el monto recién aparece al momento de pagar.",
  },
  {
    tienda: "Kadenkas",
    texto:
      "Despacha desde Santiago por Blue Express, 2 a 4 días hábiles a regiones. Envío gratis sobre $70.000: el polerón y el pantalón juntos suman $59.980.",
  },
];
