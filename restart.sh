#/bin/bash
# Description: Restart the server

# Stop the server
git pull
pm2 stop 0
npm run build
pm2 restart 0