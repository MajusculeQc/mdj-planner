
import csv
import json
import re

csv_path = r'C:\Users\user\MDJPLANNER\mdj-planner\Documents\Yapla - Membres - Liste des inscriptions de membres - 251211-1656 - 258779.csv'
preview = []

try:
    with open(csv_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f, delimiter=';')
        
        count = 0
        for row in reader:
            if count >= 3:
                break
            
            # 1. Clean email (heuristic)
            email = row.get('Membre - Courriel', '')
            if not email or '@' not in email:
                # Search all columns for something that looks like an email
                for k, v in row.items():
                    if v and '@' in v and ('.' in v.split('@')[1]):
                        email = v
                        break
            
            # 2. Map Role
            cat = row.get("Membre - Catégorie d'âge du membre", "")
            clientele = row.get("Membre - Clientèles", "")
            
            role = 'MEMBER'
            if 'Employés' in clientele or 'Personnel' in clientele:
                role = 'STAFF'
            elif 'Conseil d\'administration' in clientele or 'Membre du CA' in clientele:
                role = 'ADMIN'
            elif 'Bénévoles' in cat or 'Bénévole' in clientele:
                role = 'VOLUNTEER'
            elif 'Partenaire' in cat or 'Partenaire' in clientele:
                role = 'PARTNER'

            # 3. Create UserProfile structure (partial mapping)
            user_profile = {
                "firstName": row.get("Membre - Prénom"),
                "lastName": row.get("Membre - Nom"),
                "email": email,
                "role": role,
                "birthDate": "", 
                "address": {
                    "street": row.get("Membre - Adresse"),
                    "city": row.get("Membre - Ville"),
                    "postalCode": row.get("Membre - Code postal")
                },
                "medical": {
                    "allergies": [row.get("Membre - Allergies connues")] if row.get("Membre - Allergies connues") and row.get("Membre - Allergies connues").lower() != 'non' else [],
                },
                "school": row.get("Membre - École") if row.get("Membre - École") and row.get("Membre - École").lower() != 'na' else None,
                "_source": {
                    "age_category": cat,
                    "clientele": clientele
                }
            }
            
            preview.append(user_profile)
            count += 1

    print("=== MAPPING PREVIEW (First 3 Records) ===")
    print(json.dumps(preview, indent=2, ensure_ascii=False))
    print("=========================================")

except Exception as e:
    print(f"Error processing CSV: {e}")
