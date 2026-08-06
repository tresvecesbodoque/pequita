// Lista de deseos — el contenido, que es fijo y vive en el código.
//
// Sale del documento "Regalitos para mi Isi preciosa" (las fotos se importan
// con `scripts/importar-fotos-regalos.py`). Lo ÚNICO que se guarda en la base
// de datos es quién se apuntó a cada cosa: ver `app/api/regalos/route.ts`.
//
// Los `id` son la llave de esa tabla: cambiar uno pierde el "check" que alguien
// ya hizo. Se pueden añadir cosas nuevas sin miedo; renombrar, no.

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
        tienda: "Farmacia o super",
        busqueda: "agua micelar bifásica Garnier Skin Active 400 ml",
      },
      {
        id: "brillo-extreme-shine",
        nombre: "Brillo de labios Extreme Shine",
        marca: "Essence",
        detalle: "Tono 13 · Glazed Berry, el rosa de la foto.",
        precio: 3990,
        presupuesto: "detalle",
        tienda: "dbs.cl",
        url: "https://dbs.cl/brillo-de-labios-extreme-shine-101-milky-way-ee-30289-0",
        fotos: ["/regalos/brillo-extreme-shine.jpg"],
        aviso:
          "El enlace abre otro tono: hay que cambiarlo a Glazed Berry (13) dentro del sitio. Manda la foto, no el link.",
      },
      {
        id: "what-a-tint",
        nombre: "Tinte de labios y mejillas",
        marca: "Essence · What a Tint",
        detalle: "Tono vino oscuro / rosewood, el primero de los tres.",
        precio: 4990,
        precioNota: "desde",
        presupuesto: "detalle",
        tienda: "dbs.cl",
        url: "https://dbs.cl/tinte-para-labios-y-mejillas-what-a-tint-ee-38242",
        fotos: ["/regalos/what-a-tint.jpg"],
      },
      {
        id: "esmaltes-permanentes",
        nombre: "Esmaltes permanentes",
        marca: "De cualquier color",
        detalle:
          "Le gusta hacer diseños en sus uñas, así que ningún color le sobra: aquí no hay forma de equivocarse.",
        presupuesto: "detalle",
        tienda: "Tienda de belleza",
        busqueda: "esmalte permanente semipermanente uñas",
      },
    ],
  },
  {
    id: "accesorios",
    titulo: "Accesorios y regalos",
    resumen: "Lo que no necesita, pero le haría mucha ilusión.",
    items: [
      {
        id: "neceser-cannes",
        nombre: "Neceser Cannes",
        marca: "Bubba",
        detalle: "Con espejo, encrespador y brillo.",
        presupuesto: "regalito",
        tienda: "Bubba",
        busqueda: "Bubba neceser Cannes rose gold",
        aviso: "En rose gold o plateado. Los otros tonos no le sirven.",
      },
      {
        id: "set-billetera-bubba",
        nombre: "Set de billetera",
        marca: "Bubba",
        detalle: "La alternativa al neceser, de la misma marca.",
        presupuesto: "regalito",
        tienda: "Bubba",
        busqueda: "Bubba set billetera",
      },
      {
        id: "reloj-casio-rosado",
        nombre: "Reloj Casio",
        marca: "Modelo clásico",
        detalle: "El clásico de toda la vida, en rosado.",
        presupuesto: "regalon",
        busqueda: "reloj Casio clásico rosado mujer",
      },
      {
        id: "polly-pocket",
        nombre: "Polly Pocket clásica",
        detalle:
          "La versión clásica, la de la cajita que se abre. Las nuevas no son lo mismo; muchas veces aparecen de segunda mano.",
        presupuesto: "regalito",
        busqueda: "Polly Pocket clásica vintage",
      },
    ],
  },
  {
    id: "ropa",
    titulo: "Ropa y calzado",
    resumen: "Con tallas y colores ya confirmados, para no jugársela.",
    items: [
      {
        id: "botas-polonia",
        nombre: "Botas Desmontables Polonia",
        marca: "Tienda Huellas",
        detalle:
          "Ecocuero, taco de 6,5 cm, horma normal. Se les saca la caña y quedan como botín: son dos pares en uno.",
        precio: 39990,
        presupuesto: "regalon",
        tienda: "tiendahuellas.cl",
        url: "https://tiendahuellas.cl/producto/botas-desmontables-polonia-cafe/",
        fotos: ["/regalos/botas-polonia-larga.jpg", "/regalos/botas-polonia-botin.jpg"],
        aviso: "Talla 37, disponible. En café o en negro.",
      },
      {
        id: "hoodie-rosado",
        nombre: "Polerón hoodie rosado",
        marca: "Kadenkas · Otoño Invierno 2026",
        detalle: "Oversize, con gorro y el logo bordado al centro.",
        precio: 34990,
        presupuesto: "regalon",
        tienda: "kadenkas.com",
        url: "https://kadenkas.com/products/poleron-hoodie-rosado-oversize-con-gorro-logo-bordado",
        fotos: ["/regalos/hoodie-rosado.jpg"],
        aviso: "La talla está por confirmar (van de XS a XL).",
      },
      {
        id: "pantalon-buzo-rosado",
        nombre: "Pantalón buzo rosado",
        marca: "Kadenkas · hace conjunto con el polerón",
        detalle: "Corte recto, logo bordado en la pierna.",
        precio: 24990,
        presupuesto: "regalito",
        tienda: "kadenkas.com",
        url: "https://kadenkas.com/products/pantalon-buzo-rosado-corte-recto-logo-bordado",
        fotos: ["/regalos/pantalon-buzo-rosado.jpg"],
        aviso: "Está en pre-venta: conviene confirmar la fecha de despacho antes de pagar.",
      },
      {
        id: "conjunto-dos-piezas",
        nombre: "Conjunto de dos piezas",
        marca: "Algodón, gris lavado",
        detalle: "Polera de un hombro y pantalón ancho, del mismo tono.",
        precio: 26390,
        precioNota: "aprox., con descuento",
        presupuesto: "regalito",
        busqueda: "conjunto dos piezas algodón polera un hombro pantalón ancho",
        fotos: ["/regalos/conjunto-dos-piezas.jpg"],
      },
    ],
  },
  {
    id: "dulces",
    titulo: "Dulces y antojos",
    resumen: "Lo que se compra en el super y le alegra el día igual.",
    items: [
      {
        id: "alpenrahm",
        nombre: "Alpenrahm Schokolade",
        marca: "Chocolate de leche alemán",
        detalle: "El de la barra alemana clásica.",
        presupuesto: "detalle",
        tienda: "Jumbo",
        busqueda: "Alpenrahm Schokolade chocolate de leche",
      },
      {
        id: "galletas-ruths",
        nombre: "Galletas Ruths",
        detalle: "Doble chocolate, o bien las de chocolate blanco con frambuesa.",
        presupuesto: "detalle",
        tienda: "Jumbo",
        busqueda: "galletas Ruths doble chocolate",
      },
      {
        id: "trento-limon",
        nombre: "Trento limón",
        detalle: "La barra de wafer sabor limón.",
        presupuesto: "detalle",
        tienda: "Supermercado",
        busqueda: "Trento limón wafer",
      },
    ],
  },
  {
    id: "mesa",
    titulo: "Para la mesa del día",
    resumen:
      "Si prefieres poner algo para la celebración, la tabla de picoteo se arma con cuatro variedades.",
    items: [
      {
        id: "picoteo-chocolates",
        nombre: "Variedad de chocolates",
        detalle: "Para la tabla de picoteo del día.",
        presupuesto: "detalle",
      },
      {
        id: "picoteo-frutas",
        nombre: "Variedad de frutas",
        detalle: "Para la tabla de picoteo del día.",
        presupuesto: "detalle",
      },
      {
        id: "picoteo-verduras",
        nombre: "Variedad de verduras",
        detalle: "Para la tabla de picoteo del día.",
        presupuesto: "detalle",
      },
      {
        id: "picoteo-papas",
        nombre: "Variedad de papas fritas",
        detalle: "Para la tabla de picoteo del día.",
        presupuesto: "detalle",
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
