import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { radius } from '../tokens/radius';

export const theme = {
  light: {
    colors: colors.surface.light,
    primary: colors.primary[600],
    secondary: colors.secondary[600],
  },
  dark: {
    colors: colors.surface.dark,
    primary: colors.primary[500],
    secondary: colors.secondary[500],
  },
  typography,
  radius,
};

export default theme;
