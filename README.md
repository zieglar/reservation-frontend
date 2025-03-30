# 餐厅预订系统

## 部署说明

### 环境要求

- Node.js >= 22.14.0
- npm >= 10.9.0

### 开发环境部署

1. 克隆项目

```bash
git clone https://github.com/zieglar/reservation-frontend frontend
cd frontend
```

2. 安装依赖

```bash
pnpm install
```

3. 配置后端路径变量
   修改 `src/config/environment.ts` 文件以下变量：

```env
API_BASE_URL=http://127.0.0.1:3000
```

4. 启动开发服务器

```bash
pnpm dev
```

### 生产环境部署

1. 构建项目

```bash
pnpm build
```

2. 预览构建结果

```bash
pnpm preview
```

3. 部署构建文件
   将 `dist` 目录下的文件部署到 Web 服务器

### 代理配置

项目使用 Vite 代理处理跨域请求，确保以下接口可用：

- `/graphql` - GraphQL API
- `/auth` - 认证相关接口

### 注意事项

1. 确保后端服务已启动并可访问
2. 生产环境部署时需要配置正确的 API 地址
3. 建议使用 HTTPS 协议
4. 确保服务器支持 SPA 路由

### 常见问题

1. 如果遇到跨域问题，检查代理配置
2. 如果登录失败，检查 API 地址配置
3. 如果构建失败，检查 Node.js 版本

## 脚本

- `pnpm dev` - start a development server with hot reload.
- `pnpm build` - build for production. The generated files will be on the `dist` folder.
- `pnpm preview` - locally preview the production build.
- `pnpm test` - run unit and integration tests related to changed files based on git.
- `pnpm test:ci` - run all unit and integration tests in CI mode.
- `pnpm test:e2e` - run all e2e tests with the Cypress Test Runner.
- `pnpm test:e2e:headless` - run all e2e tests headlessly.
- `pnpm format` - format all files with Prettier.
- `pnpm lint` - runs TypeScript, ESLint and Stylelint.
- `pnpm validate` - runs `lint`, `test:ci` and `test:e2e:ci`.

## 技术选型

1. **前端框架：React + TypeScript**

   - 选择原因：
     - React 提供了组件化开发，提高代码复用性和可维护性
     - TypeScript 提供类型安全，减少运行时错误
     - 良好的开发体验和丰富的生态系统

2. **状态管理：React Query**

   - 选择原因：
     - 专门用于处理服务器状态
     - 提供自动缓存和重新验证
     - 简化了数据获取和缓存逻辑
     - 内置的加载和错误状态处理

3. **路由：React Router**

   - 选择原因：
     - 提供声明式路由
     - 支持动态路由和嵌套路由
     - 与 React 生态系统完美集成
     - 支持路由守卫和权限控制

4. **样式：Tailwind CSS**

   - 选择原因：
     - 原子化 CSS，提高开发效率
     - 无需编写自定义 CSS
     - 响应式设计支持
     - 高度可定制
     - 减少 CSS 文件体积

5. **构建工具：Vite**

   - 选择原因：
     - 快速的开发服务器启动
     - 即时的热模块替换（HMR）
     - 优化的构建性能
     - 对 TypeScript 的原生支持
     - 配置简单直观

6. **API 调用：GraphQL**

   - 选择原因：
     - 精确的数据获取，减少网络请求
     - 类型安全的数据结构
     - 支持复杂的数据查询
     - 减少前后端沟通成本

7. **开发工具和规范：**

   - ESLint：代码质量检查
   - Prettier：代码格式化
   - TypeScript：类型检查
   - 选择原因：
     - 保证代码质量和一致性
     - 提高团队协作效率
     - 减少潜在错误

8. **测试框架：Vitest**

   - 选择原因：
     - 与 Vite 完美集成
     - 快速的测试执行
     - 支持 TypeScript
     - 现代化的测试 API

9. **代理配置：Vite 代理**
   - 选择原因：
     - 解决开发环境跨域问题
     - 简化 API 调用配置
     - 无需修改后端 CORS 设置

这个技术栈的选择主要考虑了：

1. 开发效率
2. 代码质量
3. 用户体验
4. 可维护性
5. 性能优化
6. 团队协作

整体架构采用了现代化的前端开发最佳实践，确保了项目的可扩展性和可维护性。
