/** The global namespace for the app */
declare namespace App {
  /** Theme namespace */
  namespace Theme {
    type ColorPaletteNumber = import('@sa/color').ColorPaletteNumber;

    /** NaiveUI theme overrides that can be specified in preset */
    type NaiveUIThemeOverride = import('naive-ui').GlobalThemeOverrides;

    /** Theme setting */
    interface ThemeSetting {
      /** Theme scheme */
      themeScheme: UnionKey.ThemeScheme;
      /** grayscale mode */
      grayscale: boolean;
      /** colour weakness mode */
      colourWeakness: boolean;
      /** Whether to recommend color */
      recommendColor: boolean;
      /** Theme color */
      themeColor: string;
      /** Theme radius */
      themeRadius: number;
      /** Other color */
      otherColor: OtherColor;
      /** Whether info color is followed by the primary color */
      isInfoFollowPrimary: boolean;
      /** Layout */
      layout: {
        /** Layout mode */
        mode: UnionKey.ThemeLayoutMode;
        /** Scroll mode */
        scrollMode: UnionKey.ThemeScrollMode;
      };
      /** Page */
      page: {
        /** Whether to show the page transition */
        animate: boolean;
        /** Page animate mode */
        animateMode: UnionKey.ThemePageAnimateMode;
      };
      /** Header */
      header: {
        /** Header height */
        height: number;
        /** Header breadcrumb */
        breadcrumb: {
          /** Whether to show the breadcrumb */
          visible: boolean;
          /** Whether to show the breadcrumb icon */
          showIcon: boolean;
        };
        /** Multilingual */
        multilingual: {
          /** Whether to show the multilingual */
          visible: boolean;
        };
        globalSearch: {
          /** Whether to show the GlobalSearch */
          visible: boolean;
        };
      };
      /** Tab */
      tab: {
        /** Whether to show the tab */
        visible: boolean;
        /**
         * Whether to cache the tab
         *
         * If cache, the tabs will get from the local storage when the page is refreshed
         */
        cache: boolean;
        /** Tab height */
        height: number;
        /** Tab mode */
        mode: UnionKey.ThemeTabMode;
        /** Whether to close tab by middle click */
        closeTabByMiddleClick: boolean;
      };
      /** Fixed header and tab */
      fixedHeaderAndTab: boolean;
      /** Sider */
      sider: {
        /** Inverted sider */
        inverted: boolean;
        /** Sider width */
        width: number;
        /** Collapsed sider width */
        collapsedWidth: number;
        /** Sider width when the layout is 'vertical-mix', 'top-hybrid-sidebar-first', or 'top-hybrid-header-first' */
        mixWidth: number;
        /**
         * Collapsed sider width when the layout is 'vertical-mix', 'top-hybrid-sidebar-first', or
         * 'top-hybrid-header-first'
         */
        mixCollapsedWidth: number;
        /** Child menu width when the layout is 'vertical-mix', 'top-hybrid-sidebar-first', or 'top-hybrid-header-first' */
        mixChildMenuWidth: number;
        /** Whether to auto select the first submenu */
        autoSelectFirstMenu: boolean;
      };
      /** Footer */
      footer: {
        /** Whether to show the footer */
        visible: boolean;
        /** Whether fixed the footer */
        fixed: boolean;
        /** Footer height */
        height: number;
        /**
         * Whether float the footer to the right when the layout is 'top-hybrid-sidebar-first' or
         * 'top-hybrid-header-first'
         */
        right: boolean;
      };
      /** Watermark */
      watermark: {
        /** Whether to show the watermark */
        visible: boolean;
        /** Watermark text */
        text: string;
        /** Whether to use user name as watermark text */
        enableUserName: boolean;
        /** Whether to use current time as watermark text */
        enableTime: boolean;
        /** Time format for watermark text */
        timeFormat: string;
      };
      table: {
        /** Whether to show the table border */
        bordered: boolean;
        /** Whether to show the table bottom border */
        bottomBordered: boolean;
        /** Whether to show the table single column */
        singleColumn: boolean;
        /** Whether to show the table single line */
        singleLine: boolean;
        /** Whether to show the table size */
        size: UnionKey.ThemeTableSize;
        /** Whether to show the table striped */
        striped: boolean;
      };
      /** define some theme settings tokens, will transform to css variables */
      tokens: {
        light: ThemeSettingToken;
        dark?: {
          [K in keyof ThemeSettingToken]?: Partial<ThemeSettingToken[K]>;
        };
      };
    }

    interface OtherColor {
      info: string;
      success: string;
      warning: string;
      error: string;
    }

    interface ThemeColor extends OtherColor {
      primary: string;
    }

    type ThemeColorKey = keyof ThemeColor;

    type ThemePaletteColor = {
      [key in ThemeColorKey | `${ThemeColorKey}-${ColorPaletteNumber}`]: string;
    };

    type BaseToken = Record<string, Record<string, string>>;

    interface ThemeSettingTokenColor {
      /** the progress bar color, if not set, will use the primary color */
      nprogress?: string;
      container: string;
      layout: string;
      inverted: string;
      'base-text': string;
    }

    interface ThemeSettingTokenBoxShadow {
      header: string;
      sider: string;
      tab: string;
    }

    interface ThemeSettingToken {
      colors: ThemeSettingTokenColor;
      boxShadow: ThemeSettingTokenBoxShadow;
    }

    type ThemeTokenColor = ThemePaletteColor & ThemeSettingTokenColor;

    /** Theme token CSS variables */
    type ThemeTokenCSSVars = {
      colors: ThemeTokenColor & { [key: string]: string };
      boxShadow: ThemeSettingTokenBoxShadow & { [key: string]: string };
    };
  }

  /** Global namespace */
  namespace Global {
    type VNode = import('vue').VNode;
    type RouteLocationNormalizedLoaded = import('vue-router').RouteLocationNormalizedLoaded;
    type RouteKey = import('@elegant-router/types').RouteKey;
    type RouteMap = import('@elegant-router/types').RouteMap;
    type RoutePath = import('@elegant-router/types').RoutePath;
    type LastLevelRouteKey = import('@elegant-router/types').LastLevelRouteKey;

    /** The router push options */
    type RouterPushOptions = {
      query?: Record<string, string>;
      params?: Record<string, string>;
    };

    /** The global header props */
    interface HeaderProps {
      /** Whether to show the logo */
      showLogo?: boolean;
      /** Whether to show the menu toggler */
      showMenuToggler?: boolean;
      /** Whether to show the menu */
      showMenu?: boolean;
    }

    /** The global menu */
    type Menu = {
      /**
       * The menu key
       *
       * Equal to the route key
       */
      key: string;
      /** The menu label */
      label: string;
      /** The menu i18n key */
      i18nKey?: I18n.I18nKey | null;
      /** The route key */
      routeKey: RouteKey;
      /** The route path */
      routePath: RoutePath;
      /** The menu icon */
      icon?: () => VNode;
      /** The menu children */
      children?: Menu[];
    };

    type Breadcrumb = Omit<Menu, 'children'> & {
      options?: Breadcrumb[];
    };

    /** Tab route */
    type TabRoute = Pick<RouteLocationNormalizedLoaded, 'name' | 'path' | 'meta'> &
      Partial<Pick<RouteLocationNormalizedLoaded, 'fullPath' | 'query' | 'matched'>>;

    /** The global tab */
    type Tab = {
      /** The tab id */
      id: string;
      /** The tab label */
      label: string;
      /**
       * The new tab label
       *
       * If set, the tab label will be replaced by this value
       */
      newLabel?: string;
      /**
       * The old tab label
       *
       * when reset the tab label, the tab label will be replaced by this value
       */
      oldLabel?: string;
      /** The tab route key */
      routeKey: LastLevelRouteKey;
      /** The tab route path */
      routePath: RouteMap[LastLevelRouteKey];
      /** The tab route full path */
      fullPath: string;
      /** The tab fixed index */
      fixedIndex?: number | null;
      /**
       * Tab icon
       *
       * Iconify icon
       */
      icon?: string;
      /**
       * Tab local icon
       *
       * Local icon
       */
      localIcon?: string;
      /** I18n key */
      i18nKey?: I18n.I18nKey | null;
    };

    /** Form rule */
    type FormRule = import('naive-ui').FormItemRule;

    /** The global dropdown key */
    type DropdownKey = 'closeCurrent' | 'closeOther' | 'closeLeft' | 'closeRight' | 'closeAll' | 'pin' | 'unpin';
  }

  /**
   * I18n namespace
   *
   * Locales type
   */
  namespace I18n {
    type RouteKey = import('@elegant-router/types').RouteKey;

