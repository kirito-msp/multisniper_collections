const port = 3010;
const local_ip = "http://" + "${server_ip}";
const env_file = '.env10'

eval(require('fs').readFileSync('assets/body.js')+'');