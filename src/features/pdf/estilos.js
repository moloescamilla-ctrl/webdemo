import { StyleSheet } from '@react-pdf/renderer'

export const COLORES = {
  primario:   '#1B2D4E',
  secundario: '#2A4A7F',
  acento:     '#16A34A',
  gris:       '#6B7280',
  grisClaro:  '#F3F4F6',
  borde:      '#D1D5DB',
  texto:      '#111827',
  blanco:     '#FFFFFF',
  rojo:       '#EF4444',
  amarillo:   '#D97706',
}

export const styles = StyleSheet.create({
  pagina: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: COLORES.texto,
    paddingTop: 40,
    paddingBottom: 54,
    paddingHorizontal: 45,
  },

  // Página sin padding para portada con header y foto a sangre completa
  paginaPortada: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: COLORES.texto,
    paddingBottom: 54,
  },

  seccionTitulo: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORES.blanco,
    backgroundColor: COLORES.secundario,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 14,
    marginBottom: 6,
  },

  seccionTituloVerde: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORES.blanco,
    backgroundColor: COLORES.acento,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 14,
    marginBottom: 6,
  },

  // Filas label-valor
  campoFila: { flexDirection: 'row', marginBottom: 3 },
  campoLabel: { fontSize: 8, color: COLORES.gris, width: 130 },
  campoValor: { fontSize: 8, color: COLORES.texto, flex: 1 },

  // Grid de dos columnas
  grid2: { flexDirection: 'row', marginBottom: 4 },
  col1: { flex: 1, paddingRight: 10 },
  col2: { flex: 1 },

  // Tablas
  tabla: { width: '100%', marginBottom: 8 },
  filaHeader: { backgroundColor: COLORES.secundario, flexDirection: 'row' },
  filaImpar:  { backgroundColor: COLORES.grisClaro,  flexDirection: 'row' },
  filaPar:    { backgroundColor: COLORES.blanco,      flexDirection: 'row' },
  filaFoot:   { backgroundColor: COLORES.grisClaro,   flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORES.borde },
  celda: {
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontSize: 8,
    borderRightWidth: 0.5,
    borderRightColor: COLORES.borde,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORES.borde,
    color: COLORES.texto,
  },
  celdaHeader: {
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontSize: 8,
    color: COLORES.blanco,
    fontFamily: 'Helvetica-Bold',
  },
  celdaFoot: {
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORES.texto,
  },

  // Cajas resultado
  cajaAzul: {
    backgroundColor: COLORES.secundario,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 3,
  },
  cajaVerde: {
    backgroundColor: COLORES.acento,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 3,
  },
  cajaGris: {
    backgroundColor: COLORES.grisClaro,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 6,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: COLORES.borde,
  },
  resultadoLabel: { fontSize: 8,  color: COLORES.blanco },
  resultadoValor: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: COLORES.blanco, marginTop: 2 },

  // Pie de página
  piePagina: {
    position: 'absolute',
    bottom: 20,
    left: 45,
    right: 45,
    fontSize: 7,
    color: COLORES.gris,
    borderTopWidth: 0.5,
    borderTopColor: COLORES.borde,
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Nota pequeña
  nota: { fontSize: 7, color: COLORES.gris, marginTop: 4 },
})