    type LangType = 'en-US' | 'zh-CN';

    type LangOption = {
      label: string;
      key: LangType;
    };

    type I18nRouteKey = Exclude<RouteKey, 'root' | 'not-found'>;

    type FormMsg = {
      required: string;
      invalid: string;
      tooltip?: string;
    };

    type Schema = {
      system: {
        title: string;
        updateTitle: string;
        updateContent: string;
        updateConfirm: string;
        updateCancel: string;
      };
      common: {
        basicInfo: string;
        action: string;
        add: string;
        addSuccess: string;
        backToHome: string;
        back: string;
        batchDelete: string;
        import: string;
        export: string;
        importSuccess: string;
        importFail: string;
        importTemplate: string;
        downloadTemplate: string;
        importResult: string;
        importEnd: string;
        importFormat: string;
        importSize: string;
        importTip: string;
        exportSuccess: string;
        exportFail: string;
        updateExisting: string;
        cancel: string;
        close: string;
        check: string;
        expandColumn: string;
        columnSetting: string;
        config: string;
        login: string;
        confirm: string;
        save: string;
        delete: string;
        deleteSuccess: string;
        deleteFail: string;
        confirmDelete: string;
        edit: string;
        download: string;
        warning: string;
        error: string;
        index: string;
        keywordSearch: string;
        logout: string;
        logoutConfirm: string;
        lookForward: string;
        modify: string;
        modifySuccess: string;
        noData: string;
        operate: string;
        pleaseCheckValue: string;
        refresh: string;
        reset: string;
        search: string;
        permission: string;
        select_permission_level: string;
        download_failed: string;
        switch: string;
        tip: string;
        trigger: string;
        update: string;
        updateSuccess: string;
        saveSuccess: string;
        noChange: string;
        userCenter: string;
        yesOrNo: {
          yes: string;
          no: string;
        };
        second: string;
        selected: string;
        anyRecords: string;
        clear: string;
        noSelectRecord: string;
        copy: string;
        name: string;
        type: string;
        description: string;
        status: string;
        enable: string;
        disable: string;
        remark: string;
        createTime: string;
        expandOrCollapse: string;
        checkAllOrNot: string;
        cascade: string;
        uploadTip: string;
        fetchListFail: string;
        confirmAction: string;
        deleteConfirmMsg: string;
        fileNameError: string;
        confirmDeleteFile: string;
        errorDetail: {
          unknown: string;
          auth_fail: string;
          no_permission: string;
          not_found: string;
        };
        copy_empty: string;
        copied: string;
        copy_fail: string;
        input: string;
        output: string;
        publishSuccess: string;
        publishFailed: string;
        generateSuccess: string;
        generateFail: string;
        all: string;
        none: string;
        createSuccess: string;
        createFailed: string;
      };
      request: {
        logout: string;
        logoutMsg: string;
        logoutWithModal: string;
        logoutWithModalMsg: string;
        refreshToken: string;
        tokenExpired: string;
      };
      theme: {
        themeDrawerTitle: string;
        tabs: {
          appearance: string;
          layout: string;
          general: string;
          preset: string;
        };
        appearance: {
          themeSchema: { title: string } & Record<UnionKey.ThemeScheme, string>;
          grayscale: string;
          colourWeakness: string;
          themeColor: {
            title: string;
            followPrimary: string;
          } & Record<Theme.ThemeColorKey, string>;
          recommendColor: string;
          recommendColorDesc: string;
          themeRadius: {
            title: string;
          };
          preset: {
            title: string;
            apply: string;
            applySuccess: string;
            [key: string]:
              | {
                  name: string;
                  desc: string;
                }
              | string;
          };
        };
        layout: {
          layoutMode: { title: string } & Record<UnionKey.ThemeLayoutMode, string> & {
              [K in `${UnionKey.ThemeLayoutMode}_detail`]: string;
            };
          tab: {
            title: string;
            visible: string;
            cache: string;
            cacheTip: string;
            height: string;
            mode: { title: string } & Record<UnionKey.ThemeTabMode, string>;
            closeByMiddleClick: string;
            closeByMiddleClickTip: string;
          };
          header: {
            title: string;
            height: string;
            breadcrumb: {
              visible: string;
              showIcon: string;
            };
          };
          sider: {
            title: string;
            inverted: string;
            width: string;
            collapsedWidth: string;
            mixWidth: string;
            mixCollapsedWidth: string;
            mixChildMenuWidth: string;
            autoSelectFirstMenu: string;
            autoSelectFirstMenuTip: string;
          };
          footer: {
            title: string;
            visible: string;
            fixed: string;
            height: string;
            right: string;
          };
          content: {
            title: string;
            scrollMode: { title: string; tip: string } & Record<UnionKey.ThemeScrollMode, string>;
            page: {
              animate: string;
              mode: { title: string } & Record<UnionKey.ThemePageAnimateMode, string>;
            };
            fixedHeaderAndTab: string;
          };
        };
        general: {
          title: string;
          watermark: {
            title: string;
            visible: string;
            text: string;
            enableUserName: string;
            enableTime: string;
            timeFormat: string;
          };
          multilingual: {
            title: string;
            visible: string;
          };
          globalSearch: {
            title: string;
            visible: string;
          };
        };
        configOperation: {
          copyConfig: string;
          copySuccessMsg: string;
          resetConfig: string;
          resetSuccessMsg: string;
        };
        tablePropsTitle: string;
        table: {
          size: { title: string } & Record<UnionKey.ThemeTableSize, string>;
          bordered: string;
          bottomBordered: string;
          singleColumn: string;
          singleLine: string;
          striped: string;
        };
      };
      route: Record<I18nRouteKey, string> & Record<string, string>;
      menu: Record<string, string>;
      dict: Record<string, Record<string, string>>;
      page: {
        common: {
          id: string;
          createBy: string;
          createTime: string;
          updateBy: string;
          updateTime: string;
          remark: string;
          form: {
            remark: FormMsg;
          };
        };
        login: {
          common: {
            title: string;
            subTitle: string;
            loginOrRegister: string;
            register: string;
            userNamePlaceholder: string;
            phonePlaceholder: string;
            codePlaceholder: string;
            passwordPlaceholder: string;
            confirmPasswordPlaceholder: string;
            codeLogin: string;
            confirm: string;
            back: string;
            validateSuccess: string;
            loginSuccess: string;
            welcomeBack: string;
          };
          pwdLogin: {
            title: string;
            rememberMe: string;
            forgetPassword: string;
            register: string;
            otherAccountLogin: string;
            otherLoginMode: string;
            superAdmin: string;
            admin: string;
            user: string;
          };
          codeLogin: {
            title: string;
            getCode: string;
            reGetCode: string;
            sendCodeSuccess: string;
            imageCodePlaceholder: string;
          };
          register: {
            title: string;
            agreement: string;
            protocol: string;
            policy: string;
          };
          resetPwd: {
            title: string;
          };
          bindWeChat: {
            title: string;
          };
        };
        home: {
          branchDesc: string;
          greeting: string;
          weatherDesc: string;
          projectCount: string;
          todo: string;
          message: string;
          downloadCount: string;
          registerCount: string;
          schedule: string;
          study: string;
          work: string;
          rest: string;
          entertainment: string;
          visitCount: string;
          turnover: string;
          dealCount: string;
          projectNews: {
            title: string;
            moreNews: string;
            desc1: string;
            desc2: string;
            desc3: string;
            desc4: string;
            desc5: string;
          };
          creativity: string;
          total_docs: string;
          ai_token_cost: string;
          active_knowledge_base: string;
          yesterday_new_notes: string;
          recent_docs: string;
          view_all: string;
          minutes_ago: string;
          hours_ago: string;
          yesterday: string;
          ai_resource_usage: string;
          token_consumption: string;
          last_7_days: string;
          this_month: string;
          new_kb: string;
          week: {
            monday: string;
            tuesday: string;
            wednesday: string;
            thursday: string;
            friday: string;
            saturday: string;
            sunday: string;
          };
        };
        userCenter: {
          personalInfo: string;
          basicInfo: string;
          changePassword: string;
          thirdPartyApp: string;
          onlineDevice: string;
          nickname: string;
          email: string;
          phoneNumber: string;
          gender: string;
          department: string;
          role: string;
          createTime: string;
          save: string;
          nicknamePlaceholder: string;
          emailPlaceholder: string;
          phonePlaceholder: string;
          genderMale: string;
          genderFemale: string;
          oldPassword: string;
          newPassword: string;
          confirmPassword: string;
          oldPasswordPlaceholder: string;
          newPasswordPlaceholder: string;
          confirmPasswordPlaceholder: string;
          updateSuccess: string;
          passwordSuccess: string;
          passwordDiff: string;
          rules: {
            nickname: string;
            gender: string;
            oldPassword: string;
            newPassword: string;
            confirmPassword: string;
          };
          onlineDeviceColumns: {
            deviceType: string;
            ipaddr: string;
            loginLocation: string;
            browser: string;
            os: string;
            loginTime: string;
          };
          forceLogout: string;
          confirmForceLogout: string;
          forceLogoutSuccess: string;
          social: {
            wechat: string;
            bindTime: string;
            unbind: string;
            bind: string;
            unbindSuccess: string;
          };
          avatar: {
            changeTitle: string;
            uploadTip: string;
            updateSuccess: string;
            selectImage: string;
            confirmCrop: string;
          };
        };
        system: {
          client: {
            title: string;
            clientId: string;
            clientKey: string;
            clientSecret: string;
            grantTypeList: string;
            deviceType: string;
            activeTimeout: string;
            timeout: string;
            status: string;
            form: {
              clientId: FormMsg;
              clientKey: FormMsg;
              clientSecret: FormMsg;
              grantTypeList: FormMsg;
              deviceType: FormMsg;
              activeTimeout: FormMsg;
              timeout: FormMsg;
              status: FormMsg;
            };
            addClient: string;
            editClient: string;
          };
          config: {
            title: string;
            configName: string;
            configKey: string;
            configValue: string;
            configType: string;
            remark: string;
            createTime: string;
            refreshCache: string;
            refreshCacheSuccess: string;
            form: {
              configId: FormMsg;
              configName: FormMsg;
              configKey: FormMsg;
              configValue: FormMsg;
              configType: FormMsg;
              remark: FormMsg;
            };
            addConfig: string;
            editConfig: string;
          };
          dept: {
            empty: string;
            title: string;
            parentId: string;
            deptName: string;
            orderNum: string;
            deptCategory: string;
            leader: string;
            phone: string;
            email: string;
            status: string;
            sort: string;
            createTime: string;
            expandAll: string;
            collapseAll: string;
            form: {
              parentId: FormMsg;
              deptName: FormMsg;
              orderNum: FormMsg;
              deptCategory: FormMsg;
              leader: FormMsg;
              phone: FormMsg;
              email: FormMsg;
              status: FormMsg;
              sort: FormMsg;
              deptId: FormMsg;
            };
            error: {
              getDeptDataFail: string;
              getDeptUserDataFail: string;
            };
            placeholder: {
              defaultLeaderPlaceHolder: string;
              addDataLeaderPlaceHolder: string;
              deptUserIsEmptyLeaderPlaceHolder: string;
            };
            addDept: string;
            editDept: string;
          };
          dict: {
            title: string;
            dictTypeTitle: string;
            dictName: string;
            dictType: string;
            status: string;
            remark: string;
            createTime: string;
            refreshCacheSuccess: string;
            refreshCache: string;
            confirmDeleteDictType: string;
            data: {
              title: string;
              label: string;
              value: string;
              dictSort: string;
              isDefault: string;
              listClass: string;
              cssClass: string;
              status: string;
              remark: string;
              createTime: string;
            };
            form: {
              dictId: FormMsg;
              dictCode: FormMsg;
              dictName: FormMsg;
              dictType: FormMsg;
              status: FormMsg;
              remark: FormMsg;
              dictLabel: FormMsg;
              dictValue: FormMsg;
              dictSort: FormMsg;
              isDefault: FormMsg;
              listClass: FormMsg;
              cssClass: FormMsg;
            };
            addDict: string;
            editDict: string;
            addDictData: string;
            editDictData: string;
            addDictType: string;
            editDictType: string;
            exportDictType: string;
            refreshDictType: string;
            dictTypeIsEmpty: string;
          };
          menu: {
            title: string;
            parentId: string;
            iconType: string;
            menuName: string;
            icon: string;
            orderNum: string;
            perms: string;
            component: string;
            path: string;
            layout: string;
            externalPath: string;
            query: string;
            iframeQuery: string;
            isFrame: string;
            isCache: string;
            menuType: string;
            visible: string;
            status: string;
            createTime: string;
            cache: string;
            noCache: string;
            rootName: string;
            buttonPermissionList: string;
            emptyMenu: string;
            menuDetail: string;
            cascadeDeleteContent: string;
            iconifyTip: string;
            isFrameTip: string;
            isCacheTip: string;
            visibleTip: string;
            statusTip: string;
            permsTip: string;
            componentTip: string;
            pathTip: string;
            layoutTip: string;
            form: {
              parentId: FormMsg;
              menuType: FormMsg;
              menuIds: FormMsg;
              icon: FormMsg;
              menuName: FormMsg;
              orderNum: FormMsg;
              perms: FormMsg;
              isFrame: FormMsg;
              path: FormMsg;
              component: FormMsg;
              query: FormMsg;
              isCache: FormMsg;
              visible: FormMsg;
              status: FormMsg;
              permission: FormMsg;
            };
            placeholder: {
              iconifyIconPlaceholder: string;
              localIconPlaceholder: string;
              queryKey: string;
              queryValue: string;
              queryIframe: string;
            };
            directory: string;
            menu: string;
            button: string;
            addMenu: string;
            addChildMenu: string;
            editMenu: string;
            cascadeDelete: string;
          };
          notice: {
            title: string;
            noticeTitle: string;
            noticeType: string;
            noticeContent: string;
            status: string;
            createTime: string;
            form: {
              noticeTitle: FormMsg;
              noticeType: FormMsg;
              noticeContent: FormMsg;
              status: FormMsg;
              noticeId: FormMsg;
            };
            createByName: string;
            addNotice: string;
            editNotice: string;
          };
          oss: {
            title: string;
            fileName: string;
            originalName: string;
            fileSuffix: string;
            url: string;
            createTime: string;
            service: string;
            ossId: string;
            createByName: string;
            previewEnable: string;
            previewDisable: string;
            confirmPreview: string;
            form: {
              file: FormMsg;
              fileName: FormMsg;
              originalName: FormMsg;
              fileSuffix: FormMsg;
              service: FormMsg;
              url: FormMsg;
            };
            upload: string;
            uploadImage: string;
            preview: string;
            download: string;
            copy: string;
            copySuccess: string;
            configManage: string;
          };
          ossConfig: {
            title: string;
            configKey: string;
            accessKey: string;
            secretKey: string;
            bucketName: string;
            prefix: string;
            endpoint: string;
            domain: string;
            isHttps: string;
            region: string;
            status: string;
            remark: string;
            createTime: string;
            form: {
              configKey: FormMsg;
              accessKey: FormMsg;
              secretKey: FormMsg;
              bucketName: FormMsg;
              prefix: FormMsg;
              endpoint: FormMsg;
              domain: FormMsg;
              isHttps: FormMsg;
              region: FormMsg;
              status: FormMsg;
              remark: FormMsg;
            };
            addOssConfig: string;
            editOssConfig: string;
          };
          post: {
            title: string;
            postCode: string;
            postName: string;
            postSort: string;
            status: string;
            remark: string;
            createTime: string;
            postCategory: string;
            form: {
              postId: FormMsg;
              deptId: FormMsg;
              postCode: FormMsg;
              postName: FormMsg;
              postSort: FormMsg;
              status: FormMsg;
              remark: FormMsg;
              postCategory: FormMsg;
            };
            addPost: string;
            editPost: string;
          };
          role: {
            title: string;
            roleName: string;
            roleKey: string;
            roleSort: string;
            status: string;
            remark: string;
            menuPermission: string;
            dataScope: string;
            createTime: string;
            form: {
              roleName: FormMsg;
              roleKey: FormMsg;
              roleSort: FormMsg;
              status: FormMsg;
              remark: FormMsg;
              menuIds: FormMsg;
              deptIds: FormMsg;
              dataScope: FormMsg;
            };
            addRole: string;
            editRole: string;
            configPermission: string;
            authorizedUsers: string;
            selectMenuPermission: string;
            selectDataScope: string;
            selectDeptPermission: string;
            cancelAuth: string;
            batchCancelAuth: string;
            authUser: string;
            batchAuthUser: string;
            dataScopeScope: string;
            roleAuth: string;
            role: string;
            statusChangeSuccess: string;
          };
          tenant: {
            title: string;
            tenantName: string;
            tenantId: string;
            contactUserName: string;
            contactPhone: string;
            companyName: string;
            licenseNumber: string;
            address: string;
            intro: string;
            domain: string;
            packageId: string;
            expireTime: string;
            accountCount: string;
            status: string;
            createTime: string;
            form: {
              tenantName: FormMsg;
              contactUserName: FormMsg;
              contactPhone: FormMsg;
              companyName: FormMsg;
              licenseNumber: FormMsg;
              address: FormMsg;
              intro: FormMsg;
              domain: FormMsg;
              packageId: FormMsg;
              expireTime: FormMsg;
              accountCount: FormMsg;
              status: FormMsg;
            };
            addTenant: string;
            editTenant: string;
          };
          tenantPackage: {
            title: string;
            packageName: string;
            menuIds: string;
            remark: string;
            status: string;
            createTime: string;
            form: {
              packageName: FormMsg;
              menuIds: FormMsg;
              status: FormMsg;
              remark: FormMsg;
            };
            addTenantPackage: string;
            editTenantPackage: string;
            statusChangeSuccess: string;
          };
          user: {
            title: string;
            userName: string;
            nickName: string;
            deptName: string;
            phonenumber: string;
            status: string;
            createTime: string;
            password: string;
            confirmPassword: string;
            sex: string;
            roleIds: string;
            postIds: string;
            email: string;
            avatar: string;
            remark: string;
            form: {
              userName: FormMsg;
              nickName: FormMsg;
              deptId: FormMsg;
              phonenumber: FormMsg;
              status: FormMsg;
              password: FormMsg;
              confirmPassword: FormMsg;
              sex: FormMsg;
              roleIds: FormMsg;
              postIds: FormMsg;
              email: FormMsg;
              remark: FormMsg;
            };
            addUser: string;
            editUser: string;
            resetPassword: string;
            importUsers: string;
            exportTemplate: string;
            importSuccess: string;
            statusChangeSuccess: string;
          };
        };
        monitor: {
          logininfor: {
            title: string;
            userName: string;
            ipaddr: string;
            loginLocation: string;
            browser: string;
            os: string;
            status: string;
            msg: string;
            loginTime: string;
            client: string;
            deviceType: string;
            unlock: string;
            exportSuccess: string;
            clean: string;
            cleanConfirm: string;
            cleanSuccess: string;
            unlockConfirm: string;
            unlockSuccess: string;
            viewDetail: string;
            detailTitle: string;
            accountInfo: string;
            form: {
              ipaddr: FormMsg;
              userName: FormMsg;
              status: FormMsg;
              loginTime: FormMsg;
            };
          };
          operlog: {
            title: string;
            module: string;
            businessType: string;
            operName: string;
            operIp: string;
            operLocation: string;
            status: string;
            operTime: string;
            costTime: string;
            viewDetail: string;
            detailTitle: string;
            logId: string;
            operInfo: string;
            requestInfo: string;
            requestParam: string;
            responseParam: string;
            errorMsg: string;
            clean: string;
            cleanConfirm: string;
            cleanSuccess: string;
            form: {
              title: FormMsg;
              businessType: FormMsg;
              operName: FormMsg;
              operIp: FormMsg;
              status: FormMsg;
              operTime: FormMsg;
            };
          };
        };
        nodeDefinition: {
          title: string;
          tableView: string;
          jsonView: string;
          import: string;
          export: string;
          save: string;
          reset: string;
          formatJson: string;
          searchPlaceholder: string;
          filterCategory: string;
          listTitle: string;
          jsonEditorTitle: string;
          confirmSaveTitle: string;
          confirmSaveContent: string;
          confirmResetTitle: string;
          confirmResetContent: string;
          saving: string;
          saveSuccess: string;
          saveFail: string;
          load_workflow_failed: string;
          importSuccess: string;
          importFail: string;
          exportSuccess: string;
          exportFail: string;
          jsonParseSuccess: string;
          jsonParseFail: string;
          jsonFormatError: string;
          editTip: string;
        };
        about: {
          title: string;
          introduction: string;
          projectInfo: {
            title: string;
            version: string;
            latestBuildTime: string;
            documentLink: string;
            previewLink: string;
            repositoryLink: string;
          };
          prdDep: string;
          devDep: string;
        };
        ai_rateLimit: {
          title: string;
          systemDefault: string;
          userCustom: string;
          quota: {
            minute: string;
            hour: string;
            day: string;
            requests: string;
            tokens: string;
          };
          table: {
            userId: string;
            userName: string;
            nickName: string;
            minuteLimit: string;
            hourLimit: string;
            dayLimit: string;
            action: string;
            hasCustom: string;
            useDefault: string;
          };
          form: {
            addUserConfig: string;
            editUserConfig: string;
            reqPlaceholder: string;
            tokenPlaceholder: string;
            clearCustom: string;
          };
          msg: {
            updateSuccess: string;
            userAddSuccess: string;
            userUpdateSuccess: string;
            clearSuccess: string;
            clearConfirm: string;
            exceeded: string;
          };
        };
      };
      form: {
        required: string;
        userName: FormMsg;
        phone: FormMsg;
        pwd: FormMsg;
        confirmPwd: FormMsg;
        code: FormMsg;
        email: FormMsg;
      };
      dropdown: Record<Global.DropdownKey, string>;
      icon: {
        themeConfig: string;
        themeSchema: string;
        lang: string;
        fullscreen: string;
        fullscreenExit: string;
        reload: string;
        collapse: string;
        expand: string;
        pin: string;
        unpin: string;
      };
      ai: {
        msg: {
          rate_limit: {
            request_exceeded: string;
            token_exceeded: string;
          };
        };
        common: {
          provider_type: {
            public: string;
            local: string;
          };
          model_type: {
            multi_modal: string;
            llm: string;
            vector: string;
            rerank: string;
            speech: string;
            image: string;
            video: string;
          };
          app_type: {
            fixed_template: string;
            custom_template: string;
            agent: string;
          };
          document_status: {
            parsing: string;
            success: string;
            fail: string;
          };
        };
        skill: {
          label: string;
          info: string;
          add: string;
          edit: string;
          listTitle: string;
          name: string;
          description: string;
          toolBindings: string;
          inputSchema: string;
          outputSchema: string;
          providedBySkillConfig: string;
          noAvailableToolsOrSkills: string;
          confirmDelete: string;
          confirmBatchDelete: string;
          placeholder: {
            name: string;
            nameSearch: string;
            description: string;
            toolBindings: string;
            inputSchema: string;
            statusSearch: string;
          };
          tip: {
            jsonBinding: string;
          };
        };
        datasource: {
          name: string;
          type: string;
          metadata_manage: string;
          add: string;
          search_placeholder: string;
          ddl_import: string;
          sync_metadata: string;
          table_name: string;
          table_comment: string;
          search: string;
          list_title: string;
          connection_info: string;
          status: string;
          operation: string;
          type_dynamic: string;
          type_manual: string;
          status_enabled: string;
          status_disabled: string;
          edit: string;
          delete: string;
          delete_confirm: string;
          delete_success: string;
          delete_fail: string;
          load_fail: string;
          unknown_error: string;
          form: {
            add_title: string;
            edit_title: string;
            name_label: string;
            name_placeholder: string;
            name_required: string;
            source_type_label: string;
            source_type_required: string;
            type_manual_label: string;
            type_dynamic_label: string;
            dynamic_select: string;
            ds_key_label: string;
            driver_label: string;
            jdbc_url_label: string;
            jdbc_url_required: string;
            username_label: string;
            username_required: string;
            password_label: string;
            password_placeholder: string;
            db_type_label: string;
            is_enabled_label: string;
            cancel: string;
            confirm: string;
            add_success: string;
            edit_success: string;
            submit_fail: string;
            driver_required: string;
            dynamic_ds_required: string;
          };
          metadata: {
            title: string;
            ddl_import_title: string;
            sync_metadata_title: string;
            ddl_placeholder: string;
            import_success: string;
            import_fail: string;
            sync_success: string;
            sync_fail: string;
            load_fail: string;
            ddl_required: string;
            confirm_sync: string;
            source_label: string;
            source_ddl: string;
            source_jdbc: string;
            list_tab: string;
            jdbc_tab: string;
            close: string;
            delete_success: string;
            delete_fail: string;
            unknown_error: string;
            ddl_tip: string;
            parse_and_import: string;
            jdbc_sync_tip: string;
          };
        };
        documentSearch: {
          all: string;
          enabled: string;
          disabled: string;
          unGenerated: string;
          generating: string;
          generated: string;
          generateFailed: string;
          keyword: string;
          searchDocName: string;
          enableStatus: string;
          embeddingStatus: string;
          questionStatus: string;
        };
        documentStatusModal: {
          statusChangeRecord: string;
          embeddingTask: string;
          generateQuestionTask: string;
          unknownTask: string;
          pending: string;
          started: string;
          success: string;
          failed: string;
          unknownStatus: string;
          noStatusRecord: string;
        };
        embeddingConfirmModal: {
          selectChunk: string;
          unembeddedOnly: string;
          allChunks: string;
        };
        document_upload: {
          step1: {
            title: string;
            tip1: string;
            tip2: string;
            upload_dragger_text: string;
            upload_folder_btn: string;
            upload_limit_tip: string;
            selected_files_count: string;
            next_step: string;
            select_file_warning: string;
            no_valid_files: string;
            upload_failed_no_data: string;
            upload_error: string;
            files_selected_success: string;
            drag_support_tip: string;
            parsing: string;
            parse_success: string;
            parse_fail: string;
            waiting_upload: string;
            upload_success: string;
            clear_upload_list: string;
            clear_confirm: string;
            re_upload_fail: string;
          };
          step2: {
            title: string;
            chunk_preview: string;
            confirm_upload: string;
            cancel: string;
            temp_file_id_invalid: string;
            file_count: string;
            chunk_rule: string;
            auto_segment: string;
            auto_segment_tip: string;
            custom_segment: string;
            custom_segment_tip: string;
            separators: string;
            separators_tip: string;
            separators_placeholder: string;
            chunk_size: string;
            overlap_size: string;
            auto_clean: string;
            auto_clean_tip: string;
            generate_preview: string;
            batch_preview_btn: string;
            file_list: string;
            search_placeholder: string;
            no_matching_files: string;
            chunked_status: string;
            waiting_status: string;
            no_chunks_prompt: string;
            chunk_label: string;
            char_count: string;
            prev_step: string;
            submit_btn: string;
            edit_modal_title: string;
            content_placeholder: string;
            separator_double_newline: string;
            separator_newline: string;
            separator_period: string;
            separator_exclamation: string;
            separator_question: string;
            separator_semicolon: string;
            separator_space: string;
          };
        };
        app_manager: {
          title: string;
          search: string;
          create_app: string;
          custom_workflow: string;
          fixed_template: string;
          create_from_template: string;
          search_placeholder: string;
          use_type: string;
          use_type_placeholder: string;
          use_type_chat: string;
          use_type_file: string;
          app_name: string;
          app_name_placeholder: string;
          app_desc: string;
          app_desc_placeholder: string;
          confirm_delete_title: string;
          confirm_delete_content: string;
          no_description: string;
          creator: string;
          status_published: string;
          status_unpublished: string;
          workflow_config: string;
          edit_app: string;
          go_to_chat: string;
          template_select: {
            title: string;
            search_placeholder: string;
            all_categories: string;
            all_types: string;
            system_template: string;
            custom_template: string;
            use_count: string;
            use_this_template: string;
            set_name_title: string;
            based_on: string;
            no_templates: string;
          };
        };
        app_detail: {
          title: string;
          public_access_opened: string;
          public_access_closed: string;
          refresh: string;
          workflow_settings: string;
          app_config: string;
          run: string;
          debug: string;
          publish_btn: string;
          publish_confirm_content: string;
          public_access: string;
          refresh_token_tip: string;
          enable_execution_detail: string;
          disable_execution_detail: string;
          enable_execution_detail_success: string;
          disable_execution_detail_success: string;
          public_link: string;
          workflow_not_configured_yet_confirm: string;
          workflow_missing_model_confirm: string;
          workflow_config_error_confirm: string;
          go_to_config: string;
          embed: {
            title: string;
            fullscreen: string;
            mobile: string;
            float: string;
            copy_code_tip: string;
          };
          monitor: {
            title: string;
            user_count: string;
            question_count: string;
            tokens_total: string;
            satisfaction: string;
            period_7d: string;
            period_30d: string;
            period_90d: string;
            period_all: string;
          };
          config: {
            pleaseSelect: string;
            knowledgeBase: string;
            ai_model_tab: string;
            kb_retrieval_tab: string;
            inference_model: string;
            system_prompt: string;
            system_prompt_placeholder: string;
            user_prompt: string;
            user_prompt_placeholder: string;
            temperature: string;
            enable_history: string;
            history_count: string;
            stream_output: string;
            max_tokens: string;
            threshold: string;
            rerank: string;
            empty_response: string;
            empty_response_placeholder: string;
            temp_precise: string;
            temp_balanced: string;
            temp_creative: string;
            temp_random: string;
            temp_very_random: string;
            retrieval_mode: string;
            kb_mode_vector: string;
            kb_mode_keyword: string;
            kb_mode_hybrid: string;
            save_btn: string;
            save_success: string;
            save_failed: string;
            save_warning: string;
            load_options_failed: string;
          };
          workflow_incomplete: string;
          workflow_not_configured: string;
          workflow_has_errors: string;
          missing_required_config: string;
          go_config: string;
          cancel: string;
          copy_link: string;
          copy_embed_code: string;
          fullscreen_code: string;
          mobile_code: string;
          float_code: string;
          publish_from_detail: string;
          fill_app_name_model_kb: string;
        };
        chat: {
          new_chat: string;
          expand_sidebar: string;
          load_app_info_fail: string;
          load_history_fail: string;
          clear_history_success: string;
          delete_session_success: string;
          op_fail: string;
          chat_title: string;
          chat_failed: string;
          thinking_process: string;
          time_cost: string;
          execution_details: string;
          node_count: string;
          ai_thinking: string;
          ai_responding: string;
          input_placeholder: string;
          close_execution_details: string;
          open_execution_details: string;
          citation_details: string;
          similarity: string;
          chunk_id: string;
          unknown_document: string;
          title_required: string;
          title_update_success: string;
          title_update_fail: string;
          history: string;
          clear_all: string;
          no_sessions: string;
          recent_sessions_tip: string;
          read_stream_error: string;
          debug: string;
          debug_tip1: string;
          debug_tip2: string;
          like: string;
          dislike: string;
          cancel_like: string;
          cancel_dislike: string;
          upload_image: string;
          upload_audio: string;
          upload_file: string;
          upload_fail: string;
          upload_error: string;
          abort: string;
          abort_success: string;
          abort_failed: string;
          resume_session: string;
          resumable_sessions: string;
          no_resumable_sessions: string;
          load_resumable_failed: string;
          resume_success: string;
          resume_failed: string;
          abort_time: string;
          abort_reason: string;
          resume: string;
          abortSuccess: string;
          abortFailed: string;
          aborted: string;
          resumeSession: string;
          resumeSessionTitle: string;
          skipResume: string;
          abortReason: string;
          systemException: string;
          userAbort: string;
          networkError: string;
          exceptionType: string;
          exceptionMessage: string;
          abortTime: string;
          messageCount: string;
        };
        model_manager: {
          test: {
            title: string;
            current_model: string;
            chat_placeholder: string;
            ctrl_enter_send: string;
          };
          provider: {
            label: string;
            manage: string;
            name: string;
            supported_models: string;
            no_models_tip: string;
          };
          all: string;
          no_provider: string;
          confirm_delete: string;
          delete_model_confirm: string;
          status_label: string;
          delete_model_confirm_simple: string;
          confirm: string;
          cancel: string;
          delete_success: string;
          copy_success: string;
          model: string;
          default_model: string;
          set_default_model: string;
          set_default_confirm: string;
          model_name: string;
          base_model: string;
          search_placeholder: string;
          add_model: string;
          no_model_data: string;
          edit: string;
          copy: string;
          delete: string;
          status: string;
          enable: string;
          disable: string;
          select_provider: string;
          input_model_name: string;
          select_base_model: string;
          select_model_type: string;
          select_model_source: string;
          input_api_key: string;
          input_api_base: string;
          add_model_title: string;
          edit_model_title: string;
          select_provider_and_model_first: string;
          test_connection_success: string;
          add_success: string;
          update_success: string;
          basic_settings: string;
          model_source: string;
          model_name_placeholder: string;
          model_type: string;
          base_model_placeholder: string;
          no_api_key_tip: string;
          official_website: string;
          get: string;
          api_base_placeholder1: string;
          api_base_placeholder2: string;
          advanced_settings: string;
          max_tokens: string;
          max_tokens_placeholder: string;
          temperature: string;
          no_advanced_settings: string;
          test_connection: string;
          submit: string;
          playground: string;
          current_test_model: string;
          input_message_start: string;
          ctrl_enter_send: string;
          send: string;
          language_model: string;
          vector_model: string;
          model_key: string;
          model_key_placeholder: string;
          operation: string;
          fill_all_model_keys: string;
          provider_model_manage: string;
          provider_name: string;
          supported_models: string;
          no_model_click_add: string;
          save: string;
        };
        node_definition: {
          icon: string;
          node_type: string;
          name: string;
          category: string;
          system_reserved: string;
          operation: string;
          search_title: string;
          category_label: string;
          select_category: string;
          node_definition_title: string;
          copy_suffix: string;
          source_node: string;
          new_node_type: string;
          input_new_node_type: string;
          unique_id_placeholder: string;
          node_name: string;
          display_name: string;
          icon_placeholder: string;
          color: string;
          status: string;
          enable: string;
          disable: string;
          description: string;
          node_desc_placeholder: string;
          custom_input_params: string;
          allow: string;
          forbid: string;
          custom_output_params: string;
          parameters: string;
          type_string: string;
          type_number: string;
          type_boolean: string;
          type_object: string;
          type_array: string;
          add_parameter: string;
          no_parameter_click_add: string;
          parameter_index: string;
          required: string;
          param_key_name: string;
          param_key_placeholder: string;
          param_label: string;
          param_label_placeholder: string;
          param_type: string;
          default_value: string;
          optional: string;
          param_desc_placeholder: string;
          required_parameter: string;
          parameter_config: string;
          prompt: string;
          param_config_warning1: string;
          param_config_warning2: string;
          input_params: string;
          output_params: string;
        };
        workflow: {
          unnamed_app: string;
          debug: string;
          go_to_chat: string;
          auto_save: string;
          save: string;
          components: string;
          tools: string;
          builtin_tools: string;
          message_not_empty: string;
          app_not_published: string;
          clear_chat_history: string;
          send: string;
          ai_assistant: string;
          run_test: string;
          execution_time: string;
          tokens_consumed: string;
          total: string;
          input: string;
          output: string;
          get_execution_detail_failed: string;
          workflow_execution_detail: string;
          unknown_status: string;
          time_cost: string;
          clear: string;
          set_default_test_params: string;
          edit_node_properties: string;
          copy_node: string;
          delete_node: string;
          add_node: string;
          no_nodes_to_add: string;
          publish_time: string;
          publisher: string;
          remark: string;
          load_publish_history_failed: string;
          publish_history: string;
          no_publish_history: string;
          version: string;
          zoom_in: string;
          zoom_out: string;
          fit_view: string;
          collapse_all_nodes: string;
          expand_all_nodes: string;
          elegant_layout: string;
          collapse_and_layout: string;
          undo: string;
          redo: string;
          operation_history: string;
          current_status: string;
          executed: string;
          can_redo: string;
          total_items: string;
          just_saved: string;
          pending_save: string;
          saving: string;
          saved: string;
          saved_n_minutes_ago: string;
          saved_n_hours_ago: string;
          saved_n_days_ago: string;
          unsaved_changes_title: string;
          unsaved_changes_content: string;
          save_and_leave: string;
          discard_changes: string;
          no_nodes_to_layout: string;
          layout_done: string;
          all_nodes_collapsed: string;
          all_nodes_expanded: string;
          missing_app_id: string;
          workflow_data_not_exist: string;
          load_workflow_failed: string;
          save_failed: string;
          save_success: string;
          publish_failed: string;
          publish_error: string;
          publish_failed_msg: string;
          publish_failed_config: string;
          publish_app: string;
          publish_remark_placeholder: string;
          confirm_publish: string;
          publish_success: string;
          invalid_connection: string;
          cannot_connect: string;
          debug_title: string;
          debug_tip1: string;
          debug_tip2: string;
          init_history: string;
          invalid_temp_file_id: string;
          please_fill_app_info: string;
          please_finish_current_param_config: string;
          unnamed_param: string;
          snapshot: {
            drag_add_link_node: string;
            add_link_node: string;
            add_node: string;
            delete_node: string;
            copy_node: string;
            move_node: string;
            link_nodes: string;
          };
          history: {
            custom_inputs: string;
            custom_outputs: string;
            add_node: string;
            delete_node: string;
            add_link: string;
            delete_link: string;
            link_condition_changed: string;
          };
          msg: {
            connection_not_supported: string;
            invalid_connection: string;
          };
        };
        workflow_node: {
          param_type_string: string;
          param_type_number: string;
          param_type_boolean: string;
          param_type_object: string;
          param_type_array: string;
          param_type_datetime: string;
          node_category_basic: string;
          node_category_ai: string;
          node_category_logic: string;
          node_category_database: string;
          node_category_action: string;
          node_category_fileprocessing: string;
          op_eq: string;
          op_ne: string;
          op_gt: string;
          op_lt: string;
          op_gte: string;
          op_lte: string;
          op_contains: string;
          op_not_contains: string;
          op_starts_with: string;
          op_ends_with: string;
          op_is_empty: string;
          op_is_not_empty: string;
          log_op_and: string;
          log_op_or: string;
          complete_existing_params_first: string;
          unnamed_param: string;
          copy_success_ref: string;
          input_params: string;
          output_params: string;
          click_copy_tooltip: string;
          no_available_param_sources: string;
          no_matching_variables: string;
          input_or_select_variable: string;
          unknown_type: string;
          copied_ref: string;
          edit_type_name: string;
          add_type_name2: string;
          new_param: string;
          greeting: string;
          save: string;
          rename: string;
          copy_node: string;
          unnamed_node: string;
          confirm: string;
          branch_name: string;
          condition_label: string;
          loading: string;
          nested_group: string;
          more_items: string;
          detail: string;
          delete: string;
          default_else: string;
          other_else: string;
          intent_name_default: string;
          branch: string;
          param: string;
          and_n_more: string;
          system_prompt: string;
          no_limit: string;
          default_user_prompt: string;
          unknown: string;
          param_name: string;
          global_params: string;
          session_params: string;
          specify_reply_content: string;
          app_params: string;
          interface_params: string;
          history_context: string;
          max_return_rows: string;
          condition_branch: string;
          if_specify_reply_content_it_is_final_output: string;
          config_branch_condition: string;
          empty_result_reply: string;
          table_whitelist: string;
          table_blacklist: string;
          allowed_query_tables: string;
          forbidden_query_tables: string;
          variable_selection: string;
          similarity_threshold: string;
          config_condition: string;
          select_variable: string;
          select_datasource: string;
          eg_username: string;
          eg_user_name: string;
          eg_add_intent_node: string;
          eg_professional_assistant: string;
          eg_analyze_problem: string;
          eg_hello_user: string;
          keep_n_messages: string;
          keyword_search: string;
          parameter_key: string;
          parameter_default_value: string;
          define_ai_role: string;
          define_intent_branch: string;
          enable_context_memory: string;
          enable_stream_output: string;
          description_purpose: string;
          is_required: string;
          max_tokens: string;
          latest_n_messages: string;
          reply_when_no_result: string;
          condition_not_set: string;
          condition_group: string;
          max_tokens_desc: string;
          compare_value: string;
          add_type_name: string;
          click_copy_param: string;
          user_name: string;
          user_prompt_desc: string;
          type: string;
          custom_parameters: string;
          custom_output: string;
          merge_node_desc: string;
          input_reply_content: string;
          input_end_node_content: string;
          override_final_response: string;
          select_search_mode: string;
          select_knowledge_base: string;
          config_llm_behavior: string;
          rename_node: string;
          key_name: string;
          hide_basenode_default_output: string;
          default_use_model_limit: string;
          history_messages_count: string;
          no_session_params: string;
          no_global_params: string;
          click_above_to_add_condition: string;
          user_prompt: string;
          stream_output: string;
          delete_node: string;
          data_type: string;
          default_value: string;
          param_desc: string;
          node_param: string;
          condition_branch_if_else: string;
          data_source: string;
          vector_retrieval: string;
          dialog_config: string;
          enable_history_dialog: string;
          user_id: string;
          hybrid_retrieval: string;
          retrieval_config: string;
          knowledge_base: string;
          dataset: string;
          select_dataset: string;
          select_knowledge_base_first: string;
          retrieval_mode: string;
          return_count: string;
          enable_rerank: string;
          intent_name: string;
          session_id: string;
          start: string;
          end: string;
          tool_config: string;
          bind_mcp_servers: string;
          mcp_select_placeholder: string;
          bind_builtin_tools: string;
          tool_select_placeholder: string;
          bind_skills: string;
          skill_select_placeholder: string;
          enable_tool_trace: string;
          enable_tool_trace_desc: string;
          providedBy: string;
          mcpService: string;
          builtinTool: string;
          continue_condition: string;
          continue_when_all_met: string;
          config_continue_condition: string;
          continue_when_met: string;
          loop_when: string;
          max_iterations_label: string;
          exit_or_end: string;
          parse_config: string;
          process_type: string;
          process_type_desc: string;
          process_type_generic: string;
          process_type_qa: string;
          process_type_online: string;
          process_type_web: string;
        };
        workflow_public: {
          select_model: string;
          model: string;
          ai_model: string;
          ai_model_config: string;
          please_select_ai_model: string;
          please_select_llm_model: string;
          model_selector: string;
          creative: string;
          extremely_random: string;
          temperature_desc: string;
          param_settings: string;
          advanced_params: string;
          load_model_list_failed: string;
          prompt: string;
          temperature: string;
          max_tokens: string;
          precise: string;
          balanced: string;
          random: string;
        };
        workflow_template: {
          used_count_times: string;
          template: string;
          workflow_template: string;
          app_name: string;
          app_desc: string;
          search: string;
          confirm: string;
          cancel: string;
          edit: string;
          create: string;
          close: string;
          open: string;
          system: string;
          system_template: string;
          user_template: string;
          no_desc: string;
          no_template: string;
          unnamed_template: string;
          new_workflow: string;
          template_name: string;
          template_desc: string;
          init_failed: string;
          template_edit: string;
          components: string;
          save: string;
          auto_save: string;
          missing_template_id: string;
          template_not_exist: string;
          load_template_failed: string;
          save_failed: string;
          save_success: string;
          create_success: string;
          delete_success: string;
          load_category_failed: string;
          copy_failed: string;
          copy_success: string;
          copy_to_custom: string;
          copy_to_custom_template: string;
          create_success_jump: string;
          publish_failed: string;
          publish_error: string;
          unique_identifier: string;
          base_info: string;
          base_config: string;
          missing_app_name: string;
          missing_reasoning_model: string;
          please_input_publish_summary: string;
          please_input_app_name: string;
          please_input_app_desc: string;
          please_input_greeting: string;
          please_input_prompt: string;
          please_input_new_template_name: string;
          please_input_template_name: string;
          please_input_node_name: string;
          create_app_from_template: string;
          select_category: string;
          select_icon: string;
          system_template_cannot_delete: string;
          system_template_cannot_edit: string;
          edit_template: string;
          advanced_config: string;
          edit_icon: string;
          search_icon: string;
          robot_icon: string;
          intelligence_icon: string;
          publish: string;
          save_app_config_failed: string;
          icon_doc: string;
          icon_chat: string;
          icon_data: string;
          icon_auto: string;
          user_built: string;
          workflow_config: string;
          create_failed: string;
          copy_success_created: string;
          please_input_template_code: string;
          new_template: string;
          saving: string;
          template_code: string;
          category: string;
          icon_label: string;
          description: string;
          use_template: string;
          uncategorized: string;
          create_app_name_prefix: string;
          copy_name_suffix: string;
          confirm_delete_template: string;
          unknown: string;
          copy: string;
        };
        chunk_manager: {
          batch_generate_loading: string;
          batch_generate_success: string;
          batch_generate_error: string;
          content_empty_error: string;
          select_chunk_prompt: string;
          add_chunk: string;
          edit_chunk: string;
          chunk_detail: string;
          chunk_title: string;
          chunk_content: string;
          chunk_index: string;
          chunk_count: string;
          no_title: string;
          title_placeholder: string;
          title_optional_placeholder: string;
          content_placeholder: string;
          content_required_placeholder: string;
          associated_questions: string;
          ai_generate_question: string;
          add_question_placeholder: string;
          no_associated_questions: string;
          batch_mode: string;
          selected_items: string;
          batch_selection: string;
          exit_batch: string;
          add_new_chunk: string;
          no_chunks: string;
          loading: string;
          all_chunks_loaded: string;
          batch_enable: string;
          batch_disable: string;
          batch_delete: string;
          delete: string;
          confirm_delete_chunk: string;
          operating: string;
          enabled_success: string;
          disabled_success: string;
          delete_success: string;
          delete_fail: string;
          save_success: string;
          save_fail: string;
          op_fail: string;
          link_success: string;
          unlink_success: string;
          generating: string;
          batch_enable_success: string;
          batch_disable_success: string;
          please_select_chunks: string;
          displayLevel: string;
          action: string;
          display_concise: string;
          display_medium: string;
          display_detailed: string;
          model_select_modal: {
            default_prompt: string;
            alert_placeholders: string;
            alert_role: string;
            alert_adjustment: string;
          };
        };
        knowledge_manager: {
          stats: {
            knowledgeBase: string;
            dataset: string;
            document: string;
            chunk: string;
            processing: string;
            failed: string;
          };
          search: string;
          searchPlaceholder: string;
          listTitle: string;
          retrievalTest: string;
          createKnowledgeBase: string;
          status: {
            active: string;
            archived: string;
          };
          noDescription: string;
          datasetCount: string;
          documentCount: string;
          manage: string;
          edit: string;
          delete: string;
          deleteConfirmTitle: string;
          deleteConfirmContent: string;
          deleteSuccess: string;
          emptyDescription: string;
          modal: {
            create: string;
            edit: string;
            save: string;
            cancel: string;
            name: string;
            namePlaceholder: string;
            description: string;
            descPlaceholder: string;
            nameMaxLength: string;
            nameRequired: string;
            addSuccess: string;
            updateSuccess: string;
            embeddingModel: string;
            embeddingModelPlaceholder: string;
            embeddingModelEditTip: string;
            embeddingModelRequired: string;
          };
          sandbox: {
            title: string;
            reset: string;
            searchPlaceholder: string;
            search: string;
            config: string;
            knowledgeBase: string;
            kbPlaceholder: string;
            dataset: string;
            datasetPlaceholder: string;
            topK: string;
            threshold: string;
            mode: string;
            modeVector: string;
            modeKeyword: string;
            modeHybrid: string;
            enableRerank: string;
            rerankTooltip: string;
            enableHighlight: string;
            highlightTooltip: string;
            downloadError: string;
            noDocIdError: string;
            hitContent: string;
            hitTitle: string;
            hitQuestion: string;
            resultTitle: string;
            items: string;
            unknownDoc: string;
            downloadFile: string;
            matchedQuestions: string;
            noResult: string;
            emptyInput: string;
            detailTitle: string;
            similarity: string;
          };
          permission: string;
          select_permission_level: string;
          download_failed: string;
        };
        knowledge_detail: {
          index: {
            loadKBFail: string;
            confirmDelete: string;
            deleteDatasetConfirm: string;
            deleteSuccess: string;
            onlineDocSaveSuccess: string;
            saveFail: string;
            addWebLinkSuccess: string;
            addFail: string;
            processType: {
              QA_PAIR: string;
              ONLINE_DOC: string;
              WEB_LINK: string;
              GENERIC_FILE: string;
              WORKFLOW_FILE: string;
              UNKNOWN: string;
            };
            stats: {
              question: string;
              chunk: string;
              document: string;
              processing: string;
              failed: string;
            };
            retrievalTest: string;
            tabs: {
              documents: string;
              questions: string;
            };
            dataset: {
              title: string;
              desc1: string;
              desc2: string;
              add: string;
              system: string;
              docCount: string;
              empty: string;
              edit: string;
              delete: string;
              pleaseSelect: string;
              processMode: string;
            };
          };
          document: {
            documentName: string;
            fileSize: string;
            enabled: string;
            disabled: string;
            embeddingStatus: string;
            statusUnembedded: string;
            statusEmbedding: string;
            statusEmbedded: string;
            statusFailed: string;
            questionStatus: string;
            chunkCount: string;
            tokenCount: string;
            createTime: string;
            actionChunkManage: string;
            actionEmbedding: string;
            actionGenerateQuestion: string;
            actionStatusRecord: string;
            actionDelete: string;
            enableSuccess: string;
            disableSuccess: string;
            confirmDeleteDoc: string;
            editSuccess: string;
            editFail: string;
            startEmbeddingSuccess: string;
            operateFail: string;
            startGenerateQuestionSuccess: string;
            uploadSuccess: string;
            uploadFile: string;
            uploadQA: string;
            addOnlineDoc: string;
            addWebLink: string;
            uploadWorkflow: string;
            addDoc: string;
            actionRetry: string;
            retrySuccess: string;
            retryFail: string;
            customChunk: string;
            dragUpload: string;
            qaFormatTip: string;
            fileFormatTip: string;
            batchEnable: string;
            batchDisable: string;
            batchEmbedding: string;
            batchGenerateQuestion: string;
            documentPromptTip: string;
            documentPromptText: string;
            workflowAppRequired: string;
            workflowAppUnpublished: string;
            workflowAppInvalidType: string;
            goToEdit: string;
          };
          datasetModal: {
            editDataset: string;
            createDataset: string;
            systemPreset: string;
            name: string;
            namePlaceholder: string;
            nameRequired: string;
            nameMaxLength: string;
            type: string;
            typePlaceholder: string;
            typeRequired: string;
            typeOptions: {
              FILE: string;
              WEB: string;
              MANUAL: string;
            };
            processType: string;
            processTypePlaceholder: string;
            processTypeRequired: string;
            processTypeOptions: {
              GENERIC_FILE: string;
              QA_PAIR: string;
              ONLINE_DOC: string;
              WEB_LINK: string;
              WORKFLOW_FILE: string;
            };
            workflowId: string;
            workflowIdPlaceholder: string;
            workflowIdRequired: string;
            workflowIdTip: string;
            goToAppManager: string;
            maxConcurrency: string;
            maxConcurrencyPlaceholder: string;
            sourceType: string;
            sourceTypePlaceholder: string;
            sourceTypeOptions: {
              FILE_UPLOAD: string;
              TEXT_INPUT: string;
              WEB_CRAWL: string;
            };
            chunkSetting: string;
            minChunkSize: string;
            minChunkSizePlaceholder: string;
            maxChunkSize: string;
            maxChunkSizePlaceholder: string;
            chunkOverlap: string;
            chunkOverlapPlaceholder: string;
            childChunkSize: string;
            childChunkSizePlaceholder: string;
            childChunkOverlap: string;
            childChunkOverlapPlaceholder: string;
            updateSuccess: string;
            createSuccess: string;
            save: string;
            create: string;
          };
          onlineDocModal: {
            add: string;
            edit: string;
            title: string;
            titlePlaceholder: string;
            titleRequired: string;
            content: string;
            contentPlaceholder: string;
            contentRequired: string;
          };
          webLinkModal: {
            add: string;
            singleTab: string;
            url: string;
            urlPlaceholder: string;
            batchTab: string;
            batchUrlLabel: string;
            batchUrlPlaceholder: string;
            addBtn: string;
            singleUrlRequired: string;
            singleUrlInvalid: string;
            batchUrlsRequired: string;
          };
          questionTable: {
            content: string;
            clickToDetail: string;
            chunkCount: string;
            hitNum: string;
            sourceType: string;
            sourceMap: {
              MANUAL: string;
              LLM: string;
              UNKNOWN: string;
            };
            createTime: string;
            updateTime: string;
            actionLink: string;
            actionDelete: string;
            editSuccess: string;
            editFail: string;
            deleteConfirmTitle: string;
            deleteConfirmContent: string;
            deleteSuccess: string;
            listTitle: string;
            addQuestion: string;
          };
          questionAddModal: {
            title: string;
            tip: string;
            placeholder: string;
            addSuccess: string;
            addFail: string;
            requireContent: string;
          };
          chunkLinkModal: {
            title: string;
            selectDoc: string;
            docCount: string;
            searchDoc: string;
            loading: string;
            noDoc: string;
            selectChunk: string;
            linkedCount: string;
            currentDocCount: string;
            displayLevel: string;
            levelConcise: string;
            levelMedium: string;
            levelDetailed: string;
            searchChunk: string;
            requireSelectDoc: string;
            noChunk: string;
            noTitle: string;
            linked: string;
            loadMore: string;
            loadAll: string;
            linkSuccess: string;
            linkFail: string;
            unlinkSuccess: string;
            unlinkFail: string;
            loadDocFail: string;
            loadLinkedFail: string;
            loadChunkFail: string;
          };
          questionDetailDrawer: {
            title: string;
            question: string;
            edit: string;
            questionPlaceholder: string;
            sourceMap: {
              MANUAL: string;
              LLM: string;
            };
            sourcePrefix: string;
            hitNumPrefix: string;
            createTimePrefix: string;
            linkedChunksTitle: string;
            addLink: string;
            loading: string;
            noLinkedChunks: string;
            noTitle: string;
            unlink: string;
            documentLabel: string;
            prev: string;
            next: string;
            editSuccess: string;
            editFail: string;
            loadLinkFail: string;
            unlinkConfirmTitle: string;
            unlinkConfirmContent: string;
            unlinkSuccess: string;
            contentEmpty: string;
            saveSuccess: string;
            saveFail: string;
          };
          view_chunks: string;
          test: string;
        };
        mcp: {
          listTitle: string;
          addTitle: string;
          editTitle: string;
          serverName: string;
          description: string;
          transportType: string;
          serverConfig: string;
          status: string;
          searchPlaceholder: string;
          form: {
            serverNameRequired: string;
            transportTypeRequired: string;
            serverNamePlaceholder: string;
            descriptionPlaceholder: string;
            serverConfigPlaceholder: string;
          };
        };
        builtinTool: {
          listTitle: string;
          addTitle: string;
          editTitle: string;
          toolName: string;
          description: string;
          pythonCode: string;
          inputSchema: string;
          initParamsTab: string;
          inputSchemaTab: string;
          outputSchemaTab: string;
          status: string;
          searchPlaceholder: string;
          securityWarningTitle: string;
          securityWarning: string;
          paramEditor: {
            defaultTitle: string;
            addParam: string;
            editParam: string;
            name: string;
            namePlaceholder: string;
            displayName: string;
            displayNamePlaceholder: string;
            type: string;
            required: string;
            description: string;
            descriptionPlaceholder: string;
            defaultValue: string;
            defaultValuePlaceholder: string;
            nameRequired: string;
            namePattern: string;
            deleteConfirm: string;
            typeString: string;
            typeNumber: string;
            typeBoolean: string;
            typeObject: string;
            typeArray: string;
          };
          form: {
            toolNameRequired: string;
            toolNamePattern: string;
            toolNamePlaceholder: string;
            descriptionPlaceholder: string;
            codePlaceholder: string;
            schemaPlaceholder: string;
          };
        };
        connection_rule: {
          matrix_view: string;
          list_view: string;
          source_node: string;
          target_node: string;
          allowed: string;
          source_node_required: string;
          target_node_required: string;
        };
      };
      datatable: {
        itemCount: string;
        oss: {
          access_policy: {
            private: string;
            public: string;
            custom: string;
          };
        };
        system: {
          data_scope: {
            all: string;
            custom: string;
            dept: string;
            dept_and_below: string;
            self: string;
            dept_and_below_or_self: string;
          };
        };
      };
    };

