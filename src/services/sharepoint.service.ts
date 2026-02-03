// src/services/sharepoint.service.ts

import { msalInstance, loginRequest, sharePointConfig } from '../config/auth-config';
import { AuthenticationResult, AccountInfo } from '@azure/msal-browser';

class SharePointService {
  private accessToken: string | null = null;
  private account: AccountInfo | null = null;

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    const accounts = msalInstance.getAllAccounts();
    return accounts.length > 0;
  }

  /**
   * Obtenir l'utilisateur connecté
   */
  getCurrentUser(): AccountInfo | null {
    const accounts = msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  /**
   * Connexion à Microsoft/SharePoint
   */
  async login(): Promise<AuthenticationResult> {
    try {
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      console.log('✅ Connexion réussie', loginResponse);
      
      this.account = loginResponse.account;
      await this.getAccessToken();
      
      return loginResponse;
      
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    const account = this.getCurrentUser();
    if (account) {
      await msalInstance.logoutPopup({ account });
    }
    this.accessToken = null;
    this.account = null;
  }

  /**
   * Obtenir le token d'accès (silencieux ou popup)
   */
  private async getAccessToken(): Promise<string> {
    if (!this.account) {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        throw new Error('Non authentifié. Veuillez vous connecter.');
      }
      this.account = accounts[0];
    }

    try {
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: this.account
      });
      this.accessToken = response.accessToken;
      return this.accessToken;
    } catch (error) {
      console.warn('Token silencieux échoué, tentative popup...', error);
      
      try {
        const response = await msalInstance.acquireTokenPopup(loginRequest);
        this.accessToken = response.accessToken;
        return this.accessToken;
      } catch (popupError) {
        console.error('❌ Erreur obtention token:', popupError);
        throw popupError;
      }
    }
  }

  /**
   * Effectuer une requête REST vers SharePoint
   */
  private async makeSharePointRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAccessToken();
    const url = `${sharePointConfig.siteUrl}${sharePointConfig.sitePath}${endpoint}`;

    const defaultHeaders = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json;odata=verbose',
      'Content-Type': 'application/json;odata=verbose'
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SharePoint Error ${response.status}: ${errorText}`);
    }

    return response;
  }

  /**
   * Récupérer des éléments d'une liste SharePoint
   */
  async getListItems(listName?: string): Promise<any[]> {
    const list = listName || sharePointConfig.listName;
    
    const response = await this.makeSharePointRequest(
      `/_api/web/lists/getbytitle('${list}')/items`
    );

    const data = await response.json();
    return data.d.results;
  }

  /**
   * Récupérer un élément spécifique par ID
   */
  async getListItemById(itemId: number, listName?: string): Promise<any> {
    const list = listName || sharePointConfig.listName;
    
    const response = await this.makeSharePointRequest(
      `/_api/web/lists/getbytitle('${list}')/items(${itemId})`
    );

    const data = await response.json();
    return data.d;
  }

  /**
   * Obtenir le Form Digest pour les opérations POST/UPDATE/DELETE
   */
  private async getFormDigest(): Promise<string> {
    const token = await this.getAccessToken();
    
    const response = await fetch(
      `${sharePointConfig.siteUrl}${sharePointConfig.sitePath}/_api/contextinfo`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json;odata=verbose'
        }
      }
    );

    const data = await response.json();
    return data.d.GetContextWebInformation.FormDigestValue;
  }

  /**
   * Créer un élément dans une liste SharePoint
   */
  async createListItem(itemData: any, listName?: string): Promise<any> {
    const list = listName || sharePointConfig.listName;
    const formDigest = await this.getFormDigest();

    const response = await this.makeSharePointRequest(
      `/_api/web/lists/getbytitle('${list}')/items`,
      {
        method: 'POST',
        headers: {
          'X-RequestDigest': formDigest
        },
        body: JSON.stringify({
          __metadata: { type: `SP.Data.${list}ListItem` },
          ...itemData
        })
      }
    );

    const data = await response.json();
    return data.d;
  }

  /**
   * Mettre à jour un élément
   */
  async updateListItem(itemId: number, itemData: any, listName?: string): Promise<any> {
    const list = listName || sharePointConfig.listName;
    const formDigest = await this.getFormDigest();

    const response = await this.makeSharePointRequest(
      `/_api/web/lists/getbytitle('${list}')/items(${itemId})`,
      {
        method: 'POST',
        headers: {
          'X-RequestDigest': formDigest,
          'IF-MATCH': '*',
          'X-HTTP-Method': 'MERGE'
        },
        body: JSON.stringify({
          __metadata: { type: `SP.Data.${list}ListItem` },
          ...itemData
        })
      }
    );

    return { success: true, itemId };
  }

  /**
   * Supprimer un élément
   */
  async deleteListItem(itemId: number, listName?: string): Promise<void> {
    const list = listName || sharePointConfig.listName;
    const formDigest = await this.getFormDigest();

    await this.makeSharePointRequest(
      `/_api/web/lists/getbytitle('${list}')/items(${itemId})`,
      {
        method: 'POST',
        headers: {
          'X-RequestDigest': formDigest,
          'IF-MATCH': '*',
          'X-HTTP-Method': 'DELETE'
        }
      }
    );
  }

  /**
   * Récupérer toutes les listes du site
   */
  async getLists(): Promise<any[]> {
    const response = await this.makeSharePointRequest('/_api/web/lists');
    const data = await response.json();
    return data.d.results;
  }

  /**
   * Vérifier les permissions de l'utilisateur
   */
  async checkUserPermissions(): Promise<any> {
    const response = await this.makeSharePointRequest(
      '/_api/web/currentuser?$expand=Groups'
    );
    const data = await response.json();
    return data.d;
  }
}

// Instance singleton
export const sharePointService = new SharePointService();
export default sharePointService;
