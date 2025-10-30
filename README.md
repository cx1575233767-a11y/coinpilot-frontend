# CoinPilot Dashboard

AI驱动的加密货币交易信号平台 - 获取实时AI预测信号，优化您的交易策略。

## 功能特性

- **AI信号预测**: 基于机器学习的交易信号分析，提供入场、止损、止盈建议
- **实时K线图表**: 使用 lightweight-charts 展示实时市场数据
- **多语言支持**: 支持简体中文、繁体中文和英语
- **深色/浅色主题**: 完整的主题切换支持
- **用户认证**: Supabase Auth 支持邮箱和 Google OAuth 登录
- **订阅管理**: Stripe 集成的 Pro 会员订阅系统
- **推荐系统**: 内置推荐码系统，追踪用户推荐
- **调度控制**: Pro 用户可控制自动信号生成和 Telegram 通知

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS v4 + shadcn/ui
- **认证**: Supabase Auth
- **数据库**: Supabase (PostgreSQL)
- **支付**: Stripe
- **图表**: lightweight-charts
- **国际化**: next-intl
- **数据获取**: SWR
- **图标**: lucide-react

## 环境变量

在部署前，您需要配置以下环境变量：

### 必需的环境变量

\`\`\`bash
# Supabase (已在 v0 中配置)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 后端 API
NEXT_PUBLIC_API_BASE=https://coinpilot-backend-caw5.onrender.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 可选：开发环境 Supabase 重定向
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/app
\`\`\`

## 数据库设置

### 1. 运行 SQL 脚本

在 v0 中，您可以直接运行 `scripts` 文件夹中的 SQL 脚本：

1. **01-create-profiles-table.sql**: 创建 profiles 表和 referrals 表
2. **02-create-profile-trigger.sql**: 创建自动生成推荐码的触发器
3. **03-create-updated-at-trigger.sql**: 创建自动更新时间戳的触发器

这些脚本会自动：
- 创建 `profiles` 表存储用户信息、会员状态和推荐码
- 创建 `referrals` 表追踪推荐关系
- 设置 Row Level Security (RLS) 策略
- 创建触发器自动生成推荐码和更新时间戳

### 2. 数据库表结构

#### profiles 表
\`\`\`sql
- id: UUID (主键，关联 auth.users)
- email: TEXT
- plan: TEXT (free/pro)
- referral_code: TEXT (唯一)
- referred_by: TEXT
- pro_until: TIMESTAMPTZ
- stripe_customer_id: TEXT
- stripe_subscription_id: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
\`\`\`

#### referrals 表
\`\`\`sql
- id: UUID (主键)
- referrer_id: UUID (推荐人)
- referred_id: UUID (被推荐人)
- created_at: TIMESTAMPTZ
\`\`\`

## Stripe 配置

### 1. 创建产品和价格

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com)
2. 进入 **Products** → **Add Product**
3. 创建 "CoinPilot Pro" 产品
4. 添加月度订阅价格（例如 ¥99/月）
5. 复制价格 ID (price_...) 到环境变量 `STRIPE_PRICE_ID_MONTHLY`

### 2. 配置 Webhook

1. 进入 **Developers** → **Webhooks** → **Add endpoint**
2. 端点 URL: `https://your-domain.com/api/stripe/webhook`
3. 选择以下事件：
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. 复制 Webhook 签名密钥到环境变量 `STRIPE_WEBHOOK_SECRET`

### 3. 启用客户门户

1. 进入 **Settings** → **Billing** → **Customer portal**
2. 启用客户门户
3. 配置允许客户取消订阅和更新付款方式

## 本地开发

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 配置环境变量

创建 `.env.local` 文件并添加所有必需的环境变量。

### 3. 运行开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署到 Vercel

### 方法 1: 通过 v0 部署

1. 在 v0 中点击 "Publish" 按钮
2. 选择或创建 Vercel 项目
3. 在 Vercel 项目设置中添加环境变量
4. 部署完成

### 方法 2: 通过 GitHub

