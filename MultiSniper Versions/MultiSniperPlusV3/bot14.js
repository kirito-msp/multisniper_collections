const port = 3014;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env14'

eval(require('fs').readFileSync('assets/body.js')+'');