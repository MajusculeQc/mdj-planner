// src/config/auth-config.ts

import { Configuration, PublicClientApplication } from '@azure/msal-browser';

// Configuration MSAL pour SharePoint
export const msalConfig: Configuration = {
  auth: {
    clientId: "e74166aa-736f-4f74-9689-a71b58fc23a6",
    authority: "https://login.microsoftonline.com/e0dd287f-e6e3-4d48-83b2-64415a9bc105",
    redirectUri: window.location.origin, // S'adapte automatiquement à l'environnement
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

// Permissions SharePoint requises
export const loginRequest = {
  scopes: [
    "User.Read",
    "Sites.Read.All", 
    "Sites.ReadWrite.All"
  ]
};

// Configuration SharePoint (à personnaliser selon votre site)
export const sharePointConfig = {
  siteUrl: "https://escalejeunesse.sharepoint.com", // URL de base de votre SharePoint
  sitePath: "/sites/VOTRE_SITE", // Remplacez par le nom de votre site
  listName: "Planification" // Nom de votre liste SharePoint
};

// Initialiser MSAL
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialiser MSAL au chargement
await msalInstance.initialize();

export default msalInstance;
