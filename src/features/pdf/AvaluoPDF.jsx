import { Document, Page } from '@react-pdf/renderer'
import { styles, COLORES } from './estilos'
import { PiePagina }         from './secciones/PiePagina'
import Portada               from './secciones/Portada'
import DatosGenerales        from './secciones/DatosGenerales'
import CroquisLocalizacion   from './secciones/CroquisLocalizacion'
import Entorno               from './secciones/Entorno'
import Terreno               from './secciones/Terreno'
import Construcciones        from './secciones/Construcciones'
import Inspeccion            from './secciones/Inspeccion'
import MetodoFisico          from './secciones/MetodoFisico'
import MetodoComparativo     from './secciones/MetodoComparativo'
import MetodoRentasSec       from './secciones/MetodoRentas'
import MetodoResidualSec     from './secciones/MetodoResidual'
import Conclusion            from './secciones/Conclusion'
import Declaraciones         from './secciones/Declaraciones'
import Fotografias           from './secciones/Fotografias'
import Firma                 from './secciones/Firma'

export function AvaluoPDF({ datos }) {
  const {
    expediente,
    entorno,
    terreno,
    descripcionConstruccion,
    inspeccion,
    metodoFisico,
    metodoComparativo,
    metodoRentas,
    metodoResidual,
    fotos,
    croquisSrc,
  } = datos

  const folio = expediente?.folio || expediente?.id?.slice(0, 8).toUpperCase() || 'AVALUO'
  const fotoFachada = fotos?.find(f => f.categoria === 'fachada')?.url_storage ?? null

  return (
    <Document
      title={`Dictamen Valuatorio — ${folio}`}
      author={expediente?.nombre_perito || 'Perito Valuador'}
      subject="Avaluo inmobiliario"
    >
      {/* Página 1: Portada */}
      <Page size="A4" style={styles.paginaPortada}>
        <Portada expediente={expediente} fotoFachada={fotoFachada} />
        <PiePagina expediente={expediente} />
      </Page>

      {/* Página 2: Datos generales + Croquis */}
      <Page size="A4" style={styles.pagina}>
        <DatosGenerales expediente={expediente} />
        <CroquisLocalizacion croquisSrc={croquisSrc} lat={expediente?.latitud} lng={expediente?.longitud} />
        <PiePagina expediente={expediente} />
      </Page>

      {/* Página 3: Entorno + Terreno */}
      <Page size="A4" style={styles.pagina}>
        <Entorno entorno={entorno} />
        <Terreno terreno={terreno} />
        <PiePagina expediente={expediente} />
      </Page>

      {/* Página 4: Construcciones + Inspección */}
      <Page size="A4" style={styles.pagina}>
        <Construcciones descripcion={descripcionConstruccion} />
        <Inspeccion inspeccion={inspeccion} />
        <PiePagina expediente={expediente} />
      </Page>

      {/* Página 5: Método Físico */}
      {metodoFisico && (
        <Page size="A4" style={styles.pagina}>
          <MetodoFisico metodo={metodoFisico} inspeccion={inspeccion} />
          <PiePagina expediente={expediente} />
        </Page>
      )}

      {/* Página 6: Método Comparativo */}
      {metodoComparativo && (
        <Page size="A4" style={styles.pagina}>
          <MetodoComparativo metodo={metodoComparativo} />
          <PiePagina expediente={expediente} />
        </Page>
      )}

      {/* Página 7: Método Rentas (condicional) */}
      {metodoRentas && (
        <Page size="A4" style={styles.pagina}>
          <MetodoRentasSec metodo={metodoRentas} />
          <PiePagina expediente={expediente} />
        </Page>
      )}

      {/* Página 8: Método Residual (condicional) */}
      {metodoResidual && (
        <Page size="A4" style={styles.pagina}>
          <MetodoResidualSec metodo={metodoResidual} />
          <PiePagina expediente={expediente} />
        </Page>
      )}

      {/* Página 9: Conclusión + Declaraciones */}
      <Page size="A4" style={styles.pagina}>
        <Conclusion
          metodoFisico={metodoFisico}
          metodoComparativo={metodoComparativo}
          metodoRentas={metodoRentas}
          metodoResidual={metodoResidual}
          expediente={expediente}
        />
        <Declaraciones />
        <PiePagina expediente={expediente} />
      </Page>

      {/* Página 10: Fotografías (condicional) */}
      {fotos?.length > 0 && (
        <Page size="A4" style={styles.pagina}>
          <Fotografias fotos={fotos} />
          <PiePagina expediente={expediente} />
        </Page>
      )}

      {/* Última página: Firma */}
      <Page size="A4" style={styles.pagina}>
        <Firma expediente={expediente} />
        <PiePagina expediente={expediente} />
      </Page>
    </Document>
  )
}
