import { transformRecordToOption } from '@/utils/common';
import { $t } from '@/locales';

/** enable status */
export const enableStatusRecord: Record<Api.Common.EnableStatus, string> = {
  '0': $t('dict.sys_normal_disable.normal'),
  '1': $t('dict.sys_normal_disable.disable')
};

export const enableStatusOptions = transformRecordToOption(enableStatusRecord);

/** yes or no status */
export const yesOrNoStatusRecord: Record<Api.Common.YesOrNoStatus, string> = {
  Y: $t('dict.sys_yes_no.yes'),
  N: $t('dict.sys_yes_no.no')
};

export const yesOrNoStatusOptions = transformRecordToOption(yesOrNoStatusRecord);

/** menu type */
export const menuTypeRecord: Record<Api.System.MenuType, string> = {
  M: $t('page.system.menu.directory'),
  C: $t('page.system.menu.menu'),
  F: $t('page.system.menu.button')
};

export const menuTypeOptions = transformRecordToOption(menuTypeRecord);

/** menu is frame */
export const menuIsFrameRecord: Record<Api.System.IsMenuFrame, string> = {
  '0': $t('dict.sys_yes_no.yes'),
  '1': $t('dict.sys_yes_no.no'),
  '2': 'iframe'
};

export const menuIsFrameOptions = transformRecordToOption(menuIsFrameRecord);

/** menu icon type */
export const menuIconTypeRecord: Record<Api.System.IconType, string> = {
  '1': 'iconify',
  '2': $t('page.system.menu.placeholder.localIconPlaceholder')
};

export const menuIconTypeOptions = transformRecordToOption(menuIconTypeRecord);

/** menu layout */
export const menuLayoutRecord: Record<Api.System.MenuLayout, string> = {
  '0': '默认布局',
  '1': '空白布局'
};

export const menuLayoutOptions = transformRecordToOption(menuLayoutRecord);

/** gen java type */
export const genJavaTypeRecord: Record<Api.Tool.JavaType, string> = {
  Long: 'Long',
  String: 'String',
  Integer: 'Integer',
  Double: 'Double',
  BigDecimal: 'BigDecimal',
  Date: 'Date',
  Boolean: 'Boolean'
};

export const genJavaTypeOptions = transformRecordToOption(genJavaTypeRecord);

/** gen query type */
export const genQueryTypeRecord: Record<Api.Tool.QueryType, string> = {
  EQ: '=',
  NE: '!=',
  GT: '>',
  GE: '>=',
  LT: '<',
  LE: '<=',
  LIKE: 'LIKE',
  BETWEEN: 'BETWEEN'
};

export const genQueryTypeOptions = transformRecordToOption(genQueryTypeRecord);

/** gen html type */
export const genHtmlTypeRecord: Record<Api.Tool.HtmlType, string> = {
  input: '文本框',
  textarea: '文本域',
  select: '下拉框',
  radio: '单选框',
  checkbox: '复选框',
  datetime: '日期时间控件',
  imageUpload: '图片上传',
  fileUpload: '文件上传',
  editor: '富文本控件'
};

export const genHtmlTypeOptions = transformRecordToOption(genHtmlTypeRecord);

/** gen type */
export const genTypeRecord: Record<Api.Tool.GenType, string> = {
  '0': 'ZIP 压缩包',
  '1': '自定义路径'
};

export const genTypeOptions = transformRecordToOption(genTypeRecord);

/** gen type */
export const genTplCategoryRecord: Record<Api.Tool.TplCategory, string> = {
  crud: '单表（增删改查）',
  tree: '树表（增删改查）'
};

export const genTplCategoryOptions = transformRecordToOption(genTplCategoryRecord);

/** oss config is https */
export const ossConfigIsHttpsRecord: Record<Api.Common.YesOrNoStatus, string> = {
  Y: 'https://',
  N: 'http://'
};

export const ossConfigIsHttpsOptions = transformRecordToOption(ossConfigIsHttpsRecord);

/** oss access policy */
export const ossAccessPolicyRecord: Record<Api.System.OssAccessPolicy, string> = {
  '0': $t('datatable.oss.access_policy.private'),
  '1': $t('datatable.oss.access_policy.public'),
  '2': $t('datatable.oss.access_policy.custom')
};

export const ossAccessPolicyOptions = transformRecordToOption(ossAccessPolicyRecord);

/** data scope */
export const dataScopeRecord: Record<Api.System.DataScope, string> = {
  '1': $t('datatable.system.data_scope.all'),
  '2': $t('datatable.system.data_scope.custom'),
  '3': $t('datatable.system.data_scope.dept'),
  '4': $t('datatable.system.data_scope.dept_and_below'),
  '5': $t('datatable.system.data_scope.self'),
  '6': $t('datatable.system.data_scope.dept_and_below_or_self')
};

export const dataScopeOptions = transformRecordToOption(dataScopeRecord);

/** ai provider type */
export const aiProviderTypeRecord: Record<string, string> = {
  '1': $t('ai.common.provider_type.public'),
  '2': $t('ai.common.provider_type.local')
};

export const aiProviderTypeOptions = transformRecordToOption(aiProviderTypeRecord);

/** ai model type */
export const aiModelTypeRecord: Record<string, string> = {
  '0': $t('ai.common.model_type.multi_modal'),
  '1': $t('ai.common.model_type.llm'),
  '2': $t('ai.common.model_type.vector'),
  '3': $t('ai.common.model_type.rerank'),
  '4': $t('ai.common.model_type.speech'),
  '5': $t('ai.common.model_type.image'),
  '6': $t('ai.common.model_type.video')
};

export const aiModelTypeOptions = transformRecordToOption(aiModelTypeRecord);

/** ai app type */
export const aiAppTypeRecord: Record<string, string> = {
  '1': $t('ai.common.app_type.fixed_template'),
  '2': $t('ai.common.app_type.custom_template'),
  '3': $t('ai.common.app_type.agent')
};

export const aiAppTypeOptions = transformRecordToOption(aiAppTypeRecord);

/** ai document status */
export const aiDocumentStatusRecord: Record<string, string> = {
  '0': $t('ai.common.document_status.parsing'),
  '1': $t('ai.common.document_status.success'),
  '2': $t('ai.common.document_status.fail')
};

export const aiDocumentStatusOptions = transformRecordToOption(aiDocumentStatusRecord);
