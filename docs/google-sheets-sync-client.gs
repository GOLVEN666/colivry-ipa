/**
 * Google Apps Script - Système complet de synchronisation Colivry
 * 
 * Ce script crée automatiquement un Google Sheet avec dashboard et synchronisation
 * bidirectionnelle avec l'API Colivry.
 * 
 * FONCTIONS PRINCIPALES:
 * - setupColivrySheet() : Crée le Google Sheet complet avec tous les onglets
 * - Synchronisation automatique des données
 * - Dashboard interactif
 * - Gestion complète des villes, secteurs, boutiques
 */

// ==================== CONFIGURATION ====================
const COLIVRY_BASE = 'https://www.colivry.co/api/v1';

// Récupération sécurisée des identifiants
function getCredentials() {
  const properties = PropertiesService.getScriptProperties();
  const username = properties.getProperty('COLIVRY_USERNAME');
  const password = properties.getProperty('COLIVRY_PASSWORD');
  
  if (!username || !password || username === 'VOTRE_USERNAME') {
    throw new Error('⚠️ Identifiants non configurés. Exécutez setupCredentials() d\'abord.');
  }
  
  return { username, password };
}

// Configuration des identifiants (à exécuter UNE SEULE FOIS)
function setupCredentials() {
  const properties = PropertiesService.getScriptProperties();
  
  // ⚠️ REMPLACEZ PAR VOS IDENTIFIANTS RÉELS
  properties.setProperty('COLIVRY_USERNAME', 'VOTRE_USERNAME');
  properties.setProperty('COLIVRY_PASSWORD', 'VOTRE_PASSWORD');
  
  Logger.log('✓ Identifiants configurés');
  Logger.log('⚠️ Supprimez cette fonction après configuration pour plus de sécurité');
}

