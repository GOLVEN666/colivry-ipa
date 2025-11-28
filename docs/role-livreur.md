# Guide Livreur Colivry

## Objectif
Assurez la bonne livraison des commandes expédiées et mettez à jour le statut en temps réel.

## Accès autorisés

### Authentification
- `POST /login` (authentification via payload `{ "username", "password" }` → `accessToken`).
- `GET /user` (lecture du profil) avec `Authorization: Bearer <token>`.

### Commandes & Colis
- `GET /orders` - Tous les colis
- `GET /orders/shipped` - Colis expédiés
- `GET /orders/new` - Nouveaux colis
- `GET /orders/in-progress` - Colis en cours de livraison
- `GET /orders/delivered` - Colis livrés
- `GET /orders/to-return` - Colis à retourner
- `GET /orders/change-address` - Demandes de changement d'adresse
- `GET /orders?city=casa` - Colis Casa (filtre par ville)

### Ramassages
- `GET /pickup-requests` - Demandes de ramassage

### Bons
- `GET /exit-vouchers` - Bons de sortie
- `GET /return-vouchers` - Bons de retour

### Remboursements
- `GET /refund-requests` - Demandes de remboursement

### Support
- `GET /support` - Support client / tickets

### Statistiques
- `GET /statistics` - Tableau de bord (métriques livreur)

**Note:** Accès lecture seule sur tous ces endpoints. Pas d'accès aux endpoints d'administration ou de facturation complète.

## Checklist quotidienne
1. Se connecter via le portail Colivry (section *Portail d'accès*).
2. Utiliser le test GET pour lister les commandes en attente.
3. Confirmer le transporteur et numéro de suivi.
4. Mettre à jour l'état livré dans l'application mobile.

## Codes d'erreur fréquents
| Code | Explication | Action |
| --- | --- | --- |
| 401 | Identifiants invalides | Re-saisir l'exemple `pierre / 123456` et vérifier la casse |
| 403 | Rôle insuffisant | Contacter un admin pour étendre les droits |
| 409 | Conflit statut | Synchroniser le terminal mobile puis réessayer |

## Bonnes pratiques
- Ne partagez jamais vos identifiants hors de l'équipe logistique.
- Utilisez le bouton de test GET avant chaque tournée pour vérifier les nouvelles commandes.
- En cas de colis perdu, ouvrez un ticket support avec l'ID Colivry (`ORD-XXXX`).