1. 在 v0 中点击 GitHub 图标推送代码
2. 在 Vercel 中导入 GitHub 仓库
3. 配置环境变量
4. 部署

### 部署后配置

1. **更新 Stripe Webhook URL**: 将 webhook 端点更新为生产域名
2. **配置 Supabase 重定向 URL**: 在 Supabase 项目设置中添加生产域名
3. **测试支付流程**: 使用 Stripe 测试卡测试完整的支付流程

## 后端 API 端点

应用连接到以下后端 API 端点（通过 `NEXT_PUBLIC_API_BASE` 配置）：

- `GET /symbols` - 获取支持的币种列表
- `GET /signals/ai?symbol=XXX&interval=1h` - 获取单个币种的 AI 信号
- `GET /signals/ai/batch?interval=1h&save=false` - 批量获取 AI 信号
- `POST /scheduler/start?interval=1h&every_minutes=5` - 启动调度器
- `POST /scheduler/stop` - 停止调度器
- `POST /notify/telegram_test` - 发送 Telegram 测试消息
- `GET /klines?symbol=BTCUSDT&interval=1h&limit=300` - 获取 K 线数据

**注意**: 调度和通知端点必须使用 POST 方法。

## 项目结构

\`\`\`
coinpilot-dashboard/
├── app/                      # Next.js App Router
│   ├── api/                  # API 路由
│   │   └── stripe/          # Stripe 集成
│   ├── app/                  # 受保护的应用页面
│   │   ├── account/         # 账户管理
│   │   ├── kline/           # K 线图表
│   │   ├── referrals/       # 推荐中心
│   │   ├── settings/        # 设置
│   │   └── signals/         # 交易信号
│   ├── pricing/             # 价格页面
│   ├── signin/              # 登录页面
│   └── page.tsx             # 落地页
├── components/              # React 组件
│   ├── dashboard/           # 仪表盘组件
│   ├── kline/               # K 线图表组件
│   ├── providers/           # Context Providers
│   ├── signals/             # 信号组件
│   └── ui/                  # shadcn/ui 组件
├── lib/                     # 工具函数
│   ├── api/                 # API 客户端
│   ├── supabase/            # Supabase 客户端
│   └── utils/               # 通用工具
├── messages/                # 国际化翻译文件
├── scripts/                 # SQL 脚本
├── actions/                 # Server Actions
└── middleware.ts            # Next.js 中间件
\`\`\`

## 功能说明

### 认证流程

1. 用户通过邮箱或 Google 登录
2. 注册时自动创建 profile 记录和推荐码
3. 如果 URL 包含推荐码 (`?ref=XXX`)，自动关联推荐关系
4. 中间件保护 `/app/*` 路由，未登录用户重定向到登录页

### 会员系统

- **Free 版本**: 基础功能，查看信号和 K 线图
- **Pro 版本**: 
  - 无限信号访问
  - 调度控制功能
  - Telegram 通知
  - 完整历史数据
  - 优先支持

### 推荐系统

1. 每个用户注册时自动生成唯一推荐码
2. 用户可分享推荐链接 (`/signin?ref=CODE`)
3. 新用户通过推荐链接注册时自动关联
4. 推荐统计在推荐中心显示

## 常见问题

### 1. Supabase 认证重定向问题

确保在 Supabase 项目设置中添加了正确的重定向 URL：
- 开发环境: `http://localhost:3000/app`
- 生产环境: `https://your-domain.com/app`

### 2. Stripe Webhook 未触发

检查：
- Webhook URL 是否正确
- Webhook 签名密钥是否正确
- 选择的事件类型是否正确

### 3. K 线图不显示

确保：
- `NEXT_PUBLIC_API_BASE` 环境变量正确配置
- 后端 API 可访问
- 币种和时间间隔参数正确

## 支持

如需帮助，请：
1. 检查本 README 文档
2. 查看 [Next.js 文档](https://nextjs.org/docs)
3. 查看 [Supabase 文档](https://supabase.com/docs)
4. 查看 [Stripe 文档](https://stripe.com/docs)

## 许可证

MIT License
