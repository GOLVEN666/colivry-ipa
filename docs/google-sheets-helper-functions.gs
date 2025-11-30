/**
 * Fonctions utilitaires pour la synchronisation Google Sheets → Colivry
 * 
 * Ces fonctions aident à configurer et maintenir la synchronisation
 */

// ==================== GESTION SÉCURISÉE DES IDENTIFIANTS ====================

/**
 * Stocke les identifiants de manière sécurisée
 * Exécutez cette fonction UNE SEULE FOIS pour configurer vos identifiants
 */
function setupCredentials() {
  const properties = PropertiesService.getScriptProperties();
  
  // Remplacez par vos identifiants réels
  properties.setProperty('COLIVRY_USERNAME', 'VOTRE_USERNAME');
  properties.setProperty('COLIVRY_PASSWORD', 'VOTRE_PASSWORD');
  
  Logger.log('✓ Identifiants configurés avec succès');
  Logger.log('⚠️ Supprimez cette fonction après la première exécution pour plus de sécurité');
}

/**
 * Récupère les identifiants de manière sécurisée
 */
function getCredentials() {
  const properties = PropertiesService.getScriptProperties();
  return {
    username: properties.getProperty('COLIVRY_USERNAME'),
    password: properties.getProperty('COLIVRY_PASSWORD')
  };
}

// ==================== RÉCUPÉRATION DES VILLES ====================

/**
 * Récupère la liste des villes depuis l'API Colivry
 * Utile pour remplir automatiquement CITY_MAPPING
 */
function fetchCitiesFromAPI() {
  try {
    const COLIVRY_BASE = 'https://www.colivry.co/api/v1';
    const credentials = getCredentials();
    
    // Login
    const loginResponse = UrlFetchApp.fetch(`${COLIVRY_BASE}/login`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      payload: JSON.stringify(credentials),
      muteHttpExceptions: true
    });

    if (loginResponse.getResponseCode() !== 200) {
      throw new Error(`Erreur login: ${loginResponse.getResponseCode()}`);
    }

    const loginData = JSON.parse(loginResponse.getContentText());
    const token = loginData.accessToken;

    // Récupérer les villes
    const citiesResponse = UrlFetchApp.fetch(`${COLIVRY_BASE}/cities`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    });

    if (citiesResponse.getResponseCode() !== 200) {
      throw new Error(`Erreur récupération villes: ${citiesResponse.getResponseCode()}`);
    }

    const citiesData = JSON.parse(citiesResponse.getContentText());
    
    // Afficher le mapping pour copier-coller
    Logger.log('=== CITY_MAPPING ===');
    Logger.log('const CITY_MAPPING = {');
    
    if (citiesData.data && Array.isArray(citiesData.data)) {
      citiesData.data.forEach(city => {
        const cityName = city.city_name?.toUpperCase() || city.name?.toUpperCase() || '';
        Logger.log(`  '${cityName}': { key: '${city.key}', name: '${city.city_name || city.name}' },`);
      });
    }
    
    Logger.log('};');
    
    return citiesData;
  } catch (error) {
    Logger.log(`Erreur: ${error.message}`);
    throw error;
  }
}

// ==================== RÉCUPÉRATION DES SECTEURS ====================

/**
 * Récupère la liste des secteurs depuis l'API Colivry
 */
function fetchSectorsFromAPI() {
  try {
    const COLIVRY_BASE = 'https://www.colivry.co/api/v1';
    const credentials = getCredentials();
    
    // Login
    const loginResponse = UrlFetchApp.fetch(`${COLIVRY_BASE}/login`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      payload: JSON.stringify(credentials),
      muteHttpExceptions: true
    });

    if (loginResponse.getResponseCode() !== 200) {
      throw new Error(`Erreur login: ${loginResponse.getResponseCode()}`);
    }

    const loginData = JSON.parse(loginResponse.getContentText());
    const token = loginData.accessToken;

    // Récupérer les secteurs (si l'endpoint existe)
    const sectorsResponse = UrlFetchApp.fetch(`${COLIVRY_BASE}/sectors`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    });

    if (sectorsResponse.getResponseCode() !== 200) {
      Logger.log(`Endpoint /sectors non disponible (${sectorsResponse.getResponseCode()})`);
      return null;
    }

    const sectorsData = JSON.parse(sectorsResponse.getContentText());
    Logger.log('Secteurs récupérés:', JSON.stringify(sectorsData, null, 2));
    
    return sectorsData;
  } catch (error) {
    Logger.log(`Erreur: ${error.message}`);
    return null;
  }
}

