# Colivry API Integration Guide

## Vue d'ensemble
Le backend Colivry expose des endpoints REST sécurisés par des identifiants applicatifs (`username` / `password`). Vous devez:

1. Appeler `POST /login` avec le couple (`pierre` / `123456`) pour obtenir un `accessToken`.
2. Réutiliser ce jeton dans les en-têtes `Authorization: Bearer <token>` sur les autres endpoints (`/user`, `/orders/...`).

Tous les exemples ci-dessous utilisent la base `https://www.colivry.co/api/v1`.

---

## Authentification
1. **Login** – échange identifiants → accessToken

```bash
curl -X POST \
  https://www.colivry.co/api/v1/login \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{ "username": "pierre", "password": "123456" }'
```

Réponse type:

```json
{
  "accessToken": "38165|I5pwBNyzNQX9Ki9VpURz...",
  "user_role": "delivery-employee",
  "user_data": {
    "key": "418d2100-b3bb-4fde-b7cf-a2b560d7c4f5",
    "first_name": "Pierre",
    "last_name": "Dupont",
    "avatar_path": null
  },
  "active": 1
}
```

2. **Appels authentifiés** – injecter le jeton dans `Authorization`.

```bash
ACCESS_TOKEN="38165|I5pwBNyzNQX9Ki9VpURznJhsqchwTeJrA6nyZu6z"
curl -X GET \
  https://www.colivry.co/api/v1/user \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H 'Accept: application/json'
```

Réponse attendue (exemple):

```json
{
  "id": 42,
  "email": "pierre@colivry.co",
  "first_name": "Pierre",
  "last_name": "Client",
  "role": "admin"
}
```

---

## Endpoints disponibles

### Authentification & Profil

#### `GET /user`
Récupère le profil de l'utilisateur lié au token.

| Champ | Description |
| --- | --- |
| `id` | Identifiant interne Colivry |
| `email` | Email principal |
| `first_name` / `last_name` | Données d'identité |
| `role` | Portée des permissions (ex.: `delivery-employee`, `admin`, `seller`) |

### Commandes & Colis

#### `GET /orders`
Liste tous les colis. Paramètres: `limit`, `page`, `city`, `status`.

#### `GET /orders/shipped`
Retourne la liste des commandes expédiées.

Paramètres de requête:
- `from` *(ISO8601)* : date min de création
- `to` *(ISO8601)* : date max de création
- `limit` *(int, défaut 50)*
- `page` *(int, défaut 1)*

Exemple:

```bash
curl -G https://www.colivry.co/api/v1/orders/shipped \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  --data-urlencode 'from=2024-01-01T00:00:00Z' \
  --data-urlencode 'to=2024-12-31T23:59:59Z' \
  --data-urlencode 'limit=100'
```

Réponse abrégée:

```json
{
  "data": [
    {
      "order_id": "ORD-2024-001",
      "shipped_at": "2024-06-18T09:42:00Z",
      "status": "shipped",
      "carrier": "Chronopost",
      "tracking": "XW123456789FR",
      "total": 129.9,
      "currency": "EUR"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 287
  }
}
```

#### `GET /orders/new`
Nouveaux colis en attente de traitement.

#### `GET /orders/in-progress`
Colis en cours de livraison.

#### `GET /orders/delivered`
Colis livrés.

#### `GET /orders/to-return`
Colis à retourner.

#### `GET /orders/change-address`
Demandes de changement d'adresse.

### Ramassages

#### `GET /pickup-requests`
Liste des demandes de ramassage. Paramètres: `limit`, `page`, `status`.

### Bons

#### `GET /exit-vouchers`
Bons de sortie.

#### `GET /return-vouchers`
Bons de retour.

### Remboursements

#### `GET /refund-requests`
Demandes de remboursement.

### Support

#### `GET /support`
Support client / tickets.

### Statistiques

#### `GET /statistics`
Tableau de bord avec métriques selon le rôle.

---

## Rôles & permissions
| Rôle | Portée | Docs |
| --- | --- | --- |
| `livreur` (delivery-employee) | Lecture complète sur commandes, ramassages, bons, remboursements, support | `docs/role-livreur.md` |
| `admin` | Lecture/écriture sur toutes les ressources + management des clés | `docs/role-admin.md` |
| `vendeur` (seller) | Lecture `/user`, lecture filtrée `/orders` | `docs/role-vendeur.md` |

---

## Bonnes pratiques
- Implémentez un mécanisme de rotation des identifiants (bouton *Renouveler* dans l'interface) au moins tous les 90 jours.
- Logguez les réponses HTTP (statut + payload réduit) pour faciliter le support.
- Utilisez `Retry-After` si l'API renvoie `429 Too Many Requests`.
- Préférez les webhooks Colivry (si disponibles) pour réduire le polling.

---

## Dépannage rapide
| Symptôme | Piste |
| --- | --- |
| `401 Unauthorized` | Vérifiez les en-têtes `X-Public-Key` / `X-Private-Key` |
| `403 Forbidden` | Clés valides mais pas de droits sur la ressource |
| `5xx` | Incident côté Colivry, réessayez avec backoff |
| Latence élevée | Réduisez `limit`, ajoutez des filtres `from/to` |

---

## Contact support
- Email: support@colivry.co
- Slack: #colivry-api (clients premium)
- Statut temps réel: status.colivry.co
