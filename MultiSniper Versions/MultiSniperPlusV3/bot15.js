const port = 3015;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env15'

eval(require('fs').readFileSync('assets/body.js')+'');