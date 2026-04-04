# serve.ps1 — Windows PowerShell 零依赖静态文件服务器（支持 SPA 回退）
param([int]$Port = 3000)

$dist = Join-Path $PSScriptRoot "dist"
if (-not (Test-Path (Join-Path $dist "index.html"))) {
    Write-Host "  [ERROR] dist folder missing" -ForegroundColor Red
    pause
    exit 1
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".webp" = "image/webp"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:${Port}/")
$listener.Prefixes.Add("http://127.0.0.1:${Port}/")

try {
    $listener.Start()
} catch {
    Write-Host "  [ERROR] Port $Port is in use or access denied." -ForegroundColor Red
    Write-Host "  Try: .\serve.ps1 -Port 8080" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "  Isekai Rebirth Simulator" -ForegroundColor Cyan
Write-Host "  =============================" -ForegroundColor DarkGray
Write-Host "  URL: " -NoNewline
Write-Host "http://localhost:${Port}/" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop" -ForegroundColor DarkGray
Write-Host "  =============================" -ForegroundColor DarkGray
Write-Host ""

# 自动打开浏览器
Start-Process "http://localhost:${Port}/"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        $urlPath = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)

        # 安全：阻止路径穿越
        if ($urlPath -match "\.\.") {
            $res.StatusCode = 403
            $res.Close()
            continue
        }

        $relative = $urlPath.TrimStart("/")
        if ($relative -eq "") { $relative = "index.html" }

        $filePath = Join-Path $dist $relative

        # 尝试提供请求的文件，否则 SPA 回退到 index.html
        if (-not (Test-Path $filePath -PathType Leaf)) {
            $filePath = Join-Path $dist "index.html"
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)

            $res.StatusCode = 200
            $res.ContentType = $contentType
            $res.ContentLength64 = $bytes.Length

            if ($ext -eq ".html") {
                $res.Headers.Add("Cache-Control", "no-cache")
            } else {
                $res.Headers.Add("Cache-Control", "public, max-age=31536000, immutable")
            }

            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode = 404
        }

        $res.Close()
    }
} finally {
    $listener.Stop()
}
