const port = 3012;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env12'

eval(require('fs').readFileSync('assets/body.js')+'');