// Mapping complet des villes (basé sur la liste fournie)
const CITY_MAPPING = {
  'CASABLANCA': { key: 'f0625708-377c-4839-9c3f-d33fb086f03c', name: 'Casablanca' },
  'MARRAKECH': { key: '', name: 'Marrakech' },
  'RABAT': { key: '', name: 'Rabat' },
  'SALé': { key: '', name: 'Salé' },
  'TEMARA': { key: '', name: 'Temara' },
  'HARHOURA': { key: '', name: 'Harhoura' },
  'KENITRA': { key: '', name: 'Kenitra' },
  'FES': { key: '', name: 'Fes' },
  'MEKNES': { key: '', name: 'Meknes' },
  'TANGER': { key: '', name: 'Tanger' },
  'LARACH': { key: '', name: 'Larache' },
  'TéTOUANE': { key: '', name: 'Tétouane' },
  'M\'DIQ': { key: '', name: 'M\'diq' },
  'FNIDEQ': { key: '', name: 'Fnideq' },
  'MARTIL': { key: '', name: 'Martil' },
  'CAPO NEGRO': { key: '', name: 'Capo Negro' },
  'OUJDA': { key: '', name: 'Oujda' },
  'BOSKOURA': { key: '', name: 'Boskoura' },
  'MOHAMMEDIA': { key: '', name: 'Mohammedia' },
  'AIN HAROUDA': { key: '', name: 'Ain Harouda' },
  'TIT MELIL': { key: '', name: 'Tit Melil' },
  'DEROUA(DARWA)': { key: '', name: 'Deroua(Darwa)' },
  'MEDYOUNA': { key: '', name: 'Medyouna' },
  'DAR BOUAZA': { key: '', name: 'Dar Bouaza' },
  'TAMARIS': { key: '', name: 'Tamaris' },
  'EL JADIDA': { key: '', name: 'El Jadida' },
  'SAFI': { key: '', name: 'Safi' },
  'AGADIR': { key: '', name: 'Agadir' },
  'LAAYOUNE': { key: '', name: 'Laayoune' },
  'GUELMIM': { key: '', name: 'Guelmim' },
  'AIT MELLOUL': { key: '', name: 'Ait Melloul' },
  'INZEGANE': { key: '', name: 'Inzegane' },
  'BOUFEKRAN': { key: '', name: 'Boufekran' },
  'AGOURAI': { key: '', name: 'Agourai' },
  'EL HAJEB': { key: '', name: 'El Hajeb' },
  'MOULAY DRISS': { key: '', name: 'Moulay Driss' },
  'SBAAYOUN': { key: '', name: 'Sbaayoun' },
  'TAOUNAT': { key: '', name: 'Taounat' },
  'SEFROU': { key: '', name: 'Sefrou' },
  'KSAR EL KEBIR': { key: '', name: 'Ksar El Kebir' },
  'SETTAT': { key: '', name: 'Settat' },
  'KHEMISSET': { key: '', name: 'Khemisset' },
  'TANTAN': { key: '', name: 'Tantan' },
  'TANTAN PLAGE': { key: '', name: 'Tantan Plage' },
  'SIDI IFNI': { key: '', name: 'Sidi Ifni' },
  'BIZAKARNE': { key: '', name: 'Bizakarne' },
  'TIZNIT': { key: '', name: 'Tiznit' },
  'ESSMARA': { key: '', name: 'Essmara' },
  'HAD SOUALEM': { key: '', name: 'Had Soualem' },
  'AZEMOUR': { key: '', name: 'Azemour' },
  'SIDI BENNOUR': { key: '', name: 'Sidi Bennour' },
  'KHOURIBGA': { key: '', name: 'Khouribga' },
  'OUED ZEM': { key: '', name: 'Oued Zem' },
  'BOUJNIBA': { key: '', name: 'Boujniba' },
  'ERRACHIDIA': { key: '', name: 'Errachidia' },
  'ERFOUD': { key: '', name: 'Erfoud' },
  'RISSANI': { key: '', name: 'Rissani' },
  'AOUFOUS': { key: '', name: 'Aoufous' },
  'RICH': { key: '', name: 'Rich' },
  'MIDELT': { key: '', name: 'Midelt' },
  'GOULMIMA': { key: '', name: 'Goulmima' },
  'TINEJDAD': { key: '', name: 'Tinejdad' },
  'TINGHIR': { key: '', name: 'Tinghir' },
  'BéNI MELLAL': { key: '', name: 'Béni Mellal' },
  'SIDI JABER': { key: '', name: 'Sidi Jaber' },
  'BRADIYA': { key: '', name: 'Bradiya' },
  'FKIH BEN SALAH': { key: '', name: 'Fkih Ben Salah' },
  'SOUK SABT WLAD NEMMA': { key: '', name: 'Souk Sabt Wlad Nemma' },
  'WLAD ZMAM': { key: '', name: 'Wlad Zmam' },
  'WLAD MBARK': { key: '', name: 'Wlad Mbark' },
  'WLAD MOUSSA': { key: '', name: 'Wlad Moussa' },
  'KESBA TADLA': { key: '', name: 'Kesba Tadla' },
  'WLAD I3ICH': { key: '', name: 'Wlad I3ich' },
  'TAGZUIRT': { key: '', name: 'Tagzuirt' },
  'AIT ALI': { key: '', name: 'Ait Ali' },
  'IGHRAM LA3LAM': { key: '', name: 'Ighram La3lam' },
  'WLAD YOUSSEF': { key: '', name: 'Wlad Youssef' },
  'WLAD ISMAIL': { key: '', name: 'Wlad Ismail' },
  'KSSIBA': { key: '', name: 'Kssiba' },
  'BAJAâD': { key: '', name: 'Bajaâd' },
  'ZAOUIA CHEIKH': { key: '', name: 'Zaouia Cheikh' },
  'ZIDOUH': { key: '', name: 'Zidouh' },
  'WLAD IYAD': { key: '', name: 'Wlad Iyad' },
  'KHéNIFRA': { key: '', name: 'Khénifra' },
  'AFOURAR': { key: '', name: 'Afourar' },
  'BERCHID': { key: '', name: 'Berchid' },
  'NOUASSER': { key: '', name: 'Nouasser' },
  'ERRAHMA': { key: '', name: 'Errahma' },
  'HOUCEIMA': { key: '', name: 'Houceima' },
  'AJDIR': { key: '', name: 'Ajdir' },
  'IMZOURNE': { key: '', name: 'Imzourne' },
  'BENI BOUAYACH': { key: '', name: 'Beni Bouayach' },
  'BOUKIDARNE': { key: '', name: 'Boukidarne' },
  'AIT KARMA': { key: '', name: 'Ait Karma' },
  'NADOR': { key: '', name: 'Nador' },
  'AROUIT': { key: '', name: 'Arouit' },
  'SELOUANE': { key: '', name: 'Selouane' },
  'ZEGANGAN': { key: '', name: 'Zegangan' },
  'JAADAR': { key: '', name: 'Jaadar' },
  'TAOUIMA': { key: '', name: 'Taouima' },
  'ELBOUSTAN': { key: '', name: 'Elboustan' },
  'FERKHANA': { key: '', name: 'Ferkhana' },
  'BENINSAR': { key: '', name: 'Beninsar' },
  'TERAKAA': { key: '', name: 'Terakaa' },
  'ZAIO': { key: '', name: 'Zaio' },
  'CHEFCHAOUEN (CHAOUEN)': { key: '', name: 'Chefchaouen (Chaouen)' },
  'EL KELâA DES SRAGHNA': { key: '', name: 'El Kelâa des Sraghna' },
  'AïT OURIR': { key: '', name: 'Aït Ourir' },
  'BEN AHMED': { key: '', name: 'Ben Ahmed' },
  'LAAOUAMERA': { key: '', name: 'Laaouamera' },
  'DOUAR AL ARAB': { key: '', name: 'Douar Al Arab' },
  'ESSAOUIRA': { key: '', name: 'Essaouira' },
  'DIABAT': { key: '', name: 'Diabat' },
  'KHEMIS TAKATE': { key: '', name: 'Khemis Takate' },
  'OUNAGHA': { key: '', name: 'Ounagha' },
  'TLETA-EL HENCHANE': { key: '', name: 'Tleta-El Henchane' },
  'TAFETACHTE': { key: '', name: 'Tafetachte' },
  'HAD DRAA': { key: '', name: 'Had Draa' },
  'MEJJI': { key: '', name: 'Mejji' },
  'BIRKOUATE': { key: '', name: 'Birkouate' },
  'BOUIHATE': { key: '', name: 'Bouihate' },
  'TAMELAST': { key: '', name: 'Tamelast' },
  'BARAKAT RADI': { key: '', name: 'Barakat Radi' },
  'KHEMIS OULAD LHAJ': { key: '', name: 'Khemis Oulad Lhaj' },
  'AQUERMOUD': { key: '', name: 'Aquermoud' },
  'ZAOUIET BOUZERKTOUN': { key: '', name: 'Zaouiet Bouzerktoun' },
  'EL GHAZOUA': { key: '', name: 'El Ghazoua' },
  'SMIMOU': { key: '', name: 'Smimou' },
  'DOUAR TISGHARIN': { key: '', name: 'Douar Tisgharin' },
  'TAMANAR': { key: '', name: 'Tamanar' },
  'SIDI KAOUKI': { key: '', name: 'Sidi Kaouki' },
  'TIDZI': { key: '', name: 'Tidzi' },
  'BEN GUERIR': { key: '', name: 'Ben Guerir' },
  'TADOUART': { key: '', name: 'Tadouart' },
  'EL MAADER EL KABIR': { key: '', name: 'El Maader El Kabir' },
  'AIN BRAHIM OU SALEH': { key: '', name: 'Ain Brahim Ou Saleh' },
  'EL KSAIB': { key: '', name: 'El Ksaib' },
  'ANOU N AADOU': { key: '', name: 'Anou N Aadou' },
  'OULAD JERRAR': { key: '', name: 'Oulad Jerrar' },
  'SIDI OUAGAGUE': { key: '', name: 'Sidi Ouagague' },
  'TNINE AGLOU': { key: '', name: 'Tnine Aglou' },
  'ARBAA SAHEL': { key: '', name: 'Arbaa Sahel' },
  'BOUNAAMANE': { key: '', name: 'Bounaamane' },
  'ARBAA RASMOUKA': { key: '', name: 'Arbaa Rasmouka' },
  'SIDI BOUABDELLI': { key: '', name: 'Sidi Bouabdelli' },
  'MIRLEFT': { key: '', name: 'Mirleft' },
  'TIGHMI': { key: '', name: 'Tighmi' },
  'IDAOUSMLAL': { key: '', name: 'Idaousmlal' },
  'TAFRAOUT': { key: '', name: 'Tafraout' },
  'OUARZAZATE': { key: '', name: 'Ouarzazate' },
  'TAZA': { key: '', name: 'Taza' },
  'ASSILAH': { key: '', name: 'Assilah' },
  'AZROU': { key: '', name: 'Azrou' },
  'KELâAT M\'GOUNA': { key: '', name: 'Kelâat M\'gouna' },
  'KHMISS DADES': { key: '', name: 'Khmiss Dades' },
  'BOUMALNE DADES': { key: '', name: 'Boumalne Dades' },
  'TAMELLAT': { key: '', name: 'Tamellat' },
  'IFRI': { key: '', name: 'Ifri' },
  'AIT MAJBER': { key: '', name: 'Ait Majber' },
  'SERGHINE': { key: '', name: 'Serghine' },
  'SAHL GHARBIYA': { key: '', name: 'Sahl Gharbiya' },
  'AIT SEDRAT': { key: '', name: 'Ait Sedrat' },
  'HOUARA (Oulad taima)': { key: '', name: 'Houara (Oulad taima)' },
  'DAKHLA': { key: '', name: 'Dakhla' },
  'TAROUDANT': { key: '', name: 'Taroudant' },
  'SEBT EL GUERDANE': { key: '', name: 'Sebt El Guerdane' },
  'OULAD BERHIL': { key: '', name: 'Oulad Berhil' },
  'AOULOUZ': { key: '', name: 'Aoulouz' },
  'TALIOUINE': { key: '', name: 'Taliouine' },
  'IGHRAM': { key: '', name: 'Ighram' },
  'AIT AIAAZA': { key: '', name: 'Ait Aiaaza' },
  'TAZEMOURT': { key: '', name: 'Tazemourt' },
  'MASSA': { key: '', name: 'Massa' },
  'BELFAA': { key: '', name: 'Belfaa' },
  'BERKANE': { key: '', name: 'Berkane' },
  'MADAGH': { key: '', name: 'Madagh' },
  'AIN REGGADA': { key: '', name: 'Ain Reggada' },
  'CAFéMAURE': { key: '', name: 'Cafémaure' },
  'SAïDIA': { key: '', name: 'Saïdia' },
  'RAS KEBDANA': { key: '', name: 'Ras Kebdana' },
  'CAP-DE-L\'EAU': { key: '', name: 'Cap-de-l\'Eau' },
  'AKLIM': { key: '', name: 'Aklim' },
  'AHFIR': { key: '', name: 'Ahfir' },
  'KSSAR SGHIR': { key: '', name: 'Kssar Sghir' },
  'GUERCIF': { key: '', name: 'Guercif' },
  'TAOURIRT': { key: '', name: 'Taourirt' },
  'IFRAN': { key: '', name: 'Ifran' },
  'EL BOROUJ': { key: '', name: 'El Borouj' },
  'SOUK ELARBAA DU GHARB': { key: '', name: 'Souk Elarbaa Du Gharb' },
  'MECHRA BEL KSIRI': { key: '', name: 'Mechra Bel Ksiri' },
  'BOUARFA': { key: '', name: 'Bouarfa' },
  'JERADA': { key: '', name: 'Jerada' },
  'JAAFAR': { key: '', name: 'Jaafar' },
  'IHDADEN': { key: '', name: 'Ihdaden' },
  'BOUARGAOUI': { key: '', name: 'Bouargaoui' },
  'ARKMANE': { key: '', name: 'Arkmane' },
  'LAAYOUN CHARKIYA': { key: '', name: 'Laayoune Charkiya' },
  'SIDI KACEM': { key: '', name: 'Sidi Kacem' },
  'SIDI SLIMANE': { key: '', name: 'Sidi Slimane' },
  'CHICHAOUA': { key: '', name: 'Chichaoua' },
  'AZILAL': { key: '', name: 'Azilal' },
  'MISSOUR': { key: '', name: 'Missour' },
  'BOULMANE': { key: '', name: 'Boulmane' },
  'OUTAT EL HAJ': { key: '', name: 'Outat El Haj' },
  'IMOUZZER MARMOUCHA': { key: '', name: 'Imouzzer Marmoucha' },
  'TINDITE': { key: '', name: 'Tindite' },
  'AïT BLAL': { key: '', name: 'Aït Blal' },
  'EL KSABI': { key: '', name: 'El Ksabi' },
  'ENJIL': { key: '', name: 'Enjil' },
  'EL GARA': { key: '', name: 'El Gara' },
  'SIDI HEJJAJ': { key: '', name: 'Sidi Hejjaj' },
  'RASS AIN': { key: '', name: 'Rass Ain' },
  'SKHIRAT': { key: '', name: 'Skhirat' },
  'SIDI YAHYA': { key: '', name: 'Sidi Yahya' },
  'OUAZANE': { key: '', name: 'Ouazane' },
  'MOULAY BOUSELHAM': { key: '', name: 'Moulay Bouselham' },
  'SIDI TEYBI': { key: '', name: 'Sidi Teybi' },
  'TIFELT': { key: '', name: 'Tifelt' },
  'BOUZNIKA': { key: '', name: 'Bouznika' },
  'JORF ELMALHA': { key: '', name: 'Jorf Elmalha' },
  'HAD KORT': { key: '', name: 'Had Kort' },
  'AIN AOUDA': { key: '', name: 'Ain Aouda' },
  'TAMESNA': { key: '', name: 'Tamesna' },
  'AIN ATIK': { key: '', name: 'Ain Atik' },
  'SIDI YAHYA ZAER': { key: '', name: 'Sidi Yahya Zaer' },
  'YOUSSOUFIA': { key: '', name: 'Youssoufia' },
  'ATAOUIA': { key: '', name: 'Ataouia' },
  'RHAMNA': { key: '', name: 'Rhamna' },
  'NEZALA': { key: '', name: 'Nezala' },
  'SIDI BOUATMAN': { key: '', name: 'Sidi Bouatman' },
  'LOUDAYA': { key: '', name: 'Loudaya' },
  'LHOMER': { key: '', name: 'Lhomer' },
  'IMINTANOUTE': { key: '', name: 'Imintanoute' },
  'SIDI BIBI': { key: '', name: 'Sidi Bibi' },
  'AGDZ': { key: '', name: 'Agdz' },
  'SKOURA': { key: '', name: 'Skoura' },
  'TAZENAKHT': { key: '', name: 'Tazenakht' },
  'TARMIGTE': { key: '', name: 'Tarmigte' },
  'ZAWYA SIDI SMAIL': { key: '', name: 'Zawya Sidi Smail' },
  'HAD OULAD FRAJ': { key: '', name: 'Had Oulad Fraj' },
  'BIR JDID': { key: '', name: 'Bir Jdid' },
  'KHEMIS ZEMAMRA': { key: '', name: 'Khemis Zemamra' },
  'ASSA': { key: '', name: 'Assa' },
  'ZAG': { key: '', name: 'Zag' },
  'ECHEMMAIA': { key: '', name: 'Echemmaia' },
  'OUALIDIA': { key: '', name: 'Oualidia' },
  'M\'RIRT': { key: '', name: 'M\'rirt' },
  'BENSLIMANE': { key: '', name: 'Benslimane' },
  'ZAGORA': { key: '', name: 'Zagora' },
  'DEMNATE': { key: '', name: 'Demnate' },
  'BOJDOUR': { key: '', name: 'Bojdour' },
  'BIOUGRA': { key: '', name: 'Biougra' },
  'AIT AATAB': { key: '', name: 'Ait Aatab' },
  'EL HAJ KADDOUR': { key: '', name: 'El Haj Kaddour' }
};

