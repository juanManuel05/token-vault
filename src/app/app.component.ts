import { AfterViewInit, Component, OnInit } from '@angular/core';
import { client } from '@forgerock/token-vault';
import {
  Config,
  FRUser,
  TokenManager,
  UserManager,
} from '@forgerock/javascript-sdk';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit, OnInit {
  title = 'forge-rock-token-vault-app';
  register = client({
    app: {
      origin: 'http://localhost:4200',
    },
    interceptor: {
      file: '/interceptor.ts',
      scope: '/',
    },
    proxy: {
      origin: 'http://localhost:5833',
    },
  });
  interceptor: ServiceWorkerRegistration | undefined;
  proxy!: HTMLIFrameElement;
  tokenStore: any;

  fetchProtectedMockBtn: any;
  fetchUnprotectedMockBtn: any;
  fetchUserBtn: any;
  hasTokensBtn: any;
  refreshTokensBtn: any;
  loginBtn: any;
  logoutBtn: any;
  unregisterInterceptorBtn: any;
  destroyProxyBtn: any;

  // Definition elements
  loggedInEl: any;
  userInfoEl: any;
  hasTokensEl: any;
  refreshTokensEl: any;

  constructor() {
    // Register the Token Vault Interceptor
    this.register.interceptor().then(
      (sw) => (this.interceptor = sw),
      (err) => console.log('INTERCEPTOR CALLBACK error', err)
    );

    // Register the Token Vault Proxy
    this.register
      .proxy(document.getElementById('token-vault') as HTMLElement)
      .then(
        (elem) => {
          this.proxy = elem;
        },
        (err) => console.log('PROXY ERROR', err)
      );

    // Register the Token Vault Store
    this.tokenStore = this.register.store();

    Config.set({
      clientId: 'ForgeRockSDKClient',
      redirectUri: `${window.location.href}`,
      scope: 'openid profile me.read',
      serverConfig: {
        baseUrl: 'https://openam-sdks.forgeblocks.com/am/',
        timeout: 5000,
      },
      realmPath: 'root',
      tokenStore: {
        get: this.tokenStore.get,
        set: this.tokenStore.set,
        remove: this.tokenStore.remove,
      },
    });
  }
  async ngOnInit(): Promise<void> {
    this.fetchProtectedMockBtn = this.getById('fetchProtectedMockBtn');
    this.fetchUnprotectedMockBtn = this.getById('fetchUnprotectedMockBtn');
    this.fetchUserBtn = this.getById('fetchUserBtn');
    this.hasTokensBtn = this.getById('hasTokensBtn');
    this.refreshTokensBtn = this.getById('refreshTokensBtn');
    this.loginBtn = this.getById('loginBtn');
    this.logoutBtn = this.getById('logoutBtn');
    this.unregisterInterceptorBtn = this.getById('unregisterInterceptorBtn');
    this.destroyProxyBtn = this.getById('destroyProxyBtn');

    // Definition elements
    this.loggedInEl = this.getById('loggedInDef');
    this.userInfoEl = this.getById('userInfoDef');
    this.hasTokensEl = this.getById('hasTokensDef');
    this.refreshTokensEl = this.getById('refreshTokensDef');
    /**
     * Check URL for query parameters
     */
    const url = new URL(document.location.href);
    const params = url.searchParams;
    const code = params.get('code');
    const state = params.get('state');
    /**
     * If the URL has state and code as query parameters, then the user
     * returned back here after successfully logging in, so call authorize
     * with the values
     */
    if (state && code) {
      await TokenManager.getTokens({ query: { code, state } });
      location.replace('http://localhost:4200');
    }

    /**
     * Let's make an initial check for tokens to see if the user is logged in
     */
    const res = await (async () => {
      return await this.tokenStore.has();
    })();
    if (res.hasTokens) {
      this.loggedInEl.innerText = 'true';
      this.hasTokensEl.innerText = 'true';
    }
  }

  ngAfterViewInit(): void {
    /** ****************************************************
     * ATTACH USER EVENT LISTENERS
     */
    this.fetchProtectedMockBtn.addEventListener('click', async () => {
      await fetch('https://jsonplaceholder.typicode.com/todos');
    });
    this.fetchUserBtn.addEventListener('click', async () => {
      const user = (await UserManager.getCurrentUser()) as any;

      this.userInfoEl.innerText = user?.name;
      console.log(user);
    });
    this.hasTokensBtn.addEventListener('click', async () => {
      const res = await this.tokenStore.has();

      this.hasTokensEl.innerText = String(res.hasTokens);
      console.log(res);
    });
    this.refreshTokensBtn.addEventListener('click', async () => {
      const res = await this.tokenStore.refresh();

      this.refreshTokensEl.innerText = String(res.refreshTokens);
      console.log(res);
    });
    this.loginBtn.addEventListener('click', async () => {
      console.log('Logging in...');
      await TokenManager.getTokens({
        login: 'redirect',
        forceRenew: true,
        query: { acr_values: 'SpecificTree' },
      });
    });
    this.logoutBtn.addEventListener('click', async () => {
      // Not all endpoints are supported and will fail
      await FRUser.logout();

      this.loggedInEl.innerText = 'false';
      this.hasTokensEl.innerText = 'false';
      this.refreshTokensEl.innerText = 'false';
      this.userInfoEl.innerText = 'n/a';
      console.log('Logged out');
    });

    this.unregisterInterceptorBtn.addEventListener('click', async () => {
      await this.interceptor?.unregister();
      console.log('Interceptor unregistered');
    });

    this.destroyProxyBtn.addEventListener('click', async () => {
      (document.getElementById('token-vault') as HTMLDivElement).removeChild(
        this.proxy as Node
      );
      console.log('Proxy destroyed');
    });
  }

  getById(id: string) {
    return document.getElementById(id) as HTMLElement;
  }
}
