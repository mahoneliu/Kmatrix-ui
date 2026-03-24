import type { Router } from 'vue-router';
import { useTitle } from '@vueuse/core';
import { $t, i18n } from '@/locales';

export function createDocumentTitleGuard(router: Router) {
  router.afterEach(to => {
    const { i18nKey, title } = to.meta;

    let documentTitle = title;

    if (i18nKey) {
      documentTitle = $t(i18nKey);
    } else if (title && (title.startsWith('route.') || title.startsWith('menu.'))) {
      documentTitle = $t(title as App.I18n.I18nKey);
    } else {
      const routeI18nKey = `route.${to.name as string}`;
      if (i18n.global.te(routeI18nKey)) {
        documentTitle = $t(routeI18nKey as App.I18n.I18nKey);
      }
    }

    useTitle(documentTitle);
  });
}
