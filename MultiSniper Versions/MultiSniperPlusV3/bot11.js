const port = 3011;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env11'

eval(require('fs').readFileSync('assets/body.js')+'');