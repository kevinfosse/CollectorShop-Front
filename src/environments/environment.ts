export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  keycloak: {
    url: 'https://authcollector.duckdns.org',
    realm: 'CollectorShop',
    clientId: 'collectorshop-client',
    apiBaseUrl: 'https://api.collectorcube.duckdns.org',
  },
};
