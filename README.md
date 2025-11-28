# Colivry Integration Kit

Ce mini-kit fournit:

1. Un portail de connexion qui appelle `POST /login` pour obtenir un `accessToken`, puis teste 12+ endpoints via un sélecteur (`interface/index.html`).
2. Un guide d'intégration REST (`docs/colivry-api.md`).
3. Une référence complète des endpoints extraits du menu (`docs/endpoints-reference.md`).
4. Un tutoriel Google Sheets (`docs/google-sheets.md`).
5. Trois guides par rôle (`docs/role-livreur.md`, `docs/role-admin.md`, `docs/role-vendeur.md`).

## Aperçu rapide
- Identifiants dev de démonstration: `pierre` / `123456`
- Authentification: POST `/login` avec `{ "username", "password" }` puis `Authorization: Bearer <token>`
- Permissions couvertes: livreur (delivery-employee), admin, vendeur
- Endpoints disponibles: commandes, ramassages, bons, remboursements, support, statistiques (voir `docs/endpoints-reference.md`)
- Test GET intégré avec sélecteur d'endpoints (12+ endpoints testables)

## Utilisation
1. Ouvrez `interface/index.html`, saisissez vos identifiants et vérifiez le rôle détecté.
2. Accédez aux guides proposés selon votre rôle directement depuis le portail.
3. Suivez `docs/colivry-api.md` pour brancher votre backend, puis `docs/google-sheets.md` pour automatiser les exports.

## Prochaines étapes
- Ajouter la gestion réelle de renouvellement de clés (appel PATCH/POST lorsque disponible).
- Étendre la matrice de permissions (ex: opérateurs entrepôt).
- Packager l'interface en SPA (React/Vue) si besoin ou l'intégrer dans le back-office existant.
