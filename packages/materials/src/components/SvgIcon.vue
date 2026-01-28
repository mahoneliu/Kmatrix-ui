<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { Icon } from '@iconify/vue';

defineOptions({ name: 'SvgIcon', inheritAttrs: false });

/**
 * Props
 *
 * - Support iconify and local svg icon
 * - If icon and localIcon are passed at the same time, localIcon will be rendered first
 */
interface Props {
  /** Iconify icon name */
  icon?: string;
  /** Local svg icon name */
  localIcon?: string;
}

const props = defineProps<Props>();

const attrs = useAttrs();

const symbolId = computed(() => {
  const prefix = import.meta.env.VITE_ICON_LOCAL_PREFIX || 'local-icon';
  const defaultLocalIcon = 'no-icon';
  const icon = props.localIcon || defaultLocalIcon;
  return `#${prefix}-${icon}`;
});

/** If localIcon is passed, render localIcon first */
const renderLocalIcon = computed(() => props.localIcon || !props.icon);
</script>

<template>
  <span v-bind="attrs" class="svg-icon">
    <svg v-if="renderLocalIcon" aria-hidden="true" width="1em" height="1em">
      <use :xlink:href="symbolId" fill="currentColor" />
    </svg>
    <Icon v-else-if="icon" :icon="icon" width="1em" height="1em" />
  </span>
</template>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
