# Trae MCP 安装与配置（本地 Supabase）

## 目标
- 在 Trae 中配置 MCP，使其能够访问本地 Supabase 数据库或 Supabase MCP 端点。

## 前置条件
- Windows，Trae 已安装。
- 本地 Supabase 已启动（CLI 或 Docker Compose）。
- 不要在仓库中保存任何密码或密钥。

## 方案 A：直接连接数据库（推荐）
- 适用：查询/管理数据库，无需项目级工具（迁移、日志等）。
- 优点：简单稳定，Trae 原生支持。

### 步骤
1. 获取数据库连接：
   - 运行 `supabase status`，使用输出中的主机端口与密码；或在 Supabase 项目 `.env` 中查找 `POSTGRES_PASSWORD` 与主机端口（请使用可从宿主机访问的端口）。
2. 打开 Trae 配置文件：
   - `C:\Users\<你的用户名>\AppData\Roaming\Trae\User\mcp.json`
3. 在 `mcpServers` 中添加如下片段（替换占位符）：
```
"Supabase Local DB": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-postgres",
    "postgresql://postgres:<POSTGRES_PASSWORD>@localhost:<DB_HOST_PORT>/postgres"
  ]
}
```
4. 重启 Trae。
5. 验证：在 Trae 的 MCP 工具中执行 `SELECT 1;` 或列出 `public` 表。

## 方案 B：连接 Supabase MCP 端点（项目级工具）
- 适用：需要项目级工具（管理表、生成迁移、查看日志、获取配置等）。

### CLI 本地 Supabase
- MCP 端点通常为 `http://localhost:54321/mcp`。
- 在 `mcp.json` 中添加：
```
"Supabase MCP (Local)": {
  "command": "npx",
  "args": [
    "-y",
    "mcp-remote@latest",
    "http://localhost:54321/mcp",
    "--transport",
    "sse",
    "--allow-http"
  ]
}
```
- 验证：`Invoke-WebRequest http://localhost:54321/mcp` 返回 200；重启 Trae 后在 MCP 列表可见 Supabase 工具。

### Docker Compose 自托管（Kong）
- MCP 位于内部 API 后，默认不对外。
- 允许宿主机访问：将 Docker bridge 网关 IP（例 `172.18.0.1`）加入 `./volumes/api/kong.yml` 的 allowlist，重启服务。
- 端点示例：`http://localhost:18000/mcp`
- 在 `mcp.json` 中添加：
```
"Supabase MCP (Self-hosted)": {
  "command": "npx",
  "args": [
    "-y",
    "mcp-remote@latest",
    "http://localhost:18000/mcp",
    "--transport",
    "sse",
    "--allow-http"
  ]
}
```

## 常见问题与排查
- 端口不可达：用 `Test-NetConnection -ComputerName localhost -Port <端口>` 检查；若失败，请用 `supabase status` 的主机端口更新连接串或修正端口映射。
- MCP 包行为：`@modelcontextprotocol/server-postgres` 与 `mcp-remote` 需要传入 URL；不支持 `--help`，出现 `Invalid URL` 属于预期。
- 安全：不要连接生产数据；不要将密码写入仓库。

## 验证清单
- `mcp.json` 中出现新增服务器项。
- Trae 重启后能在 MCP 列表看到对应项。
- 执行简单查询返回结果（例如 `SELECT 1;`）。

