<script setup lang="ts">
import { reactive } from 'vue';
import { NButton } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { fetchUpdateUserPassword, fetchUpdateUserProfile } from '@/service/api/system';
import { useAuthStore } from '@/store/modules/auth';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import OnlineTable from './modules/online-table.vue';
import SocialCard from './modules/social-card.vue';
import UserAvatar from './modules/user-avatar.vue';

defineOptions({
  name: 'UserCenter'
});

const authStore = useAuthStore();
const { userInfo } = authStore;

const { loading: btnLoading, startLoading: startBtnLoading, endLoading: endBtnLoading } = useLoading();

const {
  formRef: profileFormRef,
  validate: profileValidate,
  restoreValidation: profileRestoreValidation
} = useNaiveForm();
const {
  formRef: passwordFormRef,
  validate: passwordValidate,
  restoreValidation: passwordRestoreValidation
} = useNaiveForm();
const { createRequiredRule, patternRules } = useFormRules();

type ProfileModel = Api.System.UserProfileOperateParams;
type PasswordModel = Api.System.UserPasswordOperateParams & { confirmPassword: string };

const profileModel: ProfileModel = reactive(createDefaultProfileModel());
const passwordModel: PasswordModel = reactive(createDefaultPasswordModel());

function createDefaultProfileModel(): ProfileModel {
  return {
    nickName: userInfo.user?.nickName || '',
    email: userInfo.user?.email || '',
    phonenumber: userInfo.user?.phonenumber || '',
    sex: userInfo.user?.sex || '0'
  };
}

function createDefaultPasswordModel(): PasswordModel {
  return {
    oldPassword: '',
    confirmPassword: '',
    newPassword: ''
  };
}

type ProfileRuleKey = Extract<keyof ProfileModel, 'nickName' | 'email' | 'phonenumber' | 'sex'>;
type PasswordRuleKey = Extract<keyof PasswordModel, 'oldPassword' | 'newPassword' | 'confirmPassword'>;

const profileRules: Record<ProfileRuleKey, App.Global.FormRule> = {
  nickName: createRequiredRule($t('page.userCenter.rules.nickname')),
  email: { ...patternRules.email, required: true },
  phonenumber: { ...patternRules.phone, required: true },
  sex: createRequiredRule($t('page.userCenter.rules.gender'))
};

const passwordRules: Record<PasswordRuleKey, App.Global.FormRule> = {
  oldPassword: createRequiredRule($t('page.userCenter.rules.oldPassword')),
  confirmPassword: createRequiredRule($t('page.userCenter.rules.confirmPassword')),
  newPassword: createRequiredRule($t('page.userCenter.rules.newPassword'))
};

async function updateProfile() {
  await profileValidate();
  startBtnLoading();
  const { error } = await fetchUpdateUserProfile(profileModel);
  if (!error) {
    window.$message?.success($t('page.userCenter.updateSuccess'));
    // 更新本地用户信息
    if (userInfo.user) {
      Object.assign(userInfo.user, profileModel);
      profileRestoreValidation();
    }
  }
  endBtnLoading();
}

async function updatePassword() {
  await passwordValidate();
  if (passwordModel.newPassword !== passwordModel.confirmPassword) {
    window.$message?.error($t('page.userCenter.passwordDiff'));
    return;
  }
  startBtnLoading();
  const { oldPassword, newPassword } = passwordModel;
  const { error } = await fetchUpdateUserPassword({ oldPassword, newPassword });
  if (!error) {
    window.$message?.success($t('page.userCenter.passwordSuccess'));
    // 清空表单
    Object.assign(passwordModel, createDefaultPasswordModel());
    passwordRestoreValidation();
  }
  endBtnLoading();
}
</script>

