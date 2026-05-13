
import csv
import json
import argparse
import sys

# Field Mapping Configuration
SCHEMA_MAPPING = {
    "firstName": "Membre - Prénom",
    "lastName": "Membre - Nom",
    "email": "Membre - Courriel", 
    "phone": "Membre - Téléphone"
}

def map_role(category, clientele):
    role = 'MEMBER'
    category = str(category or "")
    clientele = str(clientele or "")
    if 'Employés' in clientele or 'Personnel' in clientele:
        role = 'STAFF'
    elif 'Conseil d\'administration' in clientele or 'Membre du CA' in clientele:
        role = 'ADMIN'
    elif 'Bénévoles' in category or 'Bénévole' in clientele:
        role = 'VOLUNTEER'
    elif 'Partenaire' in category or 'Partenaire' in clientele:
        role = 'PARTNER'
    return role

def extract_reliable_email(row):
    email = row.get('Membre - Courriel', '')
    if not email or '@' not in email:
        for k, v in row.items():
            if v and '@' in v and ('.' in v.split('@')[1]):
                return v.strip()
    return email.strip() if email else None

def extract_birthdate_from_ramq(ramq):
    if not ramq or len(ramq) < 10:
        return "2010-01-01", "Préfère ne pas répondre"
    
    try:
        # Format: XXXX YY MM DD XX
        # Index:  0123 45 67 89 01
        year_str = ramq[4:6]
        month_str = ramq[6:8]
        day_str = ramq[8:10]
        
        year_val = int(year_str)
        month_val = int(month_str)
        day_val = int(day_str)
        
        gender = "Garçon"
        if month_val > 50:
            gender = "Fille"
            month_val -= 50
            
        # Determine century (Assume youth project: 2000s)
        # If year is small (e.g. 05) -> 2005. If large (e.g. 95) -> 1995.
        century = 2000 if year_val < 30 else 1900
        full_year = century + year_val
        
        return f"{full_year}-{month_val:02d}-{day_val:02d}", gender
    except Exception:
        return "2010-01-01", "Préfère ne pas répondre"

def import_csv(csv_path, key_path, dry_run=True):
    # Conditional import to allow dry-run without library
    db = None
    auth = None
    if not dry_run:
        try:
            import firebase_admin
            from firebase_admin import credentials, auth, firestore
            cred = credentials.Certificate(key_path)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
        except ImportError:
            print("Error: firebase-admin library not installed. Cannot run in execution mode.")
            sys.exit(1)
    else:
        print("[DRY RUN] No Firebase initialization")

    processed_count = 0
    success_count = 0
    error_count = 0

    try:
        with open(csv_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f, delimiter=';')
            
            for row in reader:
                processed_count += 1
                email = extract_reliable_email(row)
                
                if not email:
                    print(f"Row {processed_count}: Missing email for {row.get('Membre - Nom')}. Skipping.")
                    error_count += 1
                    continue

                first_name = row.get("Membre - Prénom", "")
                last_name = row.get("Membre - Nom", "")
                cat = row.get("Membre - Catégorie d'âge du membre", "")
                clientele = row.get("Membre - Clientèles", "")
                role = map_role(cat, clientele)
                
                ramq = row.get("Membre - Numéro d'Assurance Maladie", "")
                birth_date, gender = extract_birthdate_from_ramq(ramq)
                
                # Create Profile Object
                profile = {
                    "firstName": first_name,
                    "lastName": last_name,
                    "email": email,
                    "role": role,
                    "birthDate": birth_date,
                    "gender": gender,
                    "address": {
                        "street": row.get("Membre - Adresse", ""),
                        "city": row.get("Membre - Ville", "Trois-Rivières"),
                        "postalCode": row.get("Membre - Code postal", "")
                    },
                    "medical": {
                        "allergies": [row.get("Membre - Allergies connues")] if row.get("Membre - Allergies connues") and row.get("Membre - Allergies connues").lower() != 'non' else [],
                        "conditions": []
                    },
                    "school": row.get("Membre - École") if row.get("Membre - École") and row.get("Membre - École").lower() != 'na' else None,
                    "metadata": {
                        "membershipStatus": "ACTIVE",
                        "importSource": "Yapla_CSV_2026"
                    }
                }

                if dry_run:
                    if success_count < 3:
                        print(f"[DRY RUN] Found: {email} | Role: {role} | BD: {birth_date} | G: {gender} | Name: {first_name} {last_name}")
                    success_count += 1
                else:
                    try:
                        # 1. Create/Update Auth User
                        try:
                            user = auth.get_user_by_email(email)
                            uid = user.uid
                            print(f"User {email} exists. Updating password to ChangeMoi2026!")
                            auth.update_user(uid, password="ChangeMoi2026!")
                        except Exception: 
                            user = auth.create_user(
                                email=email,
                                display_name=f"{first_name} {last_name}".strip(),
                                password="ChangeMoi2026!" 
                            )
                            uid = user.uid
                            print(f"Created new Auth user: {email} (UID: {uid})")

                        # 2. Create/Update Firestore Profile in Planner Database
                        # We use 'sync_youth_profiles' which is allowed for write in the planner's rules
                        profile["uid"] = uid
                        db.collection("sync_youth_profiles").document(uid).set(profile, merge=True)
                        success_count += 1

                    except Exception as e:
                        print(f"Error processing {email}: {e}")
                        error_count += 1

    except Exception as e:
        print(f"Fatal error reading CSV: {e}")
        return

    print(f"\n--- Import Summary ---")
    print(f"Processed: {processed_count}")
    print(f"Success:   {success_count}")
    print(f"Errors:    {error_count}")
    print(f"Mode:      {'DRY RUN' if dry_run else 'PRODUCTION'}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import Yapla members to Firebase")
    parser.add_argument("--csv", required=True, help="Path to Yapla CSV")
    parser.add_argument("--key", help="Path to Firebase Service Account Key JSON")
    parser.add_argument("--execute", action="store_true", help="Actually run the import (otherwise dry-run)")
    
    args = parser.parse_args()
    
    if args.execute and not args.key:
        print("Error: --key is required when --execute is used.")
        sys.exit(1)
        
    import_csv(args.csv, args.key, dry_run=not args.execute)
