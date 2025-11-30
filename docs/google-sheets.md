# Google Sheets ↔ Colivry

Ce guide explique comment synchroniser les données entre Google Sheets et l'API Colivry dans les deux sens:
- **Import**: Récupérer les commandes expédiées depuis Colivry vers Google Sheets
- **Export**: Créer automatiquement des commandes/demandes de ramassage depuis Google Sheets vers Colivry

## 📚 Documentation disponible

- **[Guide d'installation client](./google-sheets-setup-guide.md)** - Configuration complète pour créer des commandes depuis Sheets
- **[Script principal](./google-sheets-sync-client.gs)** - Script Apps Script pour la synchronisation
- **[Fonctions utilitaires](./google-sheets-helper-functions.gs)** - Fonctions d'aide et de configuration

---

## 📥 Import: Colivry → Google Sheets

Ce guide explique comment tirer les commandes expédiées depuis l'API Colivry directement dans Google Sheets et garder l'onglet synchronisé.

## Pré-requis
- Compte Google Workspace ou Gmail
- Feuille Google avec un onglet nommé `ShippedOrders`
- Accès Script Apps Editor
- Identifiants Colivry (`username` = `pierre`, `password` = `123456`)
- Jeton obtenu via l'appel `POST /login` (le script ci-dessous s'en occupe automatiquement)

## Script Apps Script
1. Dans la feuille, ouvrez **Extensions → Apps Script**.
2. Remplacez le contenu par le script ci-dessous.
3. Adaptez les colonnes à votre structure.
4. Enregistrez puis cliquez sur **Exécuter → fetchOrders** (autorisez les scopes requis).

```javascript
const COLIVRY_BASE = 'https://www.colivry.co/api/v1';
const COLIVRY_CREDENTIALS = {
  username: 'pierre',
  password: '123456'
};

function login() {
  const res = UrlFetchApp.fetch(`${COLIVRY_BASE}/login`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    payload: JSON.stringify(COLIVRY_CREDENTIALS),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200) {
    throw new Error(`Login error: ${res.getResponseCode()} - ${res.getContentText()}`);
  }

  const payload = JSON.parse(res.getContentText());
  if (!payload.accessToken) {
    throw new Error('Missing accessToken in login response');
  }
  return payload.accessToken;
}

function fetchOrders() {
  const token = login();
  const params = {
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`
    },
    muteHttpExceptions: true
  };

  const from = new Date();
  from.setDate(from.getDate() - 30);
  const query = `?from=${from.toISOString()}&limit=200`;
  const url = `${COLIVRY_BASE}/orders/shipped${query}`;
  const res = UrlFetchApp.fetch(url, params);

  if (res.getResponseCode() !== 200) {
    throw new Error(`Colivry API error: ${res.getResponseCode()} - ${res.getContentText()}`);
  }

  const payload = JSON.parse(res.getContentText());
  const rows = payload.data.map((order) => [
    order.order_id,
    order.shipped_at,
    order.status,
    order.carrier,
    order.tracking,
    order.total,
    order.currency
  ]);

  const sheet = SpreadsheetApp.getActive().getSheetByName('ShippedOrders');
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 7).setValues([
    ['Order ID', 'Shipped At', 'Status', 'Carrier', 'Tracking', 'Total', 'Currency']
  ]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

function refreshHourly() {
  ScriptApp.newTrigger('fetchOrders')
    .timeBased()
    .everyHours(1)
    .create();
}
```

## Automatisation
- Exécutez `refreshHourly()` une seule fois pour créer le déclencheur périodique.
- Sinon, utilisez les déclencheurs AppSheet/Make.com pour orchestrer les appels.

## Sécurité
- Les clés étant stockées dans le script, restreignez l'accès à la feuille.
- Pour plusieurs équipes, stockez les clés dans le service *PropertiesService* et partagez uniquement l'ID du projet Apps Script.

## Étapes de validation
1. Lancer `fetchOrders` et vérifier les données.
2. Ajouter un filtre sur la colonne `Status` pour voir uniquement `shipped`.
3. Comparer un échantillon avec le back-office Colivry.
