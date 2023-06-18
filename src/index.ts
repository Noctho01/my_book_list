import { app } from "./infra/http/server";
const port = 8080;

app.listen(port, () => {
  console.log('servidor iniciado na porta:', port);
}) 