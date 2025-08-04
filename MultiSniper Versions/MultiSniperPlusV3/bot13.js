const port = 3013;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env13'

eval(require('fs').readFileSync('assets/body.js')+'');