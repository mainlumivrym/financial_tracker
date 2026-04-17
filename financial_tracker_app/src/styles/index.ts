// Central export for all styles and theme constants
export { colors, Colors } from './colors';
export { 
  globalStyles, 
  typography, 
  spacing, 
  borderRadius,
  Typography,
  Spacing,
  BorderRadius
} from './globalStyles';

// Re-export everything for convenience
import { colors } from './colors';
import { globalStyles, typography, spacing, borderRadius } from './globalStyles';

export default {
  colors,
  globalStyles,
  typography,
  spacing,
  borderRadius,
};
