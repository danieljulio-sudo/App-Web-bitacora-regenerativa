// Textos fijos de la app del visitante en español e inglés (RNF-05: la app
// del guía y el panel de la finca quedan solo en español, así que ellas no
// usan este diccionario). Los textos que vienen de Supabase (nombre de
// indicadores, preguntas, etc.) traen sus propios campos "_es"/"_en" y se
// leen con la función `campo()` de abajo, no desde aquí.
export const TEXTOS = {
  es: {
    idioma: 'Idioma',
    bienvenidaEyebrow: (ruta) => ruta,
    bienvenidaTitulo: 'Hoy vas a ayudar a medir cómo se regenera este lugar',
    bienvenidaTexto: 'Durante el recorrido busca estas señales de regeneración y marca lo que veas. Toma menos de un minuto por señal.',
    nombreLabel: '¿Cómo te llamas?',
    nombrePlaceholder: 'Tu nombre',
    paisLabel: '¿De dónde vienes?',
    correoLabel: 'Correo (opcional, para enviarte tu bitácora)',
    correoPlaceholder: 'tu@correo.com',
    empezar: 'Empezar el recorrido',
    sinSenal: 'Funciona sin señal. Tus respuestas quedan guardadas en este celular.',
    tuBitacora: 'Tu bitácora',
    tocaParaRegistrar: 'Toca para registrar →',
    visto: 'Visto',
    noVisto: 'No visto',
    vistos: (n) => `${n} vistos`,
    terminarRecorrido: 'Terminar recorrido',
    volverALista: '← Volver a la lista',
    loViste: '¿Lo viste en el recorrido?',
    siLoVi: 'Sí, lo vi',
    noLoVi: 'No lo vi',
    cuantosViste: '¿Cuántos viste, más o menos?',
    fotoEvidencia: 'Foto de evidencia (opcional)',
    fotoObligatoria: 'Foto de evidencia',
    tomarFoto: '📷 Tomar foto',
    cambiarFoto: '📷 Cambiar foto',
    comprimiendo: 'Comprimiendo…',
    guardar: 'Guardar',
    saltar: 'Saltar, no la tomé',
    casiListo: 'Casi listo',
    antesDeIrte: 'Antes de irte',
    dosPreguntas: 'Unas preguntas cortas. Esto le sirve a la finca tanto como lo que viste.',
    comentarioLabel: '¿Algo más que quieras contarnos?',
    opcional: 'Opcional',
    enviarBitacora: 'Enviar bitácora',
    enviando: 'Enviando…',
    graciasEyebrow: 'Bitácora guardada',
    gracias: (nombre) => `¡Gracias${nombre ? `, ${nombre}` : ''}!`,
    resumenTexto: (vistos, total) => `Viste ${vistos} de ${total} señales de regeneración. Tu bitácora ya quedó guardada en este celular y se sube sola en cuanto haya señal.`,
    nuevaBitacora: 'Nueva bitácora',
    volverInicio: 'Volver al inicio',
    cargando: 'Cargando…',
    rutaNoEncontrada: 'No encontramos esta ruta. Revisa el código QR o pide uno nuevo al guía.',
    sinRutaTitulo: 'Escanea el QR de tu ruta',
    sinRutaTexto: 'Esta dirección abre sola cuando escaneas el código QR que está al inicio del recorrido.',
  },
  en: {
    idioma: 'Language',
    bienvenidaEyebrow: (ruta) => ruta,
    bienvenidaTitulo: 'Today you are going to help measure how this place regenerates',
    bienvenidaTexto: 'During the tour, look for these signs of regeneration and mark what you see. It takes less than a minute per sign.',
    nombreLabel: 'What is your name?',
    nombrePlaceholder: 'Your name',
    paisLabel: 'Where are you from?',
    correoLabel: 'Email (optional, to send you your logbook)',
    correoPlaceholder: 'you@email.com',
    empezar: 'Start the tour',
    sinSenal: 'Works without signal. Your answers are saved on this phone.',
    tuBitacora: 'Your logbook',
    tocaParaRegistrar: 'Tap to record →',
    visto: 'Seen',
    noVisto: 'Not seen',
    vistos: (n) => `${n} seen`,
    terminarRecorrido: 'Finish the tour',
    volverALista: '← Back to the list',
    loViste: 'Did you see it on the tour?',
    siLoVi: 'Yes, I saw it',
    noLoVi: 'No, I did not',
    cuantosViste: 'About how many did you see?',
    fotoEvidencia: 'Photo evidence (optional)',
    fotoObligatoria: 'Photo evidence',
    tomarFoto: '📷 Take photo',
    cambiarFoto: '📷 Change photo',
    comprimiendo: 'Compressing…',
    guardar: 'Save',
    saltar: "Skip, I didn't take it",
    casiListo: 'Almost done',
    antesDeIrte: 'Before you go',
    dosPreguntas: 'A few short questions. This helps the farm as much as what you saw.',
    comentarioLabel: 'Anything else you want to tell us?',
    opcional: 'Optional',
    enviarBitacora: 'Submit logbook',
    enviando: 'Sending…',
    graciasEyebrow: 'Logbook saved',
    gracias: (nombre) => `Thank you${nombre ? `, ${nombre}` : ''}!`,
    resumenTexto: (vistos, total) => `You saw ${vistos} of ${total} signs of regeneration. Your logbook is saved on this phone and will upload on its own once there is signal.`,
    nuevaBitacora: 'New logbook',
    volverInicio: 'Back home',
    cargando: 'Loading…',
    rutaNoEncontrada: "We couldn't find this route. Check the QR code or ask your guide for a new one.",
    sinRutaTitulo: 'Scan your route\'s QR code',
    sinRutaTexto: 'This page opens on its own when you scan the QR code at the start of the tour.',
  },
}

// Los indicadores, estaciones y preguntas vienen de Supabase con dos campos
// por dato ("nombre_es" / "nombre_en"). `campo(obj, 'nombre', idioma)` lee el
// que toca y cae al español si el inglés viene vacío (catálogo a medio
// traducir no debe dejar textos en blanco).
export function campo(obj, base, idioma) {
  if (!obj) return ''
  return (idioma === 'en' && obj[`${base}_en`]) || obj[`${base}_es`] || ''
}

export function t(idioma) {
  return TEXTOS[idioma] ?? TEXTOS.es
}

export const PAISES = [
  'Colombia', 'Estados Unidos', 'México', 'España', 'Alemania', 'Francia',
  'Reino Unido', 'Canadá', 'Países Bajos', 'Suiza', 'Brasil', 'Argentina',
  'Chile', 'Perú', 'Ecuador', 'Otro',
]
