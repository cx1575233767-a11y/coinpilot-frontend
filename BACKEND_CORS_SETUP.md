# 后端 CORS 配置指南

## 重要提示
您的后端服务器部署在 Render 上（https://coinpilot-backend-caw5.onrender.com），需要在**后端代码**中添加CORS配置。

## 需要在后端添加的允许来源（Allowed Origins）

```python
# 如果使用 Flask
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# 配置CORS
CORS(app, origins=[
    "https://coinpisass.replit.dev",
    "https://ea3789ee-36b9-4406-984e-4b4fbc1c5e1b-00-26yae13r8yzec.kirk.replit.dev",
    "http://localhost:5000",
    "https://coinpilot.vercel.app",
    "https://*.replit.dev",  # 允许所有Replit域名
], 
allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
expose_headers=["Content-Length"],
supports_credentials=True)
```

```javascript
// 如果使用 Express.js
const express = require('express');
const cors = require('cors');

const app = express();

const corsOptions = {
  origin: [
    'https://coinpisass.replit.dev',
    'https://ea3789ee-36b9-4406-984e-4b4fbc1c5e1b-00-26yae13r8yzec.kirk.replit.dev',
    'http://localhost:5000',
    'https://coinpilot.vercel.app',
    /\.replit\.dev$/  // 正则匹配所有Replit域名
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

```python
# 如果使用 FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "https://coinpisass.replit.dev",
    "https://ea3789ee-36b9-4406-984e-4b4fbc1c5e1b-00-26yae13r8yzec.kirk.replit.dev",
    "http://localhost:5000",
    "https://coinpilot.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 后端部署步骤

1. 在您的后端项目中添加上述CORS配置
2. 提交并推送代码到GitHub
3. Render会自动检测并重新部署
4. 等待部署完成（通常1-3分钟）

## 测试CORS配置

部署完成后，可以在浏览器控制台测试：

```javascript
fetch('https://coinpilot-backend-caw5.onrender.com/symbols')
  .then(res => res.json())
  .then(data => console.log('成功！', data))
  .catch(err => console.error('错误：', err))
```

如果返回数据而不是CORS错误，说明配置成功！

## 前端已完成的配置

✅ Next.js `allowedDevOrigins` 已配置
✅ API路由CORS headers 已添加
✅ 后端API地址已配置：https://coinpilot-backend-caw5.onrender.com

## 需要您操作

❌ **需要在Render后端项目中添加CORS配置**（见上方代码示例）
