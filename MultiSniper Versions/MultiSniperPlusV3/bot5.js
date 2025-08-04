const port = 3005;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env5'

eval(require('fs').readFileSync('assets/body.js')+'');