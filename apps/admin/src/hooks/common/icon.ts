import { useSvgIconRender } from '@sa/hooks';
import { SvgIcon } from '@sa/materials';

export function useSvgIcon() {
  const { SvgIconVNode } = useSvgIconRender(SvgIcon);

  return {
    SvgIconVNode
  };
}
