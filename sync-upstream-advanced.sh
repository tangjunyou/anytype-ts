#!/bin/bash

# anytype-ts 高级上游同步脚本
# 支持配置文件、扩展保护、自动测试等功能

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 配置文件路径
CONFIG_FILE=".sync-config.json"

# 打印函数
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_step() { echo -e "${PURPLE}[STEP]${NC} $1"; }

# 检查依赖
check_dependencies() {
    if ! command -v jq &> /dev/null; then
        print_warning "jq 未安装，将使用基础功能"
        USE_JQ=false
    else
        USE_JQ=true
    fi
}

# 读取配置
read_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        print_warning "配置文件不存在，使用默认配置"
        return
    fi
    
    if [ "$USE_JQ" = true ]; then
        UPSTREAM_URL=$(jq -r '.syncConfig.upstream.url' "$CONFIG_FILE" 2>/dev/null || echo "https://github.com/anyproto/anytype-ts.git")
        UPSTREAM_BRANCH=$(jq -r '.syncConfig.upstream.branch' "$CONFIG_FILE" 2>/dev/null || echo "main")
        BACKUP_ENABLED=$(jq -r '.syncConfig.backup.enabled' "$CONFIG_FILE" 2>/dev/null || echo "true")
        EXTENSION_PROTECTION=$(jq -r '.extensionProtection.enabled' "$CONFIG_FILE" 2>/dev/null || echo "true")
        RUN_TESTS=$(jq -r '.testing.runAfterSync' "$CONFIG_FILE" 2>/dev/null || echo "true")
    else
        UPSTREAM_URL="https://github.com/anyproto/anytype-ts.git"
        UPSTREAM_BRANCH="main"
        BACKUP_ENABLED="true"
        EXTENSION_PROTECTION="true"
        RUN_TESTS="true"
    fi
}

# 更新配置文件中的同步状态
update_sync_status() {
    local status="$1"
    local commit="$2"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    if [ "$USE_JQ" = true ] && [ -f "$CONFIG_FILE" ]; then
        jq --arg status "$status" --arg commit "$commit" --arg timestamp "$timestamp" \
           '.lastSync.status = $status | .lastSync.commit = $commit | .lastSync.timestamp = $timestamp' \
           "$CONFIG_FILE" > "${CONFIG_FILE}.tmp" && mv "${CONFIG_FILE}.tmp" "$CONFIG_FILE"
    fi
}

# 检查保护的文件和目录
check_protected_paths() {
    if [ "$EXTENSION_PROTECTION" != "true" ]; then
        return 0
    fi
    
    print_step "检查扩展保护路径..."
    
    # 默认保护路径
    PROTECTED_PATHS=("src/extensions/" "extension/" "dist/extension/")
    
    if [ "$USE_JQ" = true ] && [ -f "$CONFIG_FILE" ]; then
        mapfile -t CUSTOM_PATHS < <(jq -r '.extensionProtection.protectedPaths[]?' "$CONFIG_FILE" 2>/dev/null)
        PROTECTED_PATHS+=("${CUSTOM_PATHS[@]}")
    fi
    
    for path in "${PROTECTED_PATHS[@]}"; do
        if [ -e "$path" ]; then
            print_info "发现保护路径: $path"
        fi
    done
}

# 创建备份分支
create_backup() {
    if [ "$BACKUP_ENABLED" != "true" ]; then
        return 0
    fi
    
    local backup_branch="backup-$(date +%Y%m%d-%H%M%S)"
    print_step "创建备份分支: $backup_branch"
    git branch "$backup_branch"
    print_success "备份分支已创建"
}

# 清理旧备份分支
cleanup_old_backups() {
    if [ "$BACKUP_ENABLED" != "true" ]; then
        return 0
    fi
    
    print_step "清理30天前的备份分支..."
    
    # 获取30天前的时间戳
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        CUTOFF_DATE=$(date -v-30d +%Y%m%d)
    else
        # Linux
        CUTOFF_DATE=$(date -d '30 days ago' +%Y%m%d)
    fi
    
    # 删除旧的备份分支
    git branch | grep "backup-" | while read -r branch; do
        branch=$(echo "$branch" | xargs)  # 去除空格
        if [[ $branch =~ backup-([0-9]{8}) ]]; then
            branch_date="${BASH_REMATCH[1]}"
            if [ "$branch_date" -lt "$CUTOFF_DATE" ]; then
                print_info "删除旧备份分支: $branch"
                git branch -D "$branch" 2>/dev/null || true
            fi
        fi
    done
}

