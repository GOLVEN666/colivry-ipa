# 📊 Synchronisation Google Sheets ↔ Colivry API

Système complet de synchronisation bidirectionnelle entre Google Sheets et l'API Colivry pour les clients.

## 🎯 Objectif

Automatiser la création de commandes et demandes de ramassage dans Colivry directement depuis Google Sheets. Lorsqu'une nouvelle ligne est ajoutée dans la feuille, elle est automatiquement synchronisée avec l'API Colivry.

## 📁 Fichiers disponibles

### 1. **Script principal**
📄 [`google-sheets-sync-client.gs`](./google-sheets-sync-client.gs)
- Script Apps Script complet
- Fonctions de synchronisation automatique
- Support POST /orders et POST /pickup-requests
- Gestion des erreurs et statuts

### 2. **Guide d'installation**
📄 [`google-sheets-setup-guide.md`](./google-sheets-setup-guide.md)
- Instructions étape par étape
- Configuration détaillée
- Format des données
- Dépannage

### 3. **Fonctions utilitaires**
📄 [`google-sheets-helper-functions.gs`](./google-sheets-helper-functions.gs)
- Récupération automatique des villes
- Validation des données
- Rapports de synchronisation
- Gestion sécurisée des identifiants

### 4. **Import Colivry → Sheets**
📄 [`google-sheets.md`](./google-sheets.md)
- Récupération des commandes expédiées
- Synchronisation périodique

## 🚀 Démarrage rapide

1. **Ouvrez Google Sheets** et créez une nouvelle feuille
2. **Extensions → Apps Script**
3. **Copiez** le contenu de `google-sheets-sync-client.gs`
4. **Configurez** vos identifiants Colivry
5. **Exécutez** `testConnection()` pour tester
6. **Exécutez** `syncOrdersToColivry()` pour synchroniser

## 📋 Structure de la feuille

| Article | Quantité | Prix | Téléphone | Adresse | Destinataire | Ville | Secteur | Boutique | Remarque | Statut | Prénom Client | Nom Client | Demande Remboursement |
|---------|----------|------|-----------|---------|--------------|-------|---------|----------|----------|--------|---------------|------------|----------------------|

## ⚙️ Fonctions principales

### Synchronisation
- `syncOrdersToColivry()` - Crée des commandes (POST /orders)
- `syncPickupRequestsToColivry()` - Crée des demandes de ramassage (POST /pickup-requests)

### Configuration
- `testConnection()` - Teste la connexion API
- `setupCredentials()` - Configure les identifiants de manière sécurisée
- `initializeSheet()` - Initialise la feuille avec les en-têtes

### Utilitaires
- `fetchCitiesFromAPI()` - Récupère la liste des villes
- `validateRow()` - Valide une ligne avant synchronisation
- `generateSyncReport()` - Génère un rapport de synchronisation

### Automatisation
- `setupAutoSync()` - Configure la synchronisation automatique (toutes les 5 min)
- `onEdit()` - Synchronise automatiquement à l'édition

## 🔐 Sécurité

Pour une meilleure sécurité, utilisez `PropertiesService` au lieu de stocker les identifiants directement dans le code:

```javascript
// Exécutez setupCredentials() UNE SEULE FOIS
function setupCredentials() {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('COLIVRY_USERNAME', 'votre_username');
  properties.setProperty('COLIVRY_PASSWORD', 'votre_password');
}
```

Puis modifiez `getCredentials()` dans le script principal pour utiliser:
```javascript
function getCredentials() {
  const properties = PropertiesService.getScriptProperties();
  return {
    username: properties.getProperty('COLIVRY_USERNAME'),
    password: properties.getProperty('COLIVRY_PASSWORD')
  };
}
```

## 📝 Exemple d'utilisation

1. Ajoutez une ligne dans votre feuille:
   ```
   Article: "T-shirt rouge"
   Quantité: 2
   Prix: 120
   Téléphone: "0662716901"
   Adresse: "E 46 N 16 20010 Casablanca"
   Destinataire: "Ahmed Benali"
   Ville: "CASABLANCA"
   ```

2. Exécutez `syncOrdersToColivry()`

3. La colonne "Statut" sera mise à jour avec "SYNCED" ✅

## 🏙️ Configuration des villes

Les villes doivent être configurées dans `CITY_MAPPING`. Pour obtenir les clés:

1. Exécutez `fetchCitiesFromAPI()` dans Apps Script
2. Copiez le mapping généré dans les logs
3. Collez-le dans `CITY_MAPPING` du script principal

## 📞 Support

- Consultez le [guide d'installation](./google-sheets-setup-guide.md) pour les détails
- Vérifiez les logs dans Apps Script (View → Logs)
- Testez avec `testConnection()` pour diagnostiquer les problèmes

## 🔄 Workflow recommandé

1. **Configuration initiale**
   - Créer la feuille Google
   - Configurer Apps Script
   - Tester la connexion

2. **Configuration des villes**
   - Exécuter `fetchCitiesFromAPI()`
   - Mettre à jour `CITY_MAPPING`

3. **Premier test**
   - Ajouter une ligne de test
   - Exécuter `syncOrdersToColivry()`
   - Vérifier le statut

4. **Automatisation**
   - Exécuter `setupAutoSync()` pour la synchronisation périodique
   - Ou configurer `onEdit` pour la synchronisation à l'édition

## 📊 Suivi

La colonne **Statut** permet de suivre:
- ✅ **SYNCED** - Synchronisé avec succès
- ❌ **ERROR** - Erreur lors de la synchronisation
- ⏳ **Vide** - En attente de synchronisation

Utilisez `generateSyncReport()` pour obtenir un rapport complet.

