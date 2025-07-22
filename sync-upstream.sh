#!/bin/bash

# anytype-ts 上游同步脚本
# 用于同步 anyproto/anytype-ts 的最新更新到你的 fork 仓库

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否在 git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "当前目录不是 Git 仓库"
    exit 1
fi

# 检查是否有未提交的更改
if ! git diff-index --quiet HEAD --; then
    print_warning "检测到未提交的更改，请先提交或暂存"
    echo "未提交的文件:"
    git status --porcelain
    read -p "是否继续？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "同步已取消"
        exit 0
    fi
fi

print_info "开始同步上游 anytype-ts 项目..."

# 添加上游远程仓库（如果不存在）
if ! git remote get-url upstream > /dev/null 2>&1; then
    print_info "添加上游远程仓库..."
    git remote add upstream https://github.com/anyproto/anytype-ts.git
else
    print_info "上游远程仓库已存在"
fi

# 获取上游更新
print_info "获取上游更新..."
git fetch upstream

# 切换到主分支
print_info "切换到主分支..."
git checkout main

# 检查是否有本地提交领先于上游
LOCAL_COMMITS=$(git rev-list --count upstream/main..main)
if [ "$LOCAL_COMMITS" -gt 0 ]; then
    print_warning "检测到 $LOCAL_COMMITS 个本地提交领先于上游"
    print_info "建议创建备份分支..."
    BACKUP_BRANCH="backup-$(date +%Y%m%d-%H%M%S)"
    git branch "$BACKUP_BRANCH"
    print_success "已创建备份分支: $BACKUP_BRANCH"
fi

# 尝试合并上游更新
print_info "合并上游更新..."
if git merge upstream/main --no-edit; then
    print_success "成功合并上游更新"
    
    # 推送到远程仓库
    print_info "推送更新到远程仓库..."
    if git push origin main; then
        print_success "同步完成！"
    else
        print_error "推送失败，请检查网络连接和权限"
        exit 1
    fi
else
    print_error "合并冲突！需要手动解决"
    print_info "冲突文件:"
    git status --porcelain | grep "^UU"
    print_info "请手动解决冲突后运行:"
    echo "  git add ."
    echo "  git commit -m 'resolve merge conflicts'"
    echo "  git push origin main"
    exit 1
fi

# 检查扩展目录是否存在
if [ -d "src/extensions" ]; then
    print_info "检测到扩展目录，请确保扩展功能正常"
fi

print_success "上游同步完成！"
print_info "建议运行测试确保功能正常:"
echo "  npm install"
echo "  npm run build"
echo "  npm test"