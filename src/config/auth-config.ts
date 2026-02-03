// src/config/auth-config.ts

import { Configuration, PublicClientApplication } from '@azure/msal-browser';

// Configuration MSAL pour SharePoint
export const msalConfig: Configuration = {
  auth: {
    clientId: "e74166aa-736f-4f74-9689-a71b58fc23a6",
    authority: "https://login.microsoftonline.com/e0dd287f-e6e3-4d48-83b2-64415a9bc105",
    redirectUri: "https://mdj-planner.netlify.app",
    postLogoutRedirectUri: "https://mdj-planner.netlify.app"
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

// Configuration SharePoint
export const sharePointConfig = {
  siteUrl: "https://escalejeunesse.sharepoint.com/sites/VOTRE_SITE", // À modifier selon votre site
  listName: "VOTRE_LISTE" // À modifier selon votre liste
};

// Initialiser MSAL
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialiser MSAL au chargement
msalInstance.initialize();
