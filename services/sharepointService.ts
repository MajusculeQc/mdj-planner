import { Client } from "@microsoft/microsoft-graph-client";
import { PublicClientApplication } from "@azure/msal-browser";
import { Activity } from "../types";

// CONFIGURATION AZURE - IDs Fournis par l'utilisateur
const MSAL_CONFIG = {
  auth: {
    clientId: "e74166aa-73fd-4f74-9689-a71b58fc23a6", // ID de l'application
    authority: "https://login.microsoftonline.com/e0dd87f7-e6e3-4a48-83b2-64415a9bc105", // ID de l'annuaire (Tenant)
    redirectUri: window.location.origin, // Doit correspondre exactement à l'URI configurée dans Azure
  },
  cache: {
    cacheLocation: "sessionStorage", 
    storeAuthStateInCookie: false,
  }
};

// ⚠️ À REMPLIR PLUS TARD AVEC LES INFOS SHAREPOINT
// Utilisez Graph Explorer (developer.microsoft.com/graph/graph-explorer) pour trouver ces IDs
// Requete: https://graph.microsoft.com/v1.0/sites?search=VOTRE_NOM_DE_SITE
const SP_CONFIG = {
  // Remplacer par l'ID réel du site SharePoint après l'avoir trouvé
  siteId: "A_REMPLIR_SITE_ID", 
  // Remplacer par l'ID réel de la liste 'MDJ_Activites'
  listId: "A_REMPLIR_LIST_ID"  
};

const msalInstance = new PublicClientApplication(MSAL_CONFIG);

// Initialisation asynchrone requise par MSAL v3
let isMsalInitialized = false;
const initializeMsal = async () => {
  if (!isMsalInitialized) {
    await msalInstance.initialize();
    isMsalInitialized = true;
  }
};

const getAuthToken = async (): Promise<string> => {
  await initializeMsal();
  
  // Tente de récupérer le compte actif
  let account = msalInstance.getAllAccounts()[0];
  
  if (!account) {
    // Si pas de compte, on déclenche le login
    await msalInstance.loginPopup({
        scopes: ["Sites.ReadWrite.All", "User.Read"]
    });
    account = msalInstance.getAllAccounts()[0];
  }

  const request = {
    scopes: ["Sites.ReadWrite.All"],
    account: account
  };

  try {
    const response = await msalInstance.acquireTokenSilent(request);
    return response.accessToken;
  } catch (e) {
    const response = await msalInstance.acquireTokenPopup(request);
    return response.accessToken;
  }
};

const getGraphClient = async () => {
  const token = await getAuthToken();
  return Client.init({
    authProvider: (done) => {
      done(null, token);
    }
  });
};

export const SharePointService = {
  
  // Login manuel
  login: async () => {
    await initializeMsal();
    try {
        await msalInstance.loginPopup({
            scopes: ["Sites.ReadWrite.All", "User.Read"]
        });
        return msalInstance.getAllAccounts()[0];
    } catch (e) {
        console.error("Login failed", e);
        throw e;
    }
  },

  getUser: async () => {
    await initializeMsal();
    return msalInstance.getAllAccounts()[0];
  },

  getAll: async (): Promise<Activity[]> => {
    if (SP_CONFIG.siteId === "A_REMPLIR_SITE_ID") {
        console.warn("⚠️ SharePoint non configuré : IDs manquants. Retour tableau vide.");
        return [];
    }

    try {
      const client = await getGraphClient();
      const response = await client
        .api(`/sites/${SP_CONFIG.siteId}/lists/${SP_CONFIG.listId}/items`)
        .expand('fields(select=Title,JSON_Data,id)') 
        .get();

      return response.value.map((item: any) => {
        try {
          const data = JSON.parse(item.fields.JSON_Data);
          return { ...data, sharepointId: item.id };
        } catch (e) {
          return null;
        }
      }).filter((a: any) => a !== null);
    } catch (error) {
      console.error("Erreur SharePoint GET:", error);
      throw error;
    }
  },

  save: async (activity: Activity): Promise<void> => {
    if (SP_CONFIG.siteId === "A_REMPLIR_SITE_ID") {
        alert("Configuration SharePoint incomplète. Impossible de sauvegarder dans le cloud pour l'instant.");
        return;
    }

    const client = await getGraphClient();
    const listItem = {
      fields: {
        Title: activity.title,
        ActivityDate: activity.date, // Assurez-vous que cette colonne existe dans SP ou retirez cette ligne
        JSON_Data: JSON.stringify(activity)
      }
    };

    try {
      if ((activity as any).sharepointId) {
        const spId = (activity as any).sharepointId;
        await client
          .api(`/sites/${SP_CONFIG.siteId}/lists/${SP_CONFIG.listId}/items/${spId}`)
          .patch(listItem);
      } else {
        await client
          .api(`/sites/${SP_CONFIG.siteId}/lists/${SP_CONFIG.listId}/items`)
          .post(listItem);
      }
    } catch (error) {
      console.error("Erreur SharePoint SAVE:", error);
      throw error;
    }
  },
  
  reset: async () => {
      // Pas d'action reset globale sur SharePoint pour sécurité
      console.log("Reset non supporté sur SharePoint par sécurité");
  }
};