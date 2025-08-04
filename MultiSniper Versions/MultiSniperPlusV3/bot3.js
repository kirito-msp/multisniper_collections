const port = 3003;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env3'

eval(require('fs').readFileSync('assets/body.js')+'');