// ==================== AUTHENTIFICATION ====================

function login() {
  try {
    const credentials = getCredentials();
    const response = UrlFetchApp.fetch(`${COLIVRY_BASE}/login`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      payload: JSON.stringify(credentials),
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (statusCode !== 200) {
      throw new Error(`Erreur de connexion (${statusCode}): ${responseText}`);
    }

    const payload = JSON.parse(responseText);
    if (!payload.accessToken) {
      throw new Error('Token d\'accès manquant dans la réponse');
    }

    return payload.accessToken;
  } catch (error) {
    Logger.log(`Erreur login: ${error.message}`);
    throw error;
  }
}

function getUserData(token) {
  try {
    const response = UrlFetchApp.fetch(`${COLIVRY_BASE}/user`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      throw new Error(`Erreur récupération utilisateur: ${response.getResponseCode()}`);
    }

    return JSON.parse(response.getContentText());
  } catch (error) {
    Logger.log(`Erreur getUserData: ${error.message}`);
    throw error;
  }
}

// ==================== CRÉATION DU GOOGLE SHEET ====================

/**
 * Fonction principale : Crée un Google Sheet complet avec tous les onglets
 * Exécutez cette fonction pour initialiser votre système Colivry
 */
function setupColivrySheet() {
  try {
    Logger.log('=== Création du système Colivry ===');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error('Aucun Google Sheet actif. Créez d\'abord un nouveau Google Sheet.');
    }

    // Supprimer les onglets existants (sauf si vous voulez les garder)
    const existingSheets = ss.getSheets();
    existingSheets.forEach(sheet => {
      if (sheet.getName() !== 'Dashboard') {
        ss.deleteSheet(sheet);
      }
    });

    // Créer tous les onglets
    createDashboardSheet(ss);
    createNouveauxColisSheet(ss);
    createRamassagesSheet(ss);
    createTousColisSheet(ss);
    createColisExpediesSheet(ss);
    createColisLivresSheet(ss);
    createColisRetournesSheet(ss);
    createChangementAdresseSheet(ss);
    createRemboursementsSheet(ss);
    createVillesSheet(ss);
    createConfigSheet(ss);

    Logger.log('✓ Système Colivry créé avec succès!');
    Logger.log('📋 Onglets créés: Dashboard, Nouveaux Colis, Ramassages, Tous Colis, etc.');
    
    return true;
  } catch (error) {
    Logger.log(`Erreur setupColivrySheet: ${error.message}`);
    throw error;
  }
}

