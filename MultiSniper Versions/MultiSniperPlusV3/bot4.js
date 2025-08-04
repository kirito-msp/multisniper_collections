const port = 3004;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env4'

eval(require('fs').readFileSync('assets/body.js')+'');