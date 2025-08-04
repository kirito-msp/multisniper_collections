const port = 3009;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env9'

eval(require('fs').readFileSync('assets/body.js')+'');