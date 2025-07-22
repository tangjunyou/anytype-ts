#!/bin/bash

# anytype-ts 同步环境设置脚本
# 一键配置 Git 认证和同步环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 打印函数
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_step() { echo -e "${PURPLE}[STEP]${NC} $1"; }

# 检查 Git 配置
check_git_config() {
    print_step "检查 Git 配置..."
    
    if ! git config user.name >/dev/null 2>&1; then
        print_warning "Git 用户名未配置"
        read -p "请输入你的 Git 用户名: " git_username
        git config --global user.name "$git_username"
        print_success "Git 用户名已设置: $git_username"
    else
        print_info "Git 用户名: $(git config user.name)"
    fi
    
    if ! git config user.email >/dev/null 2>&1; then
        print_warning "Git 邮箱未配置"
        read -p "请输入你的 Git 邮箱: " git_email
        git config --global user.email "$git_email"
        print_success "Git 邮箱已设置: $git_email"
    else
        print_info "Git 邮箱: $(git config user.email)"
    fi
}

# 检查 GitHub 认证
check_github_auth() {
    print_step "检查 GitHub 认证..."
    
    # 检查是否能访问 GitHub
    if git ls-remote origin >/dev/null 2>&1; then
        print_success "GitHub 认证正常"
        return 0
    fi
    
    print_warning "GitHub 认证失败，需要配置认证"
    
    echo "请选择认证方式:"
    echo "1) SSH 密钥 (推荐)"
    echo "2) Personal Access Token"
    echo "3) 跳过认证配置"
    
    read -p "请选择 (1-3): " auth_choice
    
    case $auth_choice in
        1)
            setup_ssh_auth
            ;;
        2)
            setup_token_auth
            ;;
        3)
            print_info "跳过认证配置"
            ;;
        *)
            print_error "无效选择"
            ;;
    esac
}