/**
 * Crée l'onglet Dashboard
 */
function createDashboardSheet(ss) {
  let sheet = ss.getSheetByName('Dashboard');
  if (!sheet) {
    sheet = ss.insertSheet('Dashboard', 0);
  } else {
    sheet.clear();
  }

  // En-têtes
  sheet.getRange(1, 1, 1, 5).setValues([['📊 DASHBOARD COLIVRY', '', '', '', '']]);
  sheet.getRange(1, 1, 1, 5).merge();
  sheet.getRange(1, 1).setFontSize(18).setFontWeight('bold');
  sheet.getRange(1, 1).setBackground('#4285f4').setFontColor('white');

  // Informations utilisateur
  sheet.getRange(3, 1).setValue('👤 Informations Utilisateur');
  sheet.getRange(3, 1).setFontWeight('bold');
  sheet.getRange(4, 1, 1, 2).setValues([['Statut:', 'Non connecté']]);
  sheet.getRange(5, 1, 1, 2).setValues([['Rôle:', '']]);
  sheet.getRange(6, 1, 1, 2).setValues([['Nom:', '']]);
  sheet.getRange(7, 1, 1, 2).setValues([['Permissions:', '']]);

  // Statistiques
  sheet.getRange(9, 1).setValue('📈 Statistiques');
  sheet.getRange(9, 1).setFontWeight('bold');
  sheet.getRange(10, 1, 1, 2).setValues([['Nouveaux Colis:', '0']]);
  sheet.getRange(11, 1, 1, 2).setValues([['Colis Expédiés:', '0']]);
  sheet.getRange(12, 1, 1, 2).setValues([['Colis Livrés:', '0']]);
  sheet.getRange(13, 1, 1, 2).setValues([['Ramassages:', '0']]);

  // Actions rapides
  sheet.getRange(15, 1).setValue('⚡ Actions Rapides');
  sheet.getRange(15, 1).setFontWeight('bold');
  sheet.getRange(16, 1).setValue('🔄 Synchroniser tous les onglets');
  sheet.getRange(17, 1).setValue('➕ Ajouter un nouveau colis');
  sheet.getRange(18, 1).setValue('📦 Créer une demande de ramassage');
  sheet.getRange(19, 1).setValue('🔍 Actualiser les statistiques');

  // Formatage
  sheet.setColumnWidth(1, 250);
  sheet.setColumnWidth(2, 200);
  
  // Mise en forme conditionnelle pour les statistiques
  const statsRange = sheet.getRange(10, 2, 4, 1);
  statsRange.setFontSize(14).setFontWeight('bold').setFontColor('#0f9d58');
}

