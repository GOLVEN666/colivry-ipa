# Guide Vendeur (Seller)

## Missions
- Suivre les ventes et expéditions sorties de votre catalogue.
- Alerter les clients en cas de retard.
- Consulter les métriques commerciales disponibles.

## Accès API
- `POST /login` pour récupérer un `accessToken`.
- `GET /user` et `GET /orders/shipped` (lecture seule) avec `Authorization: Bearer <token>`.
- Pas de modification d'ordres ou de paramètres globaux.

## Workflow recommandé
1. Se connecter via le portail et vérifier le rôle `vendeur`.
2. Cliquer sur la documentation API (lecture) pour récupérer les exemples `curl`.
3. Utiliser Google Sheets pour partager un suivi avec l'équipe commerciale.
4. Mettre à jour vos clients avec les numéros de suivi fournis.

## KPI à surveiller
- Taux d'expédition quotidienne.
- Délai moyen entre commande et expédition.
- Taux de colis retournés.

## Assistance
- Canal vendeur: seller-support@colivry.co.
- Questions API: support@colivry.co avec objet `[SELLER-API]`.
