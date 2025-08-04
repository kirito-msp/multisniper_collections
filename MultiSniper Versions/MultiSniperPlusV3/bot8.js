const port = 3008;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env8'

eval(require('fs').readFileSync('assets/body.js')+'');