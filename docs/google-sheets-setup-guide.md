# Guide de Configuration - Système Colivry Google Sheets

## 📋 Vue d'ensemble

Ce système crée automatiquement un Google Sheet complet avec dashboard et synchronisation bidirectionnelle avec l'API Colivry.

## 🚀 Installation Rapide

### Étape 1 : Créer un nouveau Google Sheet
1. Allez sur [Google Sheets](https://sheets.google.com)
2. Créez un nouveau tableur
3. Nommez-le "Colivry Dashboard" (ou un nom de votre choix)

### Étape 2 : Ajouter le script Google Apps Script
1. Dans votre Google Sheet, allez dans **Extensions** → **Apps Script**
2. Supprimez le code par défaut
3. Copiez-collez le contenu du fichier `google-sheets-sync-client.gs`
4. Enregistrez le projet (Ctrl+S ou Cmd+S)

### Étape 3 : Configurer les identifiants
1. Dans l'éditeur Apps Script, exécutez la fonction `setupCredentials()`
2. Modifiez les lignes dans le code :
   ```javascript
   properties.setProperty('COLIVRY_USERNAME', 'VOTRE_USERNAME');
   properties.setProperty('COLIVRY_PASSWORD', 'VOTRE_PASSWORD');
   ```
3. Remplacez `VOTRE_USERNAME` et `VOTRE_PASSWORD` par vos identifiants Colivry réels
4. Ré-exécutez `setupCredentials()`
5. ⚠️ **Important** : Supprimez ou commentez la fonction `setupCredentials()` après configuration pour plus de sécurité

### Étape 4 : Initialiser le système
1. Exécutez la fonction `setupColivrySheet()`
2. Cette fonction va créer automatiquement tous les onglets nécessaires :
   - **Dashboard** : Vue d'ensemble et statistiques
   - **Nouveaux Colis** : Pour créer de nouveaux colis
   - **Ramassages** : Pour créer des demandes de ramassage
   - **Tous Colis** : Liste de tous les colis
   - **Colis Expédiés** : Colis en transit
   - **Colis Livrés** : Colis livrés
   - **Colis Retournés** : Colis retournés
   - **Changement Adresse** : Demandes de changement d'adresse
   - **Remboursements** : Demandes de remboursement
   - **Villes** : Référence des villes disponibles
   - **Config** : Configuration du système

## 📊 Utilisation

### Tester la connexion
Exécutez la fonction `testConnection()` pour vérifier que vos identifiants fonctionnent.

### Ajouter un nouveau colis
1. Allez dans l'onglet **Nouveaux Colis**
2. Remplissez les colonnes :
   - **Article** (obligatoire)
   - **Quantité** (obligatoire, > 0)
   - **Prix** (optionnel, >= 0)
   - **Téléphone** (obligatoire)
   - **Ville** (sélection dans la liste déroulante)
   - **Adresse** (obligatoire)
   - **Nom du client** (obligatoire)
   - **Remarque** (optionnel)
3. Exécutez `syncNouveauxColis()` pour synchroniser vers Colivry
4. La colonne **Statut Sync** indiquera "SYNCED" en cas de succès

### Créer une demande de ramassage
1. Allez dans l'onglet **Ramassages**
2. Remplissez les colonnes (similaire aux nouveaux colis)
3. Exécutez `syncRamassages()` pour synchroniser

### Synchroniser depuis Colivry
Exécutez `syncAllFromColivry()` pour récupérer toutes les données depuis l'API Colivry et mettre à jour tous les onglets.

### Supprimer un colis
Utilisez la fonction `deleteOrder(orderId)` en remplaçant `orderId` par l'ID du colis (ex: "CLV-20251129225306073").

## 🔧 Fonctions Disponibles

### Configuration
- `setupCredentials()` : Configure les identifiants (à exécuter une seule fois)
- `setupColivrySheet()` : Crée tous les onglets du système
- `testConnection()` : Teste la connexion à l'API

### Synchronisation vers Colivry
- `syncNouveauxColis()` : Synchronise les nouveaux colis
- `syncRamassages()` : Synchronise les ramassages

### Synchronisation depuis Colivry
- `syncAllFromColivry()` : Synchronise tous les onglets depuis l'API
- `syncOrdersFromAPI(token, sheetName, endpoint)` : Synchronise un type spécifique de commandes
- `updateDashboard(userData)` : Met à jour le dashboard
- `updateStatistics(token)` : Met à jour les statistiques

### Utilitaires
- `deleteOrder(orderId)` : Supprime un colis par son ID
- `login()` : Authentification (utilisée automatiquement)
- `getUserData(token)` : Récupère les données utilisateur

## 📝 Structure des Onglets

### Nouveaux Colis
Colonnes :
1. Article (obligatoire)
2. Quantité (obligatoire, validation: > 0)
3. Prix (validation: >= 0)
4. Téléphone (obligatoire)
5. Ville (liste déroulante)
6. Boutique
7. Secteur
8. Adresse (obligatoire)
9. Nom du client (obligatoire)
10. Remarque
11. Demande Remboursement (TRUE/FALSE)
12. Statut Sync (SYNCED/ERROR)
13. ID Colivry (rempli automatiquement)
14. Date Création
15. Date Sync

### Ramassages
Colonnes similaires avec :
- Destinataire
- Client Prénom
- Client Nom

## ⚠️ Notes Importantes

1. **Sécurité** : Les identifiants sont stockés dans Script Properties (sécurisé). Ne les partagez jamais dans le code.

2. **Validation** : Les colonnes avec validation de données (Ville, Quantité, Prix) empêchent la saisie de valeurs invalides.

3. **Synchronisation** : 
   - Les lignes avec "SYNCED" dans la colonne Statut ne seront pas re-synchronisées
   - Pour re-synchroniser, effacez la colonne Statut

4. **Villes** : L'onglet "Villes" contient la liste complète des villes. Les clés API peuvent être récupérées via l'API si nécessaire.

5. **Permissions** : Le système fonctionne avec les permissions du rôle "Client". Assurez-vous que votre compte a les permissions nécessaires.

## 🔄 Automatisation

Pour automatiser la synchronisation, vous pouvez créer un déclencheur :
```javascript
function setupAutoSync() {
  ScriptApp.newTrigger('syncAllFromColivry')
    .timeBased()
    .everyHours(1)
    .create();
}
```

## 🐛 Dépannage

### Erreur "Identifiants non configurés"
→ Exécutez `setupCredentials()` et configurez vos identifiants

### Erreur de connexion
→ Vérifiez vos identifiants avec `testConnection()`

### Synchronisation échoue
→ Vérifiez que tous les champs obligatoires sont remplis
→ Vérifiez les logs dans l'éditeur Apps Script (Exécutions)

### Onglets manquants
→ Exécutez `setupColivrySheet()` pour recréer tous les onglets

## 📞 Support

Pour toute question ou problème, consultez la documentation de l'API Colivry ou contactez le support.
