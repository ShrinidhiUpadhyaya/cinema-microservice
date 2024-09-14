const supertest = require("supertest");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.NODE_TLS_ACCEPT_UNTRUSTED_CERTIFICATES_THIS_IS_INSECURE = "1";

module.exports = (payload, traceId) => {
  return new Promise((resolve, reject) => {
    supertest(process.env.NGINX_SERVICE)
      .post("/notification/sendEmail")
      .set("x-trace-id", traceId)
      .send({ payload })
      .end((err, res) => {
        if (err) {
          reject(
            new Error("An error occured with the payment service, err: " + err)
          );
        }
        resolve(res.body);
      });
  });
};
