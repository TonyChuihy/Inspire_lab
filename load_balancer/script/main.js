import qs from "querystring";
// import http from "http";

counter = 0;

function choose_upstream(r) {
  let backend;
  //   let args = qs.parse(r.headersIn["X-Original-URI"].split("?")[1]);
  //   let health1 = http.request("GET", "http://127.0.0.1:3000/status");
  let health1 = "A";
  switch (health1) {
    case "A":
      backend = "B1";
      break;
    case "B":
      backend = "B2";
      break;
    default:
      r.return(404);
  }

  r.headersOut["X-backend"] = backend;
  r.return(200);
}

function set_upstream(r) {
  let backend;
  switch (r.headersOut["X-backend"]) {
    case "B1":
      backend = "127.0.0.1:8081";
      break;
    case "B2":
      backend = "127.0.0.1:8082";
      break;
  }

  if (backend) {
    r.headersOut["X-backend"] = backend;
  }
}

export default { choose_upstream, set_upstream };
