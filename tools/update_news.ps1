# 领域动态自动更新（供手动或 Windows 任务计划程序调用）
# 作用：运行 tools/news_fetcher.py，自动抓取并重写 assets/news-data.js
$ErrorActionPreference = "Stop"

$toolsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir = Split-Path -Parent $toolsDir

$python = (Get-Command python -ErrorAction SilentlyContinue).Source
if (-not $python) { $python = (Get-Command py -ErrorAction SilentlyContinue).Source }
if (-not $python) {
    Write-Error "未找到 Python。请先安装 Python 3 并加入 PATH。"
    exit 1
}

Push-Location $repoDir
try {
    & $python (Join-Path $toolsDir "news_fetcher.py")
    $code = $LASTEXITCODE
    if ($code -ne 0) {
        Write-Error "news_fetcher.py 执行失败，退出码 $code"
        exit $code
    }
    Write-Host "[update_news] 完成：assets/news-data.js 已更新"
} finally {
    Pop-Location
}
exit 0