    type GetI18nKey<T extends Record<string, unknown>, K extends keyof T = keyof T> = K extends string
      ? T[K] extends Record<string, unknown>
        ? `${K}.${GetI18nKey<T[K]>}`
        : K
      : never;

    type I18nKey = GetI18nKey<Schema>;

    type TranslateOptions<Locales extends string> = import('vue-i18n').TranslateOptions<Locales>;

    interface $T {
      (key: I18nKey): string;
      (key: I18nKey, plural: number, options?: TranslateOptions<LangType>): string;
      (key: I18nKey, defaultMsg: string, options?: TranslateOptions<I18nKey>): string;
      (key: I18nKey, list: unknown[], options?: TranslateOptions<I18nKey>): string;
      (key: I18nKey, list: unknown[], plural: number): string;
      (key: I18nKey, list: unknown[], defaultMsg: string): string;
      (key: I18nKey, named: Record<string, unknown>, options?: TranslateOptions<LangType>): string;
      (key: I18nKey, named: Record<string, unknown>, plural: number): string;
      (key: I18nKey, named: Record<string, unknown>, defaultMsg: string): string;
    }
  }

  /** Service namespace */
  namespace Service {
    /** Other baseURL key */
    type OtherBaseURLKey = 'demo';

    interface ServiceConfigItem {
      /** The backend service base url */
      baseURL: string;
      /** The proxy pattern of the backend service base url */
      proxyPattern: string;
      ws?: boolean;
    }

    interface OtherServiceConfigItem extends ServiceConfigItem {
      key: OtherBaseURLKey;
    }

    /** The backend service config */
    interface ServiceConfig extends ServiceConfigItem {
      /** Other backend service config */
      other: OtherServiceConfigItem[];
    }

    interface SimpleServiceConfig extends Pick<ServiceConfigItem, 'baseURL'> {
      other: Record<OtherBaseURLKey, string>;
    }

    /** The backend service response data */
    type Response<T = unknown> = {
      /** The backend service response code */
      code: string;
      /** The backend service response message */
      msg: string;
      /** The backend service response data */
      data: T;
      rows?: any[];
      total?: number;
    };

    /** The demo backend service response data */
    type DemoResponse<T = unknown> = {
      /** The backend service response code */
      status: string;
      /** The backend service response message */
      message: string;
      /** The backend service response data */
      result: T;
    };
  }
}