<template>
  <div class="flex gap-16px">
    <!-- 个人信息卡片 -->
    <NCard :title="$t('page.userCenter.personalInfo')" class="w-360px shadow-sm">
      <div class="flex-x-center flex-wrap gap-24px">
        <div class="flex-center flex-col gap-16px">
          <div class="relative">
            <UserAvatar />
          </div>
          <div class="text-18px font-medium">{{ userInfo.user?.nickName }}</div>
          <div class="text-14px text-gray-500">{{ userInfo.user?.userName }}</div>
        </div>
        <NDescriptions :column="1" label-placement="left" label-width="120px">
          <NDescriptionsItem :label="$t('page.userCenter.phoneNumber')">
            <div class="text-14px">{{ userInfo.user?.phonenumber }}</div>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.userCenter.email')">
            <div class="text-14px">{{ userInfo.user?.email }}</div>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.userCenter.department')">
            <div class="text-14px">{{ userInfo.user?.deptName }}</div>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.userCenter.role')">
            <NSpace>
              <NTag v-for="role in userInfo.user?.roles" :key="role.roleId" type="primary" size="small">
                {{ role.roleName }}
              </NTag>
            </NSpace>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.userCenter.createTime')">
            <div class="text-14px">{{ userInfo.user?.createTime }}</div>
          </NDescriptionsItem>
        </NDescriptions>
      </div>
    </NCard>

    <!-- 基本资料卡片 -->
    <NCard :title="$t('page.userCenter.personalInfo')" class="w-full overflow-x-auto shadow-sm">
      <NTabs type="line" animated class="h-full" s>
        <NTabPane name="userInfo" :tab="$t('page.userCenter.basicInfo')">
          <NForm
            ref="profileFormRef"
            :model="profileModel"
            :rules="profileRules"
            label-placement="left"
            label-width="100px"
            class="mt-16px max-w-520px"
          >
            <NFormItem :label="$t('page.userCenter.nickname')" path="nickName">
              <NInput v-model:value="profileModel.nickName" :placeholder="$t('page.userCenter.nicknamePlaceholder')" />
            </NFormItem>
            <NFormItem :label="$t('page.userCenter.email')" path="email">
              <NInput v-model:value="profileModel.email" :placeholder="$t('page.userCenter.emailPlaceholder')" />
            </NFormItem>
            <NFormItem :label="$t('page.userCenter.phoneNumber')" path="phonenumber">
              <NInput v-model:value="profileModel.phonenumber" :placeholder="$t('page.userCenter.phonePlaceholder')" />
            </NFormItem>
            <NFormItem :label="$t('page.userCenter.gender')" path="sex">
              <NRadioGroup v-model:value="profileModel.sex">
                <NRadio value="0">{{ $t('page.userCenter.genderMale') }}</NRadio>
                <NRadio value="1">{{ $t('page.userCenter.genderFemale') }}</NRadio>
              </NRadioGroup>
            </NFormItem>
            <NFormItem class="flex items-center justify-end">
              <NButton class="ml-20px w-80px" type="primary" :loading="btnLoading" @click="updateProfile">
                <template #icon>
                  <SvgIcon local-icon="ic-outline-save" class="size-24px" />
                </template>
                {{ $t('page.userCenter.save') }}
              </NButton>
            </NFormItem>
          </NForm>
        </NTabPane>
        <NTabPane name="updatePwd" :tab="$t('page.userCenter.changePassword')">
          <NForm
            ref="passwordFormRef"
            :model="passwordModel"
            :rules="passwordRules"
            label-placement="left"
            label-width="100px"
            class="mt-16px max-w-520px"
          >
            <NFormItem :label="$t('page.userCenter.oldPassword')" path="oldPassword">
              <NInput
                v-model:value="passwordModel.oldPassword"
                type="password"
                :placeholder="$t('page.userCenter.oldPasswordPlaceholder')"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem :label="$t('page.userCenter.newPassword')" path="newPassword">
              <NInput
                v-model:value="passwordModel.newPassword"
                type="password"
                :placeholder="$t('page.userCenter.newPasswordPlaceholder')"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem :label="$t('page.userCenter.confirmPassword')" path="confirmPassword">
              <NInput
                v-model:value="passwordModel.confirmPassword"
                type="password"
                :placeholder="$t('page.userCenter.confirmPasswordPlaceholder')"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem class="flex items-center justify-end">
              <NButton class="ml-20px w-120px" type="primary" :loading="btnLoading" @click="updatePassword">
                <template #icon>
                  <SvgIcon local-icon="ic-outline-key" class="size-24px" />
                </template>
                {{ $t('page.userCenter.changePassword') }}
              </NButton>
            </NFormItem>
          </NForm>
        </NTabPane>
        <NTabPane name="social" :tab="$t('page.userCenter.thirdPartyApp')">
          <SocialCard />
        </NTabPane>
        <NTabPane name="online" :tab="$t('page.userCenter.onlineDevice')">
          <div class="h-full">
            <OnlineTable />
          </div>
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>

<style scoped>
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

:deep(.n-tabs-pane-wrapper),
:deep(.n-tab-pane) {
  height: 100% !important;
}
</style>