/**
 * Crée l'onglet Nouveaux Colis (basé sur l'interface Colivry)
 */
function createNouveauxColisSheet(ss) {
  let sheet = ss.getSheetByName('Nouveaux Colis');
  if (!sheet) {
    sheet = ss.insertSheet('Nouveaux Colis');
  } else {
    sheet.clear();
  }

  // En-têtes basés sur l'interface
  const headers = [
    'Article',
    'Quantité',
    'Prix',
    'Téléphone',
    'Ville',
    'Boutique',
    'Secteur',
    'Adresse',
    'Nom du client',
    'Remarque',
    'Demande Remboursement',
    'Statut Sync',
    'ID Colivry',
    'Date Création',
    'Date Sync'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#f0f0f0');
  sheet.setFrozenRows(1);

  // Validation des données - Ville (liste déroulante)
  const cityNames = Object.keys(CITY_MAPPING).map(key => CITY_MAPPING[key].name);
  const cityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(cityNames, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 5, 1000, 1).setDataValidation(cityRule);

  // Validation - Quantité (nombre > 0)
  const quantityRule = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThan(0)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 2, 1000, 1).setDataValidation(quantityRule);

  // Validation - Prix (nombre >= 0)
  const priceRule = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThanOrEqualTo(0)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 3, 1000, 1).setDataValidation(priceRule);

  // Largeurs de colonnes
  sheet.setColumnWidth(1, 150); // Article
  sheet.setColumnWidth(2, 80);  // Quantité
  sheet.setColumnWidth(3, 80);  // Prix
  sheet.setColumnWidth(4, 120); // Téléphone
  sheet.setColumnWidth(5, 150); // Ville
  sheet.setColumnWidth(8, 200); // Adresse
  sheet.setColumnWidth(9, 150); // Nom client
  sheet.setColumnWidth(10, 200); // Remarque
}

/**
 * Crée l'onglet Ramassages
 */