# 设置 SSH 认证
setup_ssh_auth() {
    print_step "配置 SSH 认证..."
    
    # 检查是否已有 SSH 密钥
    if [ -f ~/.ssh/id_rsa.pub ] || [ -f ~/.ssh/id_ed25519.pub ]; then
        print_info "发现现有 SSH 密钥"
        
        if [ -f ~/.ssh/id_ed25519.pub ]; then
            SSH_KEY_FILE=~/.ssh/id_ed25519.pub
        else
            SSH_KEY_FILE=~/.ssh/id_rsa.pub
        fi
        
        print_info "公钥内容:"
        cat "$SSH_KEY_FILE"
        
        echo ""
        print_info "请将上述公钥添加到 GitHub:"
        echo "1. 访问 https://github.com/settings/keys"
        echo "2. 点击 'New SSH key'"
        echo "3. 粘贴上述公钥内容"
        echo "4. 保存"
        
    else
        print_info "生成新的 SSH 密钥..."
        
        read -p "请输入你的 GitHub 邮箱: " github_email
        ssh-keygen -t ed25519 -C "$github_email" -f ~/.ssh/id_ed25519 -N ""
        
        print_success "SSH 密钥已生成"
        print_info "公钥内容:"
        cat ~/.ssh/id_ed25519.pub
        
        echo ""
        print_info "请将上述公钥添加到 GitHub:"
        echo "1. 访问 https://github.com/settings/keys"
        echo "2. 点击 'New SSH key'"
        echo "3. 粘贴上述公钥内容"
        echo "4. 保存"
    fi
    
    # 更新远程仓库 URL 为 SSH
    CURRENT_URL=$(git remote get-url origin)
    if [[ $CURRENT_URL == https://github.com/* ]]; then
        SSH_URL=$(echo "$CURRENT_URL" | sed 's|https://github.com/|git@github.com:|')
        git remote set-url origin "$SSH_URL"
        print_success "已更新远程仓库 URL 为 SSH: $SSH_URL"
    fi
    
    read -p "按回车键继续测试 SSH 连接..."
    
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        print_success "SSH 认证成功"
    else
        print_warning "SSH 认证测试失败，请检查密钥配置"
    fi
}

# 设置 Token 认证
setup_token_auth() {
    print_step "配置 Personal Access Token..."
    
    print_info "请按以下步骤创建 Personal Access Token:"
    echo "1. 访问 https://github.com/settings/tokens"
    echo "2. 点击 'Generate new token (classic)'"
    echo "3. 设置过期时间和权限 (至少需要 'repo' 权限)"
    echo "4. 生成并复制 token"
    echo ""
    
    read -p "请输入你的 Personal Access Token: " -s github_token
    echo
    
    if [ -z "$github_token" ]; then
        print_error "Token 不能为空"
        return 1
    fi
    
    # 更新远程仓库 URL 包含 token
    CURRENT_URL=$(git remote get-url origin)
    USERNAME=$(git config user.name)
    
    if [[ $CURRENT_URL == git@github.com:* ]]; then
        HTTPS_URL=$(echo "$CURRENT_URL" | sed 's|git@github.com:|https://github.com/|')
    else
        HTTPS_URL="$CURRENT_URL"
    fi
    
    TOKEN_URL=$(echo "$HTTPS_URL" | sed "s|https://github.com/|https://${github_token}@github.com/|")
    git remote set-url origin "$TOKEN_URL"
    
    print_success "已配置 Personal Access Token 认证"
    
    # 测试认证
    if git ls-remote origin >/dev/null 2>&1; then
        print_success "Token 认证成功"
    else
        print_error "Token 认证失败，请检查 token 权限"
    fi
}

# 安装依赖工具
install_dependencies() {
    print_step "检查依赖工具..."
    
    # 检查 jq
    if ! command -v jq &> /dev/null; then
        print_warning "jq 未安装，正在安装..."
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install jq
            else
                print_error "请先安装 Homebrew 或手动安装 jq"
                return 1
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            if command -v apt-get &> /dev/null; then
                sudo apt-get update && sudo apt-get install -y jq
            elif command -v yum &> /dev/null; then
                sudo yum install -y jq
            else
                print_error "请手动安装 jq"
                return 1
            fi
        fi
        
        if command -v jq &> /dev/null; then
            print_success "jq 安装成功"
        else
            print_warning "jq 安装失败，高级功能可能受限"
        fi
    else
        print_success "jq 已安装"
    fi
}

# 初始化同步环境
init_sync_environment() {
    print_step "初始化同步环境..."
    
    # 添加上游仓库
    if ! git remote get-url upstream >/dev/null 2>&1; then
        print_info "添加上游仓库..."
        git remote add upstream https://github.com/anyproto/anytype-ts.git
        print_success "上游仓库已添加"
    else
        print_info "上游仓库已存在"
    fi
    
    # 获取上游更新
    print_info "获取上游信息..."
    git fetch upstream
    
    # 检查配置文件
    if [ ! -f ".sync-config.json" ]; then
        print_warning "同步配置文件不存在，将创建默认配置"
        # 这里配置文件已经存在，所以不需要创建
    fi
    
    print_success "同步环境初始化完成"
}

# 测试同步功能
test_sync_functionality() {
    print_step "测试同步功能..."
    
    # 预览模式测试
    print_info "运行预览模式测试..."
    if ./sync-upstream-advanced.sh --dry-run; then
        print_success "预览模式测试通过"
    else
        print_warning "预览模式测试失败"
    fi
    
    # 检查脚本权限
    if [ -x "sync-upstream.sh" ] && [ -x "sync-upstream-advanced.sh" ]; then
        print_success "同步脚本权限正常"
    else
        print_warning "同步脚本权限异常"
        chmod +x sync-upstream.sh sync-upstream-advanced.sh
        print_info "已修复脚本权限"
    fi
}

# 显示使用指南
show_usage_guide() {
    print_step "使用指南"
    
    echo ""
    echo "🎉 同步环境设置完成！"
    echo ""
    echo "📋 可用的同步命令:"
    echo "  ./sync-upstream.sh                    # 基础同步"
    echo "  ./sync-upstream-advanced.sh           # 高级同步"
    echo "  ./sync-upstream-advanced.sh --dry-run # 预览模式"
    echo "  ./sync-upstream-advanced.sh --help    # 查看帮助"
    echo ""
    echo "📚 文档:"
    echo "  cat SYNC_GUIDE.md                     # 详细使用指南"
    echo ""
    echo "⚙️ 配置文件:"
    echo "  .sync-config.json                     # 同步配置"
    echo ""
    echo "🤖 自动同步:"
    echo "  GitHub Actions 已配置，每天凌晨2点自动同步"
    echo "  手动触发: GitHub → Actions → Sync Upstream"
    echo ""
    echo "🔧 故障排除:"
    echo "  如遇问题，请查看 SYNC_GUIDE.md 中的故障排除部分"
    echo ""
}

# 主函数
main() {
    print_info "=== anytype-ts 同步环境设置工具 ==="
    echo ""
    
    # 检查是否在正确的目录
    if [ ! -f "package.json" ] || ! grep -q "anytype" package.json; then
        print_error "请在 anytype-ts 项目根目录运行此脚本"
        exit 1
    fi
    
    # 执行设置步骤
    check_git_config
    echo ""
    
    install_dependencies
    echo ""
    
    check_github_auth
    echo ""
    
    init_sync_environment
    echo ""
    
    test_sync_functionality
    echo ""
    
    show_usage_guide
    
    print_success "=== 设置完成 ==="
}

# 执行主函数
main "$@"