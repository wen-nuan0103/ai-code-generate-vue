<script lang="ts" setup>
import { login } from '@/api/userController'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const formState = reactive<API.UserLoginRequest>({
    userAccount: '',
    userPassword: '',
})

const router = useRouter()
const userStore = useUserStore()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
    const res = await login(values)
    // 登录成功，把登录态保存到全局状态中
    if (res.data.code === 0 && res.data.data) {
        await userStore.fetchLoginUser()
        message.success('登录成功')
        router.push({
            path: '/',
            replace: true,
        })
    } else {
        message.error('登录失败，' + res.data.message)
    }
}
</script>

<template>
    <div id="userLoginPage">
        <div class="login-container">
            <div class="login-header">
                <h1 class="title">欢迎回来</h1>
                <p class="subtitle">登录到零代码 AI 应用生成平台</p>
            </div>

            <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit" class="login-form">
                <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
                    <a-input v-model:value="formState.userAccount" placeholder="请输入账号" size="large">
                        <template #prefix>
                            <UserOutlined class="input-icon" />
                        </template>
                    </a-input>
                </a-form-item>

                <a-form-item name="userPassword" :rules="[
                    { required: true, message: '请输入密码' },
                    { min: 8, message: '密码不能小于 8 位' },
                ]">
                    <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" size="large">
                        <template #prefix>
                            <LockOutlined class="input-icon" />
                        </template>
                    </a-input-password>
                </a-form-item>

                <a-form-item>
                    <a-button type="primary" html-type="submit" size="large" class="submit-button">
                        登录
                    </a-button>
                </a-form-item>
            </a-form>

            <div class="footer-links">
                <span class="register-text">还没有账号？</span>
                <RouterLink to="/user/register" class="register-link">立即注册</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
#userLoginPage {
    flex: 1;
    min-height: 100%;
    /* height: 100%; */
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    box-sizing: border-box;
}

.login-container {
    width: 100%;
    max-width: 520px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    padding: 48px 40px;
    animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.login-header {
    text-align: center;
    margin-bottom: 40px;
}

.title {
    font-size: 32px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 12px;
    letter-spacing: -0.5px;
}

.subtitle {
    font-size: 15px;
    color: #666;
    margin: 0;
    font-weight: 400;
}

.login-form {
    margin-top: 32px;
}

.login-form :deep(.ant-input-affix-wrapper),
.login-form :deep(.ant-input) {
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 15px;
    border: 1.5px solid #e0e0e0;
    transition: all 0.3s ease;
}

.login-form :deep(.ant-input-affix-wrapper:hover),
.login-form :deep(.ant-input:hover) {
    border-color: #667eea;
}

.login-form :deep(.ant-input-affix-wrapper-focused),
.login-form :deep(.ant-input:focus) {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.login-form :deep(.ant-form-item) {
    margin-bottom: 24px;
}

.input-icon {
    color: #999;
    font-size: 16px;
}

.submit-button {
    width: 100%;
    height: 48px;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
    margin-top: 8px;
}

.submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.footer-links {
    text-align: center;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
}

.register-text {
    color: #666;
    font-size: 14px;
    margin-right: 8px;
}

.register-link {
    color: #667eea;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
}

.register-link:hover {
    color: #764ba2;
    text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 576px) {
    #userLoginPage {
        padding: 16px;
    }

    .login-container {
        padding: 36px 28px;
        border-radius: 12px;
    }

    .title {
        font-size: 28px;
    }

    .subtitle {
        font-size: 14px;
    }

    .login-form :deep(.ant-input-affix-wrapper),
    .login-form :deep(.ant-input) {
        padding: 10px 14px;
        font-size: 14px;
    }

    .submit-button {
        height: 44px;
        font-size: 15px;
    }
}

@media (max-width: 400px) {
    #userLoginPage {
        padding: 12px;
    }

    .login-container {
        padding: 28px 20px;
    }

    .title {
        font-size: 24px;
    }
}
</style>