function createRamassagesSheet(ss) {
  let sheet = ss.getSheetByName('Ramassages');
  if (!sheet) {
    sheet = ss.insertSheet('Ramassages');
  } else {
    sheet.clear();
  }

  const headers = [
    'Article',
    'Quantité',
    'Prix',
    'Téléphone',
    'Ville',
    'Boutique',
    'Secteur',
    'Adresse',
    'Destinataire',
    'Remarque',
    'Client Prénom',
    'Client Nom',
    'Statut Sync',
    'ID Colivry',
    'Date Création',
    'Date Sync'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#fff3cd');
  sheet.setFrozenRows(1);

  // Validation Ville
  const cityNames = Object.keys(CITY_MAPPING).map(key => CITY_MAPPING[key].name);
  const cityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(cityNames, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 5, 1000, 1).setDataValidation(cityRule);
}

/**
 * Crée l'onglet Tous les Colis
 */
function createTousColisSheet(ss) {
  let sheet = ss.getSheetByName('Tous Colis');
  if (!sheet) {
    sheet = ss.insertSheet('Tous Colis');
  } else {
    sheet.clear();
  }

  const headers = [
    'ID Colivry',
    'Article',
    'Quantité',
    'Prix',
    'Téléphone',
    'Ville',
    'Adresse',
    'Destinataire',
    'Statut',
    'Date Création',
    'Date Mise à Jour',
    'Actions'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#e3f2fd');
  sheet.setFrozenRows(1);
}

/**
 * Crée l'onglet Colis Expédiés
 */
function createColisExpediesSheet(ss) {
  let sheet = ss.getSheetByName('Colis Expédiés');
  if (!sheet) {
    sheet = ss.insertSheet('Colis Expédiés');
  } else {
    sheet.clear();
  }

  const headers = [
    'ID Colivry',
    'Article',
    'Quantité',
    'Prix',
    'Téléphone',
    'Ville',
    'Adresse',
    'Destinataire',
    'Date Expédition',
    'Actions'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#c8e6c9');
  sheet.setFrozenRows(1);
}

/**
 * Crée l'onglet Colis Livrés
 */
function createColisLivresSheet(ss) {
  let sheet = ss.getSheetByName('Colis Livrés');
  if (!sheet) {
    sheet = ss.insertSheet('Colis Livrés');
  } else {
    sheet.clear();
  }

  const headers = [
    'ID Colivry',
    'Article',
    'Quantité',
    'Prix',
    'Téléphone',
    'Ville',
    'Adresse',
    'Destinataire',
    'Date Livraison',
    'Actions'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#a5d6a7');
  sheet.setFrozenRows(1);
}

/**
 * Crée l'onglet Colis Retournés
 */
function createColisRetournesSheet(ss) {
  let sheet = ss.getSheetByName('Colis Retournés');
  if (!sheet) {
    sheet = ss.insertSheet('Colis Retournés');
  } else {
    sheet.clear();
  }

  const headers = [
    'ID Colivry',
    'Article',
    'Quantité',
    'Prix',
    'Téléphone',
    'Ville',
    'Adresse',
    'Destinataire',
    'Date Retour',
    'Raison',
    'Actions'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#ffccbc');
  sheet.setFrozenRows(1);
}

/**
 * Crée l'onglet Changement d'Adresse
 */
function createChangementAdresseSheet(ss) {
  let sheet = ss.getSheetByName('Changement Adresse');
  if (!sheet) {
    sheet = ss.insertSheet('Changement Adresse');
  } else {
    sheet.clear();
  }

  const headers = [
    'ID Colivry',
    'Article',
    'Ancienne Adresse',
    'Nouvelle Adresse',
    'Date Demande',
    'Statut',
    'Actions'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#ffe0b2');
  sheet.setFrozenRows(1);
}

/**
 * Crée l'onglet Remboursements
 */
function createRemboursementsSheet(ss) {
  let sheet = ss.getSheetByName('Remboursements');
  if (!sheet) {
    sheet = ss.insertSheet('Remboursements');
  } else {
    sheet.clear();
  }

  const headers = [
    'ID Demande',
    'ID Colivry',
    'Montant',
    'Raison',
    'Date Demande',
    'Statut',
    'Date Traitement',
    'Actions'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#f8bbd0');
  sheet.setFrozenRows(1);
}

/**
 * Crée l'onglet Villes (référence)
 */
function createVillesSheet(ss) {
  let sheet = ss.getSheetByName('Villes');
  if (!sheet) {
    sheet = ss.insertSheet('Villes');
  } else {
    sheet.clear();
  }

  const headers = ['Nom Ville', 'Clé API', 'Actif'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#f5f5f5');

  // Remplir les villes
  const cities = [];
  Object.keys(CITY_MAPPING).forEach(key => {
    cities.push([CITY_MAPPING[key].name, CITY_MAPPING[key].key || '', 'Oui']);
  });

  if (cities.length > 0) {
    sheet.getRange(2, 1, cities.length, 3).setValues(cities);
  }

  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 80);
}

/**
 * Crée l'onglet Configuration
 */
function createConfigSheet(ss) {
  let sheet = ss.getSheetByName('Config');
  if (!sheet) {
    sheet = ss.insertSheet('Config');
  } else {
    sheet.clear();
  }

  sheet.getRange(1, 1).setValue('⚙️ CONFIGURATION');
  sheet.getRange(1, 1).setFontSize(16).setFontWeight('bold');
  
  sheet.getRange(3, 1, 1, 2).setValues([['API Base URL:', COLIVRY_BASE]]);
  sheet.getRange(4, 1, 1, 2).setValues([['Username:', 'Configuré dans Script Properties']]);
  sheet.getRange(5, 1, 1, 2).setValues([['Password:', 'Configuré dans Script Properties']]);
  sheet.getRange(6, 1, 1, 2).setValues([['Dernière Sync:', '']]);
  sheet.getRange(7, 1, 1, 2).setValues([['Statut:', 'Prêt']]);

  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 300);
}

// ==================== SYNCHRONISATION ====================

/**
 * Synchronise les nouveaux colis vers Colivry
 */
function syncNouveauxColis() {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName('Nouveaux Colis');
    if (!sheet) {
      throw new Error('Onglet "Nouveaux Colis" introuvable');
    }

    const token = login();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const dataRange = sheet.getRange(2, 1, lastRow - 1, 15);
    const values = dataRange.getValues();
    let successCount = 0;
    let errorCount = 0;

    values.forEach((row, index) => {
      const rowNumber = index + 2;
      const status = row[11]; // Colonne Statut Sync

      // Ignorer si déjà synchronisé
      if (status && (status === 'SYNCED' || status === 'OK')) {
        return;
      }

      // Vérifier les champs obligatoires
      if (!row[0] || !row[3] || !row[7] || !row[8]) {
        sheet.getRange(rowNumber, 12).setValue('ERROR: Champs manquants');
        errorCount++;
        return;
      }

      try {
        const orderData = {
          orders: [{
            articleName: row[0].toString().trim(),
            quantity: String(row[1] || 1),
            price: String(row[2] || 0),
            phone: row[3].toString().trim(),
            address: row[7].toString().trim(),
            recipient_name: row[8].toString().trim()
          }],
          refundRequest: row[10] === true || row[10] === 'TRUE'
        };

        const response = UrlFetchApp.fetch(`${COLIVRY_BASE}/orders`, {
          method: 'post',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          payload: JSON.stringify(orderData),
          muteHttpExceptions: true
        });

        const statusCode = response.getResponseCode();
        if (statusCode === 200 || statusCode === 201) {
          const result = JSON.parse(response.getContentText());
          sheet.getRange(rowNumber, 12).setValue('SYNCED');
          if (result.orders && result.orders[0] && result.orders[0].key) {
            sheet.getRange(rowNumber, 13).setValue(result.orders[0].key);
          }
          sheet.getRange(rowNumber, 15).setValue(new Date());
          successCount++;
        } else {
          sheet.getRange(rowNumber, 12).setValue(`ERROR: ${statusCode}`);
          errorCount++;
        }
      } catch (error) {
        sheet.getRange(rowNumber, 12).setValue(`ERROR: ${error.message}`);
        errorCount++;
      }
    });

    Logger.log(`✓ Synchronisation terminée: ${successCount} succès, ${errorCount} erreurs`);
    return { success: successCount, errors: errorCount };
  } catch (error) {
    Logger.log(`Erreur syncNouveauxColis: ${error.message}`);
    throw error;
  }
}

/**
 * Synchronise les ramassages vers Colivry
 */
function syncRamassages() {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName('Ramassages');
    if (!sheet) {
      throw new Error('Onglet "Ramassages" introuvable');
    }

    const token = login();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const dataRange = sheet.getRange(2, 1, lastRow - 1, 16);
    const values = dataRange.getValues();
    let successCount = 0;
    let errorCount = 0;

    values.forEach((row, index) => {
      const rowNumber = index + 2;
      const status = row[12]; // Colonne Statut Sync

      if (status && (status === 'SYNCED' || status === 'OK')) {
        return;
      }

      if (!row[0] || !row[3] || !row[7] || !row[8] || !row[4]) {
        sheet.getRange(rowNumber, 13).setValue('ERROR: Champs manquants');
        errorCount++;
        return;
      }

      try {
        const cityName = row[4].toString().trim().toUpperCase();
        const cityInfo = CITY_MAPPING[cityName] || CITY_MAPPING['CASABLANCA'];

        const pickupData = {
          data: [{
            article_name: row[0].toString().trim(),
            quantity: Number(row[1] || 1),
            price: Number(row[2] || 0),
            phone: row[3].toString().trim(),
            address: row[7].toString().trim(),
            recipient_name: row[8].toString().trim(),
            remark: row[9] ? row[9].toString().trim() : null,
            city: {
              key: cityInfo.key || '',
              city_name: cityInfo.name
            },
            sector: row[6] ? {
              key: '',
              sector_name: row[6].toString().trim()
            } : null,
            shop: row[5] ? {
              key: '',
              shop_name: row[5].toString().trim()
            } : null,
            client: (row[10] || row[11]) ? {
              key: '',
              last_name: row[11] ? row[11].toString().trim() : '',
              first_name: row[10] ? row[10].toString().trim() : ''
            } : null
          }]
        };

        const response = UrlFetchApp.fetch(`${COLIVRY_BASE}/pickup-requests`, {
          method: 'post',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          payload: JSON.stringify(pickupData),
          muteHttpExceptions: true
        });

        const statusCode = response.getResponseCode();
        if (statusCode === 200 || statusCode === 201) {
          sheet.getRange(rowNumber, 13).setValue('SYNCED');
          sheet.getRange(rowNumber, 16).setValue(new Date());
          successCount++;
        } else {
          sheet.getRange(rowNumber, 13).setValue(`ERROR: ${statusCode}`);
          errorCount++;
        }
      } catch (error) {
        sheet.getRange(rowNumber, 13).setValue(`ERROR: ${error.message}`);
        errorCount++;
      }
    });

    Logger.log(`✓ Synchronisation ramassages: ${successCount} succès, ${errorCount} erreurs`);
    return { success: successCount, errors: errorCount };
  } catch (error) {
    Logger.log(`Erreur syncRamassages: ${error.message}`);
    throw error;
  }
}

/**
 * Synchronise tous les onglets depuis Colivry
 */
function syncAllFromColivry() {
  try {
    Logger.log('=== Synchronisation complète depuis Colivry ===');
    const token = login();
    const userData = getUserData(token);

    // Mettre à jour le dashboard
    updateDashboard(userData);

    // Synchroniser chaque type de données
    syncOrdersFromAPI(token, 'Tous Colis', '/orders');
    syncOrdersFromAPI(token, 'Colis Expédiés', '/orders/shipped');
    syncOrdersFromAPI(token, 'Colis Livrés', '/orders/delivered');
    syncOrdersFromAPI(token, 'Colis Retournés', '/orders/to-return');
    syncOrdersFromAPI(token, 'Nouveaux Colis', '/orders/new');
    syncPickupRequestsFromAPI(token);

    Logger.log('✓ Synchronisation complète terminée');
  } catch (error) {
    Logger.log(`Erreur syncAllFromColivry: ${error.message}`);
    throw error;
  }
}

/**
 * Synchronise les commandes depuis l'API
 */
function syncOrdersFromAPI(token, sheetName, endpoint) {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
    if (!sheet) return;

    const response = UrlFetchApp.fetch(`${COLIVRY_BASE}${endpoint}?limit=100`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      Logger.log(`Erreur ${endpoint}: ${response.getResponseCode()}`);
      return;
    }

    const data = JSON.parse(response.getContentText());
    if (!data.data || !Array.isArray(data.data)) return;

    // Effacer les données existantes (sauf en-têtes)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }

    // Ajouter les nouvelles données
    const rows = data.data.map(order => [
      order.key || '',
      order.article_name || order.articleName || '',
      order.quantity || '',
      order.price || '',
      order.phone || '',
      order.city?.city_name || order.city || '',
      order.address || '',
      order.recipient_name || '',
      order.state?.state_name || order.status || '',
      order.created_at || '',
      order.updated_at || '',
      'Voir'
    ]);

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    }
  } catch (error) {
    Logger.log(`Erreur syncOrdersFromAPI (${sheetName}): ${error.message}`);
  }
}

/**
 * Synchronise les demandes de ramassage depuis l'API
 */
function syncPickupRequestsFromAPI(token) {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName('Ramassages');
    if (!sheet) return;

    const response = UrlFetchApp.fetch(`${COLIVRY_BASE}/pickup-requests?limit=100`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) return;

    const data = JSON.parse(response.getContentText());
    if (!data.data || !Array.isArray(data.data)) return;

    // Logique similaire à syncOrdersFromAPI
    // ...
  } catch (error) {
    Logger.log(`Erreur syncPickupRequestsFromAPI: ${error.message}`);
  }
}

/**
 * Met à jour le dashboard avec les informations utilisateur
 */
function updateDashboard(userData) {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName('Dashboard');
    if (!sheet) return;

    sheet.getRange(4, 2).setValue('Connecté');
    sheet.getRange(5, 2).setValue(userData.user_role || '');
    sheet.getRange(6, 2).setValue(`${userData.user_data?.first_name || ''} ${userData.user_data?.last_name || ''}`.trim());
    sheet.getRange(7, 2).setValue((userData.user_data?.permissions || []).join(', '));

    // Mettre à jour les statistiques
    const token = login();
    updateStatistics(token);
  } catch (error) {
    Logger.log(`Erreur updateDashboard: ${error.message}`);
  }
}

