const port = 3002;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env2'

eval(require('fs').readFileSync('assets/body.js')+'');