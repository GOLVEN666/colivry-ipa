# Référence des Endpoints Colivry API

Ce document liste tous les endpoints disponibles extraits du menu de navigation de l'application Colivry.

**Base URL:** `https://www.colivry.co/api/v1`

**Authentification:** Tous les endpoints (sauf `/login`) nécessitent l'en-tête `Authorization: Bearer <accessToken>` obtenu via `POST /login`.

---

## Authentification

### `POST /login`
Authentification avec identifiants.

**Payload:**
```json
{
  "username": "pierre",
  "password": "123456"
}
```

**Réponse:**
```json
{
  "accessToken": "38165|I5pwBNyzNQX9Ki9VpURznJhsqchwTeJrA6nyZu6z",
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

---

## Profil Utilisateur

### `GET /user`
Récupère le profil de l'utilisateur authentifié.

---

## Commandes & Colis

### `GET /orders`
Liste tous les colis. Paramètres: `limit`, `page`, `city`, `status`.

**Exemple:**
```bash
curl -G "https://www.colivry.co/api/v1/orders?limit=50&city=casa" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### `GET /orders/shipped`
Colis expédiés. Paramètres: `limit`, `page`, `from`, `to`.

### `GET /orders/new`
Nouveaux colis en attente de traitement.

### `GET /orders/in-progress`
Colis en cours de livraison.

### `GET /orders/delivered`
Colis livrés.

### `GET /orders/to-return`
Colis à retourner.

### `GET /orders/change-address`
Demandes de changement d'adresse.

---

## Ramassages

### `GET /pickup-requests`
Liste des demandes de ramassage. Paramètres: `limit`, `page`, `status`.

**Mapping menu:** `/demandes-de-ramassage`

---

## Bons

### `GET /exit-vouchers`
Bons de sortie.

**Mapping menu:** `/bons-de-sortie`

### `GET /return-vouchers`
Bons de retour.

**Mapping menu:** `/bons-de-retour`

---

## Remboursements

### `GET /refund-requests`
Demandes de remboursement.

**Mapping menu:** `/demandes-de-remboursement`

---

## Support

### `GET /support`
Support client / tickets.

**Mapping menu:** `/support`

---

## Statistiques

### `GET /statistics`
Tableau de bord avec métriques selon le rôle.

**Mapping menu:** `/statistiques`

---

## Factures

### `GET /invoices`
Factures (accès selon rôle).

**Mapping menu:** `/factures`

---

## Notes

- Les endpoints listés ci-dessus sont ceux visibles dans le menu de navigation pour le rôle **livreur (delivery-employee)**.
- Les rôles **admin** et **vendeur** peuvent avoir des endpoints supplémentaires ou des restrictions différentes.
- Tous les endpoints supportent généralement les paramètres de pagination: `limit`, `page`.
- Les filtres de date utilisent le format ISO8601: `from=2024-01-01T00:00:00Z`, `to=2024-12-31T23:59:59Z`.

---

## Mapping Menu → API

| Menu (Frontend) | Endpoint API |
|----------------|--------------|
| `/statistiques` | `GET /statistics` |
| `/demandes-de-ramassage` | `GET /pickup-requests` |
| `/bons-de-sortie` | `GET /exit-vouchers` |
| `/bons-de-retour` | `GET /return-vouchers` |
| `/tous-colis` | `GET /orders` |
| `/colis-casa` | `GET /orders?city=casa` |
| `/nouveaux-colis` | `GET /orders/new` |
| `/colis-en-cours` | `GET /orders/in-progress` |
| `/Changement-adresse` | `GET /orders/change-address` |
| `/colis-livres` | `GET /orders/delivered` |
| `/demandes-de-remboursement` | `GET /refund-requests` |
| `/colis-à-retourner` | `GET /orders/to-return` |
| `/factures` | `GET /invoices` |
| `/support` | `GET /support` |

