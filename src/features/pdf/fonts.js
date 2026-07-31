import { Font } from '@react-pdf/renderer'
import MontserratBold from '@fontsource/montserrat/files/montserrat-latin-700-normal.woff2'

Font.register({
  family: 'Montserrat',
  fonts: [{ src: MontserratBold, fontWeight: 700 }],
})
