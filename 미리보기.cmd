@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js 22 이상을 설치한 후 다시 실행해주세요.
 pause
 exit /b 1
)
node scripts/build.mjs
if errorlevel 1 (
 echo 홈페이지 생성 중 문제가 발생했습니다. 이 창의 내용을 알려주세요.
 pause
 exit /b 1
)
echo LT인테리어 미리보기: http://127.0.0.1:4173/
echo 이 창을 열어둔 상태로 홈페이지를 확인하세요.
start "" "http://127.0.0.1:4173/"
node scripts/serve.mjs
pause
