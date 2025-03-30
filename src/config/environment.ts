// 开发环境使用相对路径，让 Vite 代理处理请求
export const API_BASE_URL = 'http://127.0.0.1:3000'
export const GRAPHQL_ENDPOINT = '/graphql'

// 如果需要区分环境，可以这样写：
// export const GRAPHQL_ENDPOINT = import.meta.env.PROD
//   ? 'http://127.0.0.1:3000/graphql'  // 生产环境
//   : '/graphql'  // 开发环境
