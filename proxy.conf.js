module.exports = {
  ["/interceptor.ts"]: {
    target:  "file://C:/Users/juan.garmendia/Documents/forgerock-login-widget-angular/src/interceptor.ts",
    secure: false,
    bypass: (req, res, proxyOptions) => {
      res.setHeader("Service-Worker-Allowed", "/");
      res.setHeader("Service-Worker", "script");
    }
  }
}



