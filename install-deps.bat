@echo off
cd /d C:\Ecommerce
npm install
if errorlevel 1 (
  echo ❌ Installation failed
  exit /b 1
) else (
  echo ✅ Installation completed successfully
)
