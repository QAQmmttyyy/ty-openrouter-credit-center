# OpenRouter Credit Center

简洁高效的本地 AI 客户端额度管理中心，旨在帮助用户自动化管理 OpenRouter API Key 及其使用额度。

## 核心功能

- 🔐 **身份验证**：集成 NextAuth + Resend，支持魔术链接（Magic Link）无密码安全登录。
- 💳 **充值系统**：集成 Stripe Checkout，支持自定义金额快速充值。
- 🔑 **API Key 自动化**：
  - **首次充值自动生成**：用户完成首笔支付后，系统自动创建 OpenRouter API Key。
  - **额度无缝累加**：后续充值自动更新现有 Key 的 `limit`，用户无需更换 Key。
- 📊 **实时看板**：基于 SWR 的 Dashboard，余额、Key 状态及交易记录自动感知刷新。
- 🛡️ **健壮后端**：具备 Webhook 幂等性检查与数据库唯一约束，确保交易数据精准。

## 快速开始

1. **配置环境**：
   复制 `.env.example` 为 `.env.local`，并填写以下信息：
   - OpenRouter Management Key
   - Stripe API Keys & Webhook Secret
   - Resend SMTP 配置
   - NextAuth Secret

2. **初始化数据库**：

   ```bash
   npm run db:push
   ```

3. **启动项目**：

   ```bash
   npm run dev
   ```

## 技术栈

- **框架**: Next.js 14 (App Router)
- **数据库**: Drizzle ORM + LibSQL / SQLite
- **支付**: Stripe
- **AI 接口**: OpenRouter API
- **状态同步**: SWR
- **样式**: TailwindCSS + Lucide Icons
