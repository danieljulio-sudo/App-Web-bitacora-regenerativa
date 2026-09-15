// La dirección completa que va dentro del QR: el dominio real donde vive la
// app publicada + la ruta interna /r/<codigo>. Usamos location.origin (no
// import.meta.env algo) para que el QR generado en el panel siempre apunte
// al sitio donde el panel mismo se está viendo — no hay que configurar nada.
export function urlDeRuta(codigo) {
  return `${location.origin}${import.meta.env.BASE_URL}r/${codigo}`
}

// Devuelve un data URL con el QR ya dibujado, listo para <img src> o para
// imprimir. RF-15: generar e imprimir el QR de cada ruta. `qrcode` solo lo
// usa el panel — import dinámico para no inflar la carga del visitante.
export async function generarQR(codigo) {
  const { default: QRCode } = await import('qrcode')
  return QRCode.toDataURL(urlDeRuta(codigo), { width: 480, margin: 2, color: { dark: '#24211C', light: '#FFFFFF' } })
}
