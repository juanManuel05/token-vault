module.exports = {
  ["/interceptor"]: {
    target: "http://localhost:4200/assets/interceptor.global.js",
    secure: false,
    changeOrigin: false,
    bypass: (req, res, proxyOptions) => {
      // res.setHeader("Service-Worker-Allowed", "/");
      // res.setHeader("Service-Worker", "script");
      res.sendFile("interceptor.global.js", {
        headers: {
          "Service-Worker-Allowed": "/",
          "Service-Worker": "script",
          "Authorization": ""
        },
        root: "./src/assets",
      });
    },
  },
};
