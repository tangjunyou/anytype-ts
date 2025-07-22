# Anytype-TS 上游同步指南

本指南介绍如何自动同步上游 `anyproto/anytype-ts` 项目的更新到你的 fork 仓库。

## 🚀 快速开始

### 1. 手动同步（推荐新手）

```bash
# 基础同步脚本
./sync-upstream.sh

# 高级同步脚本（支持更多功能）
./sync-upstream-advanced.sh
```

### 2. 自动同步（GitHub Actions）

已配置 GitHub Actions 工作流，每天凌晨 2 点自动同步：
- 文件位置：`.github/workflows/sync-upstream.yml`
- 手动触发：GitHub 仓库页面 → Actions → Sync Upstream → Run workflow

## 📋 同步工具对比

| 功能 | sync-upstream.sh | sync-upstream-advanced.sh | GitHub Actions |
|------|------------------|---------------------------|----------------|
| 基础同步 | ✅ | ✅ | ✅ |
| 配置文件支持 | ❌ | ✅ | ❌ |
| 扩展保护 | ❌ | ✅ | ❌ |
| 自动备份 | ✅ | ✅ | ❌ |
| 自动测试 | ❌ | ✅ | ❌ |
| 冲突处理 | 手动 | 智能 | 创建 PR |
| 定时执行 | ❌ | ❌ | ✅ |

## ⚙️ 配置文件说明

配置文件：`.sync-config.json`

```json
{
  "syncConfig": {
    "upstream": {
      "url": "https://github.com/anyproto/anytype-ts.git",
      "branch": "main"
    },
    "schedule": {
      "enabled": true,
      "cron": "0 2 * * *"
    }
  },
  "extensionProtection": {
    "enabled": true,
    "protectedPaths": [
      "src/extensions/",
      "extension/",
      "dist/extension/"
    ]
  }
}
```

### 主要配置项：

- **upstream**: 上游仓库配置
- **extensionProtection**: 扩展文件保护
- **backup**: 自动备份设置
- **testing**: 同步后测试配置
- **notifications**: 通知设置

## 🛠️ 高级同步脚本用法

### 基本用法

```bash
# 标准同步
./sync-upstream-advanced.sh

# 强制同步（忽略未提交更改）
./sync-upstream-advanced.sh --force

# 预览模式（查看将要执行的操作）
./sync-upstream-advanced.sh --dry-run

# 跳过测试
./sync-upstream-advanced.sh --no-test

# 不创建备份
./sync-upstream-advanced.sh --no-backup

# 仅清理旧备份分支
./sync-upstream-advanced.sh --cleanup
```

### 参数说明

| 参数 | 说明 |
|------|------|
| `-h, --help` | 显示帮助信息 |
| `-f, --force` | 强制同步，忽略未提交更改 |
| `-n, --no-backup` | 不创建备份分支 |
| `-t, --no-test` | 跳过同步后测试 |
| `-c, --cleanup` | 仅清理30天前的备份分支 |
| `--dry-run` | 预览模式，不执行实际操作 |

## 🔒 扩展保护机制

为了保护你的自定义扩展不被上游更新覆盖，同步工具提供了以下保护机制：

### 1. 保护路径

默认保护以下目录：
- `src/extensions/` - 扩展源码
- `extension/` - 扩展资源
- `dist/extension/` - 编译后的扩展

### 2. 自定义保护

在 `.sync-config.json` 中添加自定义保护路径：

```json
{
  "extensionProtection": {
    "protectedPaths": [
      "src/extensions/",
      "my-custom-folder/",
      "src/plugins/"
    ],
    "customFiles": [
      "my-config.json",
      "custom-script.sh"
    ]
  }
}
```

### 3. 冲突处理策略

- **自动合并**: 非冲突文件自动合并
- **手动解决**: 冲突文件需要手动处理
- **保护优先**: 保护路径中的文件优先保留本地版本

## 📅 定时同步设置

### GitHub Actions 定时同步

1. **自动执行**: 每天凌晨 2 点
2. **手动触发**: 仓库页面 → Actions → Sync Upstream
3. **冲突处理**: 自动创建 PR 供手动解决

### 本地定时同步（可选）

使用 cron 设置本地定时同步：

```bash
# 编辑 crontab
crontab -e

# 添加定时任务（每天凌晨 3 点）
0 3 * * * cd /path/to/anytype-ts && ./sync-upstream-advanced.sh
```

## 🧪 同步后测试

高级同步脚本支持自动测试：

### 默认测试流程

1. `npm install` - 安装依赖
2. `npm run build` - 构建项目
3. `npm run test:extensions` - 测试扩展（如果存在）

### 自定义测试命令

在 `.sync-config.json` 中配置：

```json
{
  "testing": {
    "runAfterSync": true,
    "commands": [
      "npm install",
      "npm run build",
      "npm run test:extensions",
      "npm run lint"
    ],
    "failOnTestError": false
  }
}
```

## 🔧 故障排除

### 常见问题

#### 1. 合并冲突

```bash
# 查看冲突文件
git status

# 手动解决冲突后
git add .
git commit -m "resolve merge conflicts"
git push origin main
```

#### 2. 推送失败

```bash
# 检查远程仓库权限
git remote -v

# 重新设置远程仓库
git remote set-url origin https://github.com/你的用户名/anytype-ts.git
```

#### 3. 扩展文件丢失

```bash
# 恢复备份分支
git branch  # 查看备份分支
git checkout backup-20240122-143000  # 切换到备份
git checkout main
git merge backup-20240122-143000  # 合并备份
```

### 日志查看

```bash
# 查看同步历史
git log --oneline --grep="sync"

# 查看备份分支
git branch | grep backup

# 查看配置状态
cat .sync-config.json | jq '.lastSync'
```

## 📚 最佳实践

### 1. 同步前准备

- ✅ 提交所有本地更改
- ✅ 备份重要的扩展文件
- ✅ 测试当前功能正常

### 2. 同步频率建议

- **开发期**: 每周同步一次
- **稳定期**: 每月同步一次
- **紧急修复**: 立即同步

### 3. 扩展开发建议

- 📁 将扩展放在 `src/extensions/` 目录
- 🏷️ 使用语义化版本标签
- 📝 维护扩展更新日志
- 🧪 编写扩展测试用例

### 4. 版本管理

```bash
# 创建功能分支
git checkout -b feature/my-extension

# 开发完成后合并
git checkout main
git merge feature/my-extension

# 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## 🆘 获取帮助

如果遇到问题：

1. 查看脚本帮助：`./sync-upstream-advanced.sh --help`
2. 检查配置文件：`.sync-config.json`
3. 查看 GitHub Actions 日志
4. 恢复备份分支

---

**注意**: 首次使用前，请仔细阅读本指南并在测试环境中验证同步流程。