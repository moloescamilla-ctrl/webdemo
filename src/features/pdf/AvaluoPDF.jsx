import { Document, Page } from '@react-pdf/renderer'
import { styles }               from './estilos'
import { PiePagina }            from './secciones/PiePagina'
import Portada                  from './secciones/Portada'
import DatosGenerales           from './secciones/DatosGenerales'
import CroquisLocalizacion      from './secciones/CroquisLocalizacion'
import Entorno                  from './secciones/Entorno'
import Terreno                  from './secciones/Terreno'
import Construcciones           from './secciones/Construcciones'
import Inspeccion               from './secciones/Inspeccion'
import MetodoFisico             from './secciones/MetodoFisico'
import MetodoComparativo        from './secciones/MetodoComparativo'
import MetodoRentasSec          from './secciones/MetodoRentas'
import MetodoResidualSec        from './secciones/MetodoResidual'
import Conclusion               from './secciones/Conclusion'
import Declaraciones            from './secciones/Declaraciones'
import Fotografias              from './secciones/Fotografias'
import ResumenEjecutivo         from './secciones/ResumenEjecutivo'
import Firma                    from './secciones/Firma'

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
      {/* Portada — Síntesis Informativa */}
      <Page size="LETTER" style={styles.paginaPortada}>
        <Portada
          expediente={expediente}
          fotoFachada={fotoFachada}
          descripcionConstruccion={descripcionConstruccion}
          metodoFisico={metodoFisico}
          metodoComparativo={metodoComparativo}
          metodoRentas={metodoRentas}
          metodoResidual={metodoResidual}
          entorno={entorno}
        />
        <PiePagina expediente={expediente} />
      </Page>

      {/* Contenido completo en una sola página — react-pdf pagina automáticamente */}
      <Page size="LETTER" style={styles.pagina}>
        <DatosGenerales expediente={expediente} />
        <CroquisLocalizacion croquisSrc={croquisSrc} lat={expediente?.latitud} lng={expediente?.longitud} />
        <Entorno entorno={entorno} />
        <Terreno terreno={terreno} />
        <Construcciones descripcion={descripcionConstruccion} />
        <Inspeccion inspeccion={inspeccion} />
        {metodoFisico && (
          <MetodoFisico metodo={metodoFisico} inspeccion={inspeccion} />
        )}
        {metodoComparativo && (
          <MetodoComparativo metodo={metodoComparativo} />
        )}
        {metodoRentas && (
          <MetodoRentasSec metodo={metodoRentas} />
        )}
        {metodoResidual && (
          <MetodoResidualSec metodo={metodoResidual} />
        )}
        <Conclusion
          metodoFisico={metodoFisico}
          metodoComparativo={metodoComparativo}
          metodoRentas={metodoRentas}
          metodoResidual={metodoResidual}
          expediente={expediente}
        />
        <Declaraciones />
        {fotos?.length > 0 && <Fotografias fotos={fotos} />}
        <ResumenEjecutivo
          metodoFisico={metodoFisico}
          metodoComparativo={metodoComparativo}
          metodoRentas={metodoRentas}
          metodoResidual={metodoResidual}
          expediente={expediente}
        />
        <Firma expediente={expediente} />
        <PiePagina expediente={expediente} />
      </Page>
    </Document>
  )
}
