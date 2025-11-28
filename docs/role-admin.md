# Guide Admin Colivry

## Portée
Les administrateurs gèrent les clés API, surveillent les quotas et orchestrent les intégrations externes.

## Capacités principales
- Créer/renouveler les paires `username/password` pour les équipes.
- Superviser tous les endpoints `GET /orders/*`, `POST /orders`, `PATCH /orders/:id`.
- Accéder aux webhooks, exports financiers et intégrations tierces (Google Sheets, Make, API partners).

## Procédure d'authentification
1. Se connecter via le portail avec vos identifiants admin.
2. Vérifier que le rôle détecté est `admin`.
3. Ouvrir la documentation API complète et suivre les scénarios fournis.

## Rotation des clés
- Renouvelez chaque clé critique tous les 90 jours.
- Archivez les anciennes clés dans un coffre (Vault, 1Password Business).
- Utilisez le bouton « Renouveler » du portail pour informer votre équipe produit.

## Monitoring
| Tâche | Fréquence | Outil |
| --- | --- | --- |
| Vérifier quotas API | Hebdo | Tableau de bord Colivry | 
| Analyser erreurs 4xx/5xx | Quotidien | Logs centralisés |
| Comparer commandes expédiées vs entrepôt | Quotidien | Google Sheets ↔ Colivry |

## Escalade
- Incident bloquant: contacter support@colivry.co + Slack #colivry-api.
- Incident majeur: informer les vendeurs et livreurs via le canal interne.
