<script setup lang="ts">
import { computed, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { LAYOUT_SCROLL_EL_ID } from '@sa/materials';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import { useRouteStore } from '@/store/modules/route';
import { useTabStore } from '@/store/modules/tab';

defineOptions({
  name: 'GlobalContent'
});

interface Props {
  /** Show padding for content */
  showPadding?: boolean;
}

withDefaults(defineProps<Props>(), {
  showPadding: true
});

const appStore = useAppStore();
const themeStore = useThemeStore();
const routeStore = useRouteStore();
const tabStore = useTabStore();
const route = useRoute();

const footerVar = computed(() => themeStore.footer.visible);

function resetScroll() {
  const el = document.querySelector(`#${LAYOUT_SCROLL_EL_ID}`);

  el?.scrollTo({ left: 0, top: 0 });
}

watch(
  () => route.fullPath,
  () => {
    nextTick(() => {
      resetScroll();
    });
  }
);
</script>

<template>
  <RouterView v-slot="{ Component, route: currentRoute }">
    <div
      class="h-full flex flex-col flex-grow bg-layout transition-300"
      :class="{ 'p-16px': showPadding, 'footer-var': footerVar }"
    >
      <KeepAlive :include="routeStore.cacheRoutes" :exclude="routeStore.excludeCacheRoutes">
        <component
          :is="Component"
          v-if="appStore.reloadFlag"
          :key="tabStore.getTabIdByRoute(currentRoute)"
          class="flex-grow"
        />
      </KeepAlive>
    </div>
  </RouterView>
</template>

<style>
.footer-var {
  --calc-footer-height: var(--soy-footer-height);
}
</style>
