const port = 3006;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env6'

eval(require('fs').readFileSync('assets/body.js')+'');