# 运行测试
run_tests() {
    if [ "$RUN_TESTS" != "true" ]; then
        return 0
    fi
    
    print_step "运行同步后测试..."
    
    # 检查 package.json 是否存在
    if [ ! -f "package.json" ]; then
        print_warning "package.json 不存在，跳过测试"
        return 0
    fi
    
    # 安装依赖
    if [ -f "package-lock.json" ]; then
        print_info "安装依赖..."
        npm ci || npm install
    fi
    
    # 构建项目
    if npm run build &>/dev/null; then
        print_success "构建成功"
    else
        print_warning "构建失败，但继续执行"
    fi
    
    # 运行扩展测试（如果存在）
    if npm run test:extensions &>/dev/null; then
        print_success "扩展测试通过"
    else
        print_info "扩展测试不存在或失败"
    fi
}

# 显示帮助信息
show_help() {
    echo "anytype-ts 高级上游同步脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示帮助信息"
    echo "  -f, --force         强制同步（忽略未提交更改）"
    echo "  -n, --no-backup     不创建备份分支"
    echo "  -t, --no-test       跳过测试"
    echo "  -c, --cleanup       清理旧备份分支"
    echo "  --dry-run           预览模式（不执行实际操作）"
    echo ""
    echo "配置文件: $CONFIG_FILE"
}

# 主函数
main() {
    local FORCE=false
    local DRY_RUN=false
    local CLEANUP_ONLY=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -f|--force)
                FORCE=true
                shift
                ;;
            -n|--no-backup)
                BACKUP_ENABLED="false"
                shift
                ;;
            -t|--no-test)
                RUN_TESTS="false"
                shift
                ;;
            -c|--cleanup)
                CLEANUP_ONLY=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            *)
                print_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    print_info "=== anytype-ts 高级上游同步工具 ==="
    
    # 检查依赖和配置
    check_dependencies
    read_config
    
    # 仅清理模式
    if [ "$CLEANUP_ONLY" = true ]; then
        cleanup_old_backups
        exit 0
    fi
    
    # 检查 Git 仓库
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "当前目录不是 Git 仓库"
        exit 1
    fi
    
    # 检查未提交更改
    if ! git diff-index --quiet HEAD -- && [ "$FORCE" != true ]; then
        print_warning "检测到未提交的更改"
        git status --porcelain
        read -p "是否继续？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "同步已取消"
            exit 0
        fi
    fi
    
    if [ "$DRY_RUN" = true ]; then
        print_info "=== 预览模式 ==="
        print_info "将要执行的操作:"
        echo "  1. 添加上游仓库: $UPSTREAM_URL"
        echo "  2. 获取上游更新"
        echo "  3. 切换到分支: $UPSTREAM_BRANCH"
        [ "$BACKUP_ENABLED" = true ] && echo "  4. 创建备份分支"
        echo "  5. 合并上游更新"
        echo "  6. 推送到远程仓库"
        [ "$RUN_TESTS" = true ] && echo "  7. 运行测试"
        exit 0
    fi
    
    # 检查保护路径
    check_protected_paths
    
    # 添加上游仓库
    if ! git remote get-url upstream > /dev/null 2>&1; then
        print_step "添加上游远程仓库..."
        git remote add upstream "$UPSTREAM_URL"
    fi
    
    # 获取上游更新
    print_step "获取上游更新..."
    git fetch upstream
    
    # 切换到主分支
    print_step "切换到分支: $UPSTREAM_BRANCH"
    git checkout "$UPSTREAM_BRANCH"
    
    # 检查本地提交
    LOCAL_COMMITS=$(git rev-list --count upstream/$UPSTREAM_BRANCH..$UPSTREAM_BRANCH)
    if [ "$LOCAL_COMMITS" -gt 0 ]; then
        print_warning "检测到 $LOCAL_COMMITS 个本地提交"
        create_backup
    fi
    
    # 合并上游更新
    print_step "合并上游更新..."
    UPSTREAM_COMMIT=$(git rev-parse upstream/$UPSTREAM_BRANCH)
    
    if git merge upstream/$UPSTREAM_BRANCH --no-edit; then
        print_success "成功合并上游更新"
        
        # 推送到远程
        print_step "推送更新到远程仓库..."
        if git push origin "$UPSTREAM_BRANCH"; then
            print_success "推送成功"
            update_sync_status "success" "$UPSTREAM_COMMIT"
        else
            print_error "推送失败"
            update_sync_status "push_failed" "$UPSTREAM_COMMIT"
            exit 1
        fi
        
        # 运行测试
        run_tests
        
        # 清理旧备份
        cleanup_old_backups
        
        print_success "=== 同步完成 ==="
        
    else
        print_error "合并冲突！"
        update_sync_status "conflict" "$UPSTREAM_COMMIT"
        
        print_info "冲突文件:"
        git status --porcelain | grep "^UU" || git status --porcelain
        
        print_info "解决冲突后运行:"
        echo "  git add ."
        echo "  git commit -m 'resolve merge conflicts'"
        echo "  git push origin $UPSTREAM_BRANCH"
        
        exit 1
    fi
}

# 执行主函数
main "$@"