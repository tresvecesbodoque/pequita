// Ajustes del sitio que el dueño puede personalizar sin tocar el resto del código.
// (Cambia el nombre de la cumpleañera aquí y se refleja en toda la web.)

export const SITE = {
  /** Nombre o apodo de la cumpleañera. Aparece en la portada y los textos. */
  recipientName: "Isidora",
  /** Apodo corto para saludos ("¡Feliz Cumpleaños Isi!"). */
  recipientNick: "Isi",
  /** Título de la portada pública para los familiares. */
  inviteTitle: "Una carta para su cumpleaños",
  /** Subtítulo/explicación breve en la portada. */
  inviteSubtitle:
    "Escríbele unas líneas con cariño. Todas las cartas se guardan en un álbum sorpresa que abrirá el día de su cumpleaños.",
  /** Ruta del álbum privado que se comparte con ella. */
  albumPath: "/para-ella",
  /**
   * Clave para entrar al álbum sorpresa. Cámbiala aquí (o con la variable de
   * entorno ALBUM_CODE en producción, que tiene prioridad). Déjala vacía ("")
   * si quieres que el álbum sea abierto, sin clave.
   */
  albumCode: "siete",
  /**
   * Mensaje final oculto: se revela en el álbum cuando ella ha leído TODAS
   * las cartas (la constelación se completa).
   */
  finalMessage:
    "Leíste todas las cartas, Pequita. Como el zorro al principito: eres responsable de todos los que has domesticado — y todos ellos te escribieron hoy. Feliz cumpleaños. 💛",
  /**
   * Modo día D: fecha (ISO) en que el álbum "despierta". Antes de esta fecha,
   * aunque se tenga la clave, los sobres duermen y se muestra una cuenta
   * regresiva. Déjalo en null para abrir el álbum de inmediato.
   * Ej: "2026-08-15T00:00:00-04:00"
   * Nota: Chile en agosto está en horario estándar UTC−4 (el de verano UTC−3
   * empieza en septiembre), por eso el offset -04:00 = "00:00:01 hora Santiago".
   */
  revealDate: "2026-08-07T00:00:01-04:00" as string | null,
  /**
   * Slug de la carta destacada ("empieza por aquí"): brilla en el álbum para
   * sugerir por dónde comenzar. Déjalo en null para no destacar ninguna.
   */
  firstLetterSlug: null as string | null,
} as const;
