import { Activity } from "../types";

const STORAGE_KEY = 'mdj_activities_db_v4';

/**
 * Service Layer for Activity Data.
 * 
 * ARCHITECTURE NOTE FOR SHAREPOINT INTEGRATION:
 * When moving to SharePoint, replace the contents of these functions
 * to use Microsoft Graph API calls.
 * 
 * Mapping Strategy:
 * - List Name: "MDJ_Activites"
 * - Columns: 
 *    - Title (Text)
 *    - ActivityDate (DateTime)
 *    - JSON_Data (Multi-line text, stores the full Activity object)
 */

export const ActivityService = {
  /**
   * Loads all activities.
   * In SharePoint context: GET /sites/{site-id}/lists/{list-id}/items
   */
  getAll: async (): Promise<Activity[]> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as Activity[];
    } catch (error) {
      console.error("Database load error", error);
      return [];
    }
  },

  /**
   * Saves or Updates an activity.
   * In SharePoint context: POST (create) or PATCH (update) to Graph API.
   */
  save: async (activity: Activity): Promise<void> => {
    try {
      const current = await ActivityService.getAll();
      const index = current.findIndex(a => a.id === activity.id);
      
      let updated = [...current];
      if (index >= 0) {
        updated[index] = activity;
      } else {
        updated.push(activity);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Database save error", error);
      throw new Error("Impossible de sauvegarder l'activité.");
    }
  },

  /**
   * Bulk save (used for import or auto-planning).
   */
  saveAll: async (activities: Activity[]): Promise<void> => {
     try {
       localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
     } catch (error) {
       console.error("Database bulk save error", error);
     }
  },

  /**
   * Deletes an activity.
   */
  delete: async (id: string): Promise<void> => {
    try {
      const current = await ActivityService.getAll();
      const updated = current.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Database delete error", error);
    }
  },

  /**
   * Resets the database completely.
   */
  reset: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY);
  }
};