// Ajustes del sitio que el dueño puede personalizar sin tocar el resto del código.
// (Cambia el nombre de la cumpleañera aquí y se refleja en toda la web.)

export const SITE = {
  /** Nombre o apodo de la cumpleañera. Aparece en la portada y los textos. */
  recipientName: "Isidora",
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
  albumCode: "cumple",
} as const;