/**
 * Met à jour les statistiques
 */
function updateStatistics(token) {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName('Dashboard');
    if (!sheet) return;

    // Compter les nouveaux colis
    const newOrdersSheet = SpreadsheetApp.getActive().getSheetByName('Nouveaux Colis');
    const newOrdersCount = newOrdersSheet ? Math.max(0, newOrdersSheet.getLastRow() - 1) : 0;
    sheet.getRange(10, 2).setValue(newOrdersCount);

    // Compter les ramassages
    const pickupSheet = SpreadsheetApp.getActive().getSheetByName('Ramassages');
    const pickupCount = pickupSheet ? Math.max(0, pickupSheet.getLastRow() - 1) : 0;
    sheet.getRange(13, 2).setValue(pickupCount);

    // Récupérer les statistiques depuis l'API
    try {
      const response = UrlFetchApp.fetch(`${COLIVRY_BASE}/statistics`, {
        method: 'get',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        muteHttpExceptions: true
      });

      if (response.getResponseCode() === 200) {
        const stats = JSON.parse(response.getContentText());
        if (stats.shipped) sheet.getRange(11, 2).setValue(stats.shipped);
        if (stats.delivered) sheet.getRange(12, 2).setValue(stats.delivered);
      }
    } catch (error) {
      Logger.log(`Erreur récupération statistiques: ${error.message}`);
    }
  } catch (error) {
    Logger.log(`Erreur updateStatistics: ${error.message}`);
  }
}

// ==================== FONCTIONS UTILITAIRES ====================

/**
 * Test de connexion
 */
function testConnection() {
  try {
    const token = login();
    const userData = getUserData(token);
    Logger.log('✓ Connexion réussie!');
    Logger.log(`Utilisateur: ${userData.user_data?.first_name} ${userData.user_data?.last_name}`);
    Logger.log(`Rôle: ${userData.user_role}`);
    Logger.log(`Permissions: ${JSON.stringify(userData.user_data?.permissions || [])}`);
    return true;
  } catch (error) {
    Logger.log(`✗ Erreur de connexion: ${error.message}`);
    return false;
  }
}

/**
 * Supprime un colis par son ID
 */
function deleteOrder(orderId) {
  try {
    const token = login();
    const response = UrlFetchApp.fetch(`${COLIVRY_BASE}/orders/${orderId}`, {
      method: 'delete',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() === 200) {
      Logger.log(`✓ Colis ${orderId} supprimé avec succès`);
      return true;
    } else {
      Logger.log(`✗ Erreur suppression: ${response.getResponseCode()}`);
      return false;
    }
  } catch (error) {
    Logger.log(`Erreur deleteOrder: ${error.message}`);
    return false;
  }
}
