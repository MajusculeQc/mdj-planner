// src/services/sharepoint.service.ts

import { msalInstance, loginRequest, sharePointConfig } from '../config/auth-config';
import { AuthenticationResult } from '@azure/msal-browser';

export class SharePointService {
  private accessToken: string | null = null;
  private account: any = null;

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    const accounts = msalInstance.getAllAccounts();
    return accounts.length > 0;
  }

  // Connexion à SharePoint
  async login(): Promise<AuthenticationResult> {
    try {
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      console.log('✅ Connexion réussie', loginResponse);
      
      this.account = loginResponse.account;
      
      // Obtenir le token
      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: this.account
      });
      
      this.accessToken = tokenResponse.accessToken;
      console.log('✅ Token obtenu');
      
      return loginResponse;
      
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      
      // Si l'acquisition silencieuse échoue, demander de nouveau
      try {
        const tokenResponse = await msalInstance.acquireTokenPopup(loginRequest);
        this.accessToken = tokenResponse.accessToken;
        return tokenResponse;
      } catch (popupError) {
        console.error('❌ Erreur popup:', popupError);
        throw popupError;
      }
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    const account = msalInstance.getAllAccounts()[0];
    if (account) {
      await msalInstance.logoutPopup({ account });
    }
    this.accessToken = null;
    this.account = null;
  }

  // Obtenir le token d'accès actuel
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
      console.error('Erreur obtention token:', error);
      throw error;
    }
  }

  // Récupérer des éléments d'une liste SharePoint
  async getListItems(listName?: string): Promise<any[]> {
    const token = await this.getAccessToken();
    const list = listName || sharePointConfig.listName;

    const response = await fetch(
      `${sharePointConfig.siteUrl}/_api/web/lists/getbytitle('${list}')/items`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json;odata=verbose'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.d.results;
  }

  // Créer un élément dans une liste SharePoint
  async createListItem(itemData: any, listName?: string): Promise<any> {
    const token = await this.getAccessToken();
    const list = listName || sharePointConfig.listName;

    // Obtenir le form digest pour les opérations POST
    const digestResponse = await fetch(
      `${sharePointConfig.siteUrl}/_api/contextinfo`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json;odata=verbose'
        }
      }
    );

    const digestData = await digestResponse.json();
    const formDigest = digestData.d.GetContextWebInformation.FormDigestValue;

    const response = await fetch(
      `${sharePointConfig.siteUrl}/_api/web/lists/getbytitle('${list}')/items`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'X-RequestDigest': formDigest
        },
        body: JSON.stringify({
          __metadata: { type: `SP.Data.${list}ListItem` },
          ...itemData
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur création: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.d;
  }

  // Mettre à jour un élément
  async updateListItem(itemId: number, itemData: any, listName?: string): Promise<any> {
    const token = await this.getAccessToken();
    const list = listName || sharePointConfig.listName;

    const digestResponse = await fetch(
      `${sharePointConfig.siteUrl}/_api/contextinfo`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json;odata=verbose'
        }
      }
    );

    const digestData = await digestResponse.json();
    const formDigest = digestData.d.GetContextWebInformation.FormDigestValue;

    const response = await fetch(
      `${sharePointConfig.siteUrl}/_api/web/lists/getbytitle('${list}')/items(${itemId})`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
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

    if (!response.ok) {
      throw new Error(`Erreur mise à jour: ${response.status}`);
    }

    return { success: true, itemId };
  }

  // Supprimer un élément
  async deleteListItem(itemId: number, listName?: string): Promise<void> {
    const token = await this.getAccessToken();
    const list = listName || sharePointConfig.listName;

    const digestResponse = await fetch(
      `${sharePointConfig.siteUrl}/_api/contextinfo`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json;odata=verbose'
        }
      }
    );

    const digestData = await digestResponse.json();
    const formDigest = digestData.d.GetContextWebInformation.FormDigestValue;

    const response = await fetch(
      `${sharePointConfig.siteUrl}/_api/web/lists/getbytitle('${list}')/items(${itemId})`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-RequestDigest': formDigest,
          'IF-MATCH': '*',
          'X-HTTP-Method': 'DELETE'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur suppression: ${response.status}`);
    }
  }
}

// Instance singleton
export const sharePointService = new SharePointService();
