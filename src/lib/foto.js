// Convierte una foto tomada con el celular en un "data URL" chiquito (una
// imagen codificada como texto). La comprimimos porque una foto de celular
// pesa varios MB y eso no cabe bien en IndexedDB ni conviene subir con poca
// señal — 900px de lado más largo y calidad 70% se ve bien en pantalla y
// pesa una fracción del original.
export function comprimirFoto(archivo, ladoMaximo = 900, calidad = 0.7) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo)
    const img = new Image()
    img.onload = () => {
      const escala = Math.min(1, ladoMaximo / Math.max(img.width, img.height))
      const lienzo = document.createElement('canvas')
      lienzo.width = Math.round(img.width * escala)
      lienzo.height = Math.round(img.height * escala)
      lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height)
      URL.revokeObjectURL(url)
      resolve(lienzo.toDataURL('image/jpeg', calidad))
    }
    img.onerror = reject
    img.src = url
  })
}

// El data URL sirve para guardar en Dexie y mostrar <img src="..."> gratis,
// pero Supabase Storage necesita un archivo real (Blob) para subirlo. Esta
// conversión es local y no vuelve a tocar la cámara ni a recomprimir nada.
export function dataUrlABlob(dataUrl) {
  const [cabecera, base64] = dataUrl.split(',')
  const tipo = cabecera.match(/:(.*?);/)[1]
  const binario = atob(base64)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return new Blob([bytes], { type: tipo })
}
