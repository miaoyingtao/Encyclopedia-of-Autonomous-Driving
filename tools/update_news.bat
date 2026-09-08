@echo off
rem 领域动态自动更新（双击运行，需已安装 Python 3）
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0update_news.ps1"
pause