// ==================== VALIDATION DES DONNÉES ====================

/**
 * Valide une ligne de données avant synchronisation
 * @param {Array} row - Ligne de données
 * @returns {Object} {valid: boolean, errors: Array}
 */
function validateRow(row) {
  const errors = [];
  
  // Vérifier les champs obligatoires
  if (!row[0] || row[0].toString().trim() === '') {
    errors.push('Article manquant');
  }
  
  if (!row[3] || row[3].toString().trim() === '') {
    errors.push('Téléphone manquant');
  }
  
  if (!row[4] || row[4].toString().trim() === '') {
    errors.push('Adresse manquante');
  }
  
  if (!row[5] || row[5].toString().trim() === '') {
    errors.push('Destinataire manquant');
  }
  
  // Vérifier le format du téléphone (optionnel)
  const phone = String(row[3]).trim();
  if (phone && !/^0\d{9}$/.test(phone)) {
    errors.push('Format téléphone invalide (doit être 0XXXXXXXXX)');
  }
  
  // Vérifier que quantité et prix sont des nombres
  const quantity = row[1];
  if (quantity && isNaN(Number(quantity))) {
    errors.push('Quantité doit être un nombre');
  }
  
  const price = row[2];
  if (price && isNaN(Number(price))) {
    errors.push('Prix doit être un nombre');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// ==================== LOGS ET RAPPORTS ====================

/**
 * Génère un rapport de synchronisation
 */
function generateSyncReport() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Commandes');
  if (!sheet) {
    Logger.log('Feuille "Commandes" introuvable');
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    Logger.log('Aucune donnée dans la feuille');
    return;
  }

  const statusRange = sheet.getRange(2, 11, lastRow - 1, 1); // Colonne K (Statut)
  const statuses = statusRange.getValues().flat();
  
  const synced = statuses.filter(s => s === 'SYNCED' || s === 'OK' || s === '✓').length;
  const errors = statuses.filter(s => s === 'ERROR' || s.toString().startsWith('ERROR')).length;
  const pending = statuses.filter(s => !s || s === '').length;
  
  Logger.log('=== RAPPORT DE SYNCHRONISATION ===');
  Logger.log(`Total lignes: ${lastRow - 1}`);
  Logger.log(`✓ Synchronisées: ${synced}`);
  Logger.log(`✗ Erreurs: ${errors}`);
  Logger.log(`⏳ En attente: ${pending}`);
  
  return {
    total: lastRow - 1,
    synced: synced,
    errors: errors,
    pending: pending
  };
}

// ==================== NETTOYAGE ====================

/**
 * Réinitialise le statut de toutes les lignes (pour re-synchronisation)
 * ⚠️ Utilisez avec précaution
 */
function resetAllStatuses() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Commandes');
  if (!sheet) {
    Logger.log('Feuille "Commandes" introuvable');
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return;
  }

  const statusRange = sheet.getRange(2, 11, lastRow - 1, 1);
  statusRange.clearContent();
  Logger.log(`✓ Statuts réinitialisés pour ${lastRow - 1} lignes`);
}

/**
 * Supprime uniquement les statuts "SYNCED" pour re-synchroniser
 */
function resetSyncedStatuses() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Commandes');
  if (!sheet) {
    Logger.log('Feuille "Commandes" introuvable');
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return;
  }

  const dataRange = sheet.getRange(2, 11, lastRow - 1, 1);
  const statuses = dataRange.getValues();
  
  let resetCount = 0;
  statuses.forEach((status, index) => {
    if (status[0] === 'SYNCED' || status[0] === 'OK' || status[0] === '✓') {
      sheet.getRange(index + 2, 11).clearContent();
      resetCount++;
    }
  });
  
  Logger.log(`✓ ${resetCount} statuts "SYNCED" réinitialisés`);
}

