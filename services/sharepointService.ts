import { Client } from "@microsoft/microsoft-graph-client";
import { PublicClientApplication } from "@azure/msal-browser";
import { Activity } from "../types";

/**
 * CONFIGURATION MSAL (AUTHENTIFICATION)
 */
// Fonction utilitaire pour nettoyer l'URL
const getCleanRedirectUri = () => {
  if (typeof window === 'undefined') return '';
  
  // FIX: Force l'URL de production exacte si on est sur le domaine Netlify
  // Cela évite les erreurs de mismatch (slash final, http vs https, etc.)
  if (window.location.hostname === 'mdj-planner.netlify.app') {
      return 'https://mdj-planner.netlify.app';
  }

  let uri = window.location.href.split(/[?#]/)[0];
  
  // Si l'URI commence par blob: (ex: blob:https://...), on le retire pour garder https://...
  if (uri.startsWith('blob:')) {
      uri = uri.substring(5); // Retire 'blob:'
  }
  
  // Retire le slash final si présent
  return uri.endsWith('/') ? uri.slice(0, -1) : uri;
};

const MSAL_CONFIG = {
  auth: {
    clientId: "e74166aa-73fd-4f74-9689-a71b58fc23a6", 
    // Utilisation de 'organizations' pour le support multi-tenant / single tenant correct
    authority: "https://login.microsoftonline.com/organizations",
    // IMPORTANT: URL nettoyée ou forcée pour la prod
    redirectUri: getCleanRedirectUri(), 
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  }
};

const SCOPES = [
  "https://graph.microsoft.com/User.Read", 
  "https://graph.microsoft.com/Sites.ReadWrite.All"
];

// Variable pour stocker l'instance MSAL (initialisée uniquement à la demande)
let msalInstance: PublicClientApplication | null = null;

// Stockage de la config SharePoint dans le navigateur
const CONFIG_KEY = 'mdj_sp_config_v1';

interface SPConfig {
  siteId: string;
  listId: string;
  siteName: string;
}

/**
 * Initialise MSAL uniquement quand nécessaire.
 */
const getMsalInstance = async () => {
  if (!msalInstance) {
    try {
      console.log("🔐 Initialisation MSAL avec Redirect URI:", MSAL_CONFIG.auth.redirectUri);
      msalInstance = new PublicClientApplication(MSAL_CONFIG);
      await msalInstance.initialize();
    } catch (error) {
      console.error("Erreur critique initialisation MSAL:", error);
      throw new Error("Impossible d'initialiser le module de sécurité Microsoft.");
    }
  }
  return msalInstance;
};

const getAuthToken = async (): Promise<string> => {
  const msal = await getMsalInstance();
  let account = msal.getActiveAccount();
  
  if (!account) {
    const accounts = msal.getAllAccounts();
    if (accounts.length > 0) {
      msal.setActiveAccount(accounts[0]);
      account = accounts[0];
    }
  }

  if (!account) {
    throw new Error("Utilisateur non connecté.");
  }

  const request = { scopes: SCOPES, account: account };

  try {
    const response = await msal.acquireTokenSilent(request);
    return response.accessToken;
  } catch (e) {
    const response = await msal.acquireTokenPopup(request);
    return response.accessToken;
  }
};

const getGraphClient = async () => {
  const token = await getAuthToken();
  if (!Client) throw new Error("La librairie Graph Client n'est pas chargée.");
  
  return Client.init({
    authProvider: (done) => {
      done(null, token);
    }
  });
};

export const SharePointService = {
  
  // --- AUTHENTIFICATION ---

  login: async () => {
    try {
        const msal = await getMsalInstance();
        const response = await msal.loginPopup({ scopes: SCOPES });
        msal.setActiveAccount(response.account);
        return response.account;
    } catch (e: any) {
        // GESTION ANNULATION UTILISATEUR
        if (e.errorCode === "user_cancelled" || (e.message && e.message.includes("user_cancelled"))) {
            throw new Error("CANCELLED");
        }

        console.error("Login failed", e);
        
        // Gestion des erreurs courantes Azure avec instructions claires
        if (e.message && (e.message.includes("AADSTS50011") || e.message.includes("AADSTS500113"))) {
            const currentUrl = MSAL_CONFIG.auth.redirectUri;
            alert(`⚠️ ERREUR D'ADRESSE (AADSTS50011)\n\nL'adresse que vous avez mise dans Azure ne correspond pas à l'adresse actuelle.\n\nADRESSE ACTUELLE À COPIER DANS AZURE :\n${currentUrl}\n\nL'environnement de test change souvent d'adresse. Mettez à jour Azure avec celle ci-dessus.`);
        } else if (e.message && e.message.includes("AADSTS50194")) {
            alert("ERREUR CONFIG (Multi-tenant): L'application Azure n'accepte pas les comptes personnels ou externes. Assurez-vous d'utiliser un compte professionnel Office 365 lié au tenant.");
        } else if (e.message && e.message.includes("AADSTS650053")) {
             alert("ERREUR PERMISSIONS: L'application demande des permissions refusées. Vérifiez 'Sites.ReadWrite.All' dans le portail Azure.");
        }
        throw e;
    }
  },

  getUser: async () => {
    try {
        if (!msalInstance) return null; 
        return msalInstance.getActiveAccount();
    } catch (e) {
        return null;
    }
  },

  logout: async () => {
    const msal = await getMsalInstance();
    await msal.logoutPopup();
    localStorage.removeItem(CONFIG_KEY);
  },

  // --- CONFIGURATION AUTOMATIQUE ---

  autoConfigure: async (siteKeyword: string): Promise<boolean> => {
    try {
      const client = await getGraphClient();
      console.log(`🔍 Recherche du site contenant: "${siteKeyword}"...`);

      // 1. Trouver le site
      const siteSearch = await client.api(`/sites?search=${siteKeyword}`).get();
      if (!siteSearch.value || siteSearch.value.length === 0) {
        alert(`Aucun site SharePoint trouvé avec le mot clé "${siteKeyword}". Vérifiez le nom exact (ex: "Direction", "Intranet").`);
        return false;
      }
      
      const site = siteSearch.value[0];
      const siteId = site.id;
      console.log(`✅ Site trouvé: ${site.name} (${siteId})`);

      // 2. Chercher la liste "MDJ_Activites"
      let listId = "";
      try {
        const lists = await client.api(`/sites/${siteId}/lists`).filter("displayName eq 'MDJ_Activites'").get();
        if (lists.value && lists.value.length > 0) {
          listId = lists.value[0].id;
          console.log(`✅ Liste existante trouvée: ${listId}`);
        }
      } catch (e) {
        console.warn("Erreur recherche liste", e);
      }

      // 3. Créer la liste si elle n'existe pas
      if (!listId) {
        console.log("⚠️ Liste non trouvée. Création automatique...");
        const newList = await client.api(`/sites/${siteId}/lists`).post({
          displayName: "MDJ_Activites",
          columns: [
            { name: "Title", text: {} },
            { name: "ActivityDate", dateTime: {} },
            { name: "JSON_Data", text: { allowMultipleLines: true, appendChangesToExistingText: false } }
          ],
          list: { template: "genericList" }
        });
        listId = newList.id;
        console.log(`🎉 Liste créée avec succès: ${listId}`);
      }

      // 4. Sauvegarder la config
      const config: SPConfig = { siteId, listId, siteName: site.name };
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      return true;

    } catch (error) {
      console.error("Erreur Auto-Config:", error);
      alert("Erreur lors de la configuration automatique. Assurez-vous d'être administrateur du site SharePoint.");
      return false;
    }
  },

  getConfig: (): SPConfig | null => {
    const data = localStorage.getItem(CONFIG_KEY);
    return data ? JSON.parse(data) : null;
  },

  // --- CRUD OPERATIONS ---

  getAll: async (): Promise<Activity[]> => {
    const config = SharePointService.getConfig();
    if (!config) return []; 

    try {
      const client = await getGraphClient();
      const response = await client
        .api(`/sites/${config.siteId}/lists/${config.listId}/items`)
        .expand('fields(select=Title,JSON_Data,id)') 
        .top(499)
        .get();

      return response.value.map((item: any) => {
        try {
          if (!item.fields.JSON_Data) return null;
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
    const config = SharePointService.getConfig();
    if (!config) throw new Error("SharePoint non configuré.");

    const client = await getGraphClient();
    const listItem = {
      fields: {
        Title: activity.title,
        ActivityDate: activity.date,
        JSON_Data: JSON.stringify(activity)
      }
    };

    try {
      if ((activity as any).sharepointId) {
        const spId = (activity as any).sharepointId;
        await client
          .api(`/sites/${config.siteId}/lists/${config.listId}/items/${spId}`)
          .patch(listItem);
      } else {
        const res = await client
          .api(`/sites/${config.siteId}/lists/${config.listId}/items`)
          .post(listItem);
        (activity as any).sharepointId = res.id;
      }
    } catch (error) {
      console.error("Erreur SharePoint SAVE:", error);
      throw error;
    }
  },
  
  delete: async (id: string, sharepointId?: string): Promise<void> => {
      const config = SharePointService.getConfig();
      if (!config || !sharepointId) return;

      try {
          const client = await getGraphClient();
          await client.api(`/sites/${config.siteId}/lists/${config.listId}/items/${sharepointId}`).delete();
      } catch (e) {
          console.error("Delete failed", e);
      }
  },

  reset: async () => {
      alert("Impossible de réinitialiser toute la base de données SharePoint depuis ici par sécurité.");
  }
};