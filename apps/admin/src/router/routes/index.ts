import type { ElegantConstRoute, ElegantRoute } from '@elegant-router/types';
import { generatedRoutes } from '../elegant/routes';
import { layouts, views } from '../elegant/imports';
import { transformElegantRoutesToVueRoutes } from '../elegant/transform';

/**
 * custom routes
 *
 * @link https://github.com/soybeanjs/elegant-router?tab=readme-ov-file#custom-route
 */
const customRoutes: any = [
  {
    name: 'customAiDocumentUpload',
    path: '/ai',
    component: 'layout.base',
    meta: {
      title: '我要自定义分块',
      hideInMenu: true,
      constant: true
    },
    children: [
      {
        name: 'ai_document-upload_step1',
        path: '/document-upload/step1',
        component: 'view.ai_document-upload_step1',
        meta: {
          title: '我要自定义分块',
          hideInMenu: true,
          constant: true,
          activeMenu: 'ai_knowledge-manager'
        }
      },
      {
        name: 'ai_document-upload_step2',
        path: '/document-upload/step2',
        component: 'view.ai_document-upload_step2',
        meta: {
          title: '自定义分块第二步',
          hideInMenu: true,
          constant: true,
          activeMenu: 'ai_knowledge-manager'
        }
      }
    ]
  }
];

/** create routes when the auth route mode is static */
export function createStaticRoutes() {
  const constantRoutes: ElegantRoute[] = [];

  const authRoutes: ElegantRoute[] = [];

  [...generatedRoutes, ...customRoutes].forEach(item => {
    if (item.meta?.constant) {
      constantRoutes.push(item);
    } else {
      authRoutes.push(item);
    }
  });

  return {
    constantRoutes,
    authRoutes
  };
}

const dynamicConstantRoutes: ElegantRoute[] = [
  {
    name: 'home',
    path: '/home',
    component: 'layout.base$view.home',
    meta: {
      title: 'route.home',
      localIcon: 'mdi-monitor-dashboard',
      order: -1
    }
  },
  {
    name: '403',
    path: '/403',
    component: 'layout.blank$view.403',
    meta: {
      title: 'route.403',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: '404',
    path: '/404',
    component: 'layout.blank$view.404',
    meta: {
      title: 'route.404',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: '500',
    path: '/500',
    component: 'layout.blank$view.500',
    meta: {
      title: 'route.500',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: 'login',
    path: '/login/:module(pwd-login|code-login|register|reset-pwd|bind-wechat)?',
    component: 'layout.blank$view.login',
    props: true,
    meta: {
      title: 'route.login',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: 'iframe-page',
    path: '/iframe-page/:url',
    component: 'layout.base$view.iframe-page',
    props: true,
    meta: {
      title: 'route.iframe-page',
      constant: true,
      hideInMenu: true,
      keepAlive: true,
      localIcon: 'material-symbols-iframe-outline'
    }
  },
  {
    name: 'social-callback',
    path: '/social-callback',
    component: 'layout.blank$view.social-callback',
    meta: {
      title: 'route.social-callback',
      constant: true,
      hideInMenu: true,
      localIcon: 'simple-icons-authy'
    }
  },
  {
    name: 'user-center',
    path: '/user-center',
    component: 'layout.base$view.user-center',
    meta: {
      title: 'route.user-center',
      localIcon: 'material-symbols-account-circle-full',
      hideInMenu: true
    }
  }
];

/** create routes when the auth route mode is static */
export function createDynamicRoutes() {
  const constantRoutes: ElegantConstRoute[] = [];

  const authRoutes: ElegantConstRoute[] = [];

  [...customRoutes, ...dynamicConstantRoutes].forEach(item => {
    if (item.meta?.constant) {
      constantRoutes.push(item);
    } else {
      authRoutes.push(item);
    }
  });

  return {
    constantRoutes,
    authRoutes
  };
}

/**
 * Get auth vue routes
 *
 * @param routes Elegant routes
 */
export function getAuthVueRoutes(routes: ElegantConstRoute[]) {
  return transformElegantRoutesToVueRoutes(routes, layouts, views);
}
