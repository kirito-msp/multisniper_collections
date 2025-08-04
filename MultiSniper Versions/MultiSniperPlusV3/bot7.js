const port = 3007;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env7'

eval(require('fs').readFileSync('assets/body.js')+'');