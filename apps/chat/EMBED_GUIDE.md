# Chat 应用嵌入使用指南

## 开发环境测试

### 方式 1：直接访问（推荐用于测试）
```
http://localhost:9528/?appToken=你的token&appId=你的应用ID
```

### 方式 2：iframe 嵌入
```html
<iframe 
  src="http://localhost:9528/?appToken=你的token&appId=你的应用ID&primaryColor=%2318a058&theme=light" 
  width="100%" 
  height="600px"
  frameborder="0"
  allow="clipboard-write"
></iframe>
```

### 方式 3：使用 embed.html（与主页面相同）
```
http://localhost:9528/embed.html?appToken=你的token&appId=你的应用ID
```

---

## URL 参数说明

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `appToken` | ✅ | 应用访问令牌 | `abc123...` |
| `appId` | ✅ | 应用 ID | `1` |
| `primaryColor` | ❌ | 主题色（需 URL 编码） | `%2318a058` (即 `#18a058`) |
| `theme` | ❌ | 主题模式 | `light` 或 `dark` |

---

## 生产环境部署

### 1. 构建
```bash
pnpm build:chat
```

### 2. 部署
将 `apps/chat/dist` 目录部署到 Web 服务器（如 Nginx）

### 3. 配置 Nginx
```nginx
server {
    listen 80;
    server_name chat.kmatrix.cn;
    
    root /var/www/chat;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /dev-api/ {
        proxy_pass http://backend:8090/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. 更新 Admin 后台嵌入代码生成逻辑

将生成的嵌入 URL 从：
```
/embed.html?appToken=xxx&appId=xxx
```

改为：
```
https://chat.kmatrix.cn/?appToken=xxx&appId=xxx
```

---

## 注意事项

1. **CORS 配置**：如果 Chat 应用和 Admin 不在同一域名，需要配置后端 CORS
2. **Token 安全**：`appToken` 应该是临时的、有时效性的令牌
3. **iframe 沙箱**：建议添加 `sandbox` 属性以增强安全性（根据需求调整）
