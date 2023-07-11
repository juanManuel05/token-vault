import { interceptor } from '@forgerock/token-vault';

// Initialize the token vault interceptor
interceptor({
  interceptor: {
    urls: ['https://jsonplaceholder.typicode.com/*'],
  },
  forgerock: {
    serverConfig: {
      baseUrl: 'https://openam-sdks.forgeblocks.com/am/',
      timeout: 5000,
    },
    realmPath: 'root',
  },
});
