import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import mixPlugin from 'colord/plugins/mix';

extend([namesPlugin, mixPlugin]);

/**
 * Get node icon background color (with opacity)
 * @param color
 * @returns
 */
export function getNodeIconBackground(color: string) {
  if (!color) return 'rgba(107, 114, 128, 0.1)';
  return colord(color).alpha(0.1).toRgbString();
}
