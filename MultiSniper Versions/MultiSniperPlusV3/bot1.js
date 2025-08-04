const port = 3001;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env1'

eval(require('fs').readFileSync('assets/body.js')+'');