/* eslint-disable no-unexpected-multiline */
/* eslint-disable template-tag-spacing */
const fs = require('fs');

fs.writeFileSync('./.env', `APIKEY=${process.env.APIKEY}\n
AUTH_DOMAIN=${process.env.AUTH_DOMAIN}\n
DATABASE_URL=${process.env.DATABASE_URL}\n
PROJECT_ID=${process.env.PROJECT_ID}\n
STORAGE_BUCKET=${process.env.STORAGE_BUCKET}\n
MESSAGING_SENDER_ID=${process.env.MESSAGING_SENDER_ID}\n
APP_ID=${process.env.APP_ID}\n
MEASUREMENT_ID=${process.env.MEASUREMENT_ID}\n`);
