# Donnees Pour La Demo

Utilisez ces 3 jeux de donnees pendant la demo pour remplir rapidement le formulaire de preparation de commande.

## Enregistrement 1 - Chaine Froide Poisson Frais (Douala vers Yaounde)

### Etape 1 - Contexte de commande
- orderId: ORD-CM-20260423-001
- date: 2026-04-23
- warehouse: Marche aux Poissons Youpwe, Douala
- destination: Depot principal Carrefour Warda, Yaounde
- deliveryType: express

### Etape 2 - Expediteur et destinataire
- sender.fullName: Ange Junior Ngono
- sender.phone: +237 677 112 233
- sender.email: ange.ngono@freshco.cm
- receiver.fullName: Clarisse Etoga
- receiver.phone: +237 695 334 221
- receiver.address: Avenue Konrad Adenauer, face station MRS Warda
- receiver.city: Yaounde

### Etape 3 - Articles
1. itemName: Caisse de poisson capitaine frais
   - quantity: 25
   - weight: 300
   - description: Chaine froide obligatoire entre 0C et 4C
2. itemName: Caisse de crevettes fraiches
   - quantity: 18
   - weight: 126
   - description: Ne pas empiler plus de 3 niveaux
3. itemName: Sacs de glace alimentaire
   - quantity: 40
   - weight: 400
   - description: Utiliser comme maintien de temperature

### Etape 4 - Notes
- notes: Livraison prioritaire avant 14h. Verification temperature au depart et a l arrivee.

## Enregistrement 2 - Expedition Vrac Plantain et Tomates (Bafoussam vers Douala)

### Etape 1 - Contexte de commande
- orderId: ORD-CM-20260423-002
- date: 2026-04-23
- warehouse: Marche A, Bafoussam
- destination: Centre logistique New Deido, Douala
- deliveryType: bulk

### Etape 2 - Expediteur et destinataire
- sender.fullName: Brice Tchoumi
- sender.phone: +237 699 881 104
- sender.email: brice.tchoumi@agriwest.cm
- receiver.fullName: Mireille Ndebi
- receiver.phone: +237 652 778 330
- receiver.address: Rue des Manguiers, New Deido
- receiver.city: Douala

### Etape 3 - Articles
1. itemName: Regimes de plantain vert
   - quantity: 220
   - weight: 2640
   - description: Produits frais, manipuler sans choc
2. itemName: Caisses de tomates fraiches
   - quantity: 95
   - weight: 1140
   - description: Eviter exposition directe au soleil
3. itemName: Sacs de poivron vert
   - quantity: 50
   - weight: 500
   - description: Ventilation necessaire pendant le transport

### Etape 4 - Notes
- notes: Chargement prevu a 05h30. Priorite de dechargement quai 2 entre 11h et 13h.

## Enregistrement 3 - Volailles et Produits Laitiers Refrigeres (Ngaoundere vers Garoua)

### Etape 1 - Contexte de commande
- orderId: ORD-CM-20260423-003
- date: 2026-04-23
- warehouse: Zone agro-industrielle Dang, Ngaoundere
- destination: Entrepot distribution Poumpoumre, Garoua
- deliveryType: standard

### Etape 2 - Expediteur et destinataire
- sender.fullName: Salifou Hamadou
- sender.phone: +237 682 440 915
- sender.email: salifou.hamadou@northfresh.cm
- receiver.fullName: Ruth Madjou
- receiver.phone: +237 676 229 804
- receiver.address: Route de Pitoa, secteur industriel
- receiver.city: Garoua

### Etape 3 - Articles
1. itemName: Cartons de poulet refroidi
   - quantity: 140
   - weight: 1680
   - description: Maintenir entre 0C et 4C
2. itemName: Caisses de yaourt nature
   - quantity: 75
   - weight: 525
   - description: Garder au frais, ne pas secouer
3. itemName: Plaques d oeufs frais
   - quantity: 200
   - weight: 1200
   - description: Fragile, manutention avec soin

### Etape 4 - Notes
- notes: Prevenir le destinataire 30 min avant arrivee. Controle integrite emballage a reception.

## Format Copie Rapide (JSON)

```json
[
  {
    "orderId": "ORD-CM-20260423-001",
    "date": "2026-04-23",
    "warehouse": "Marche aux Poissons Youpwe, Douala",
    "destination": "Depot principal Carrefour Warda, Yaounde",
    "deliveryType": "express",
    "sender": {
      "fullName": "Ange Junior Ngono",
      "phone": "+237 677 112 233",
      "email": "ange.ngono@freshco.cm"
    },
    "receiver": {
      "fullName": "Clarisse Etoga",
      "phone": "+237 695 334 221",
      "address": "Avenue Konrad Adenauer, face station MRS Warda",
      "city": "Yaounde"
    },
    "items": [
      {
        "itemName": "Caisse de poisson capitaine frais",
        "quantity": 25,
        "weight": 300,
        "description": "Chaine froide obligatoire entre 0C et 4C"
      },
      {
        "itemName": "Caisse de crevettes fraiches",
        "quantity": 18,
        "weight": 126,
        "description": "Ne pas empiler plus de 3 niveaux"
      },
      {
        "itemName": "Sacs de glace alimentaire",
        "quantity": 40,
        "weight": 400,
        "description": "Utiliser comme maintien de temperature"
      }
    ],
    "notes": "Livraison prioritaire avant 14h. Verification temperature au depart et a l arrivee."
  },
  {
    "orderId": "ORD-CM-20260423-002",
    "date": "2026-04-23",
    "warehouse": "Marche A, Bafoussam",
    "destination": "Centre logistique New Deido, Douala",
    "deliveryType": "bulk",
    "sender": {
      "fullName": "Brice Tchoumi",
      "phone": "+237 699 881 104",
      "email": "brice.tchoumi@agriwest.cm"
    },
    "receiver": {
      "fullName": "Mireille Ndebi",
      "phone": "+237 652 778 330",
      "address": "Rue des Manguiers, New Deido",
      "city": "Douala"
    },
    "items": [
      {
        "itemName": "Regimes de plantain vert",
        "quantity": 220,
        "weight": 2640,
        "description": "Produits frais, manipuler sans choc"
      },
      {
        "itemName": "Caisses de tomates fraiches",
        "quantity": 95,
        "weight": 1140,
        "description": "Eviter exposition directe au soleil"
      },
      {
        "itemName": "Sacs de poivron vert",
        "quantity": 50,
        "weight": 500,
        "description": "Ventilation necessaire pendant le transport"
      }
    ],
    "notes": "Chargement prevu a 05h30. Priorite de dechargement quai 2 entre 11h et 13h."
  },
  {
    "orderId": "ORD-CM-20260423-003",
    "date": "2026-04-23",
    "warehouse": "Zone agro-industrielle Dang, Ngaoundere",
    "destination": "Entrepot distribution Poumpoumre, Garoua",
    "deliveryType": "standard",
    "sender": {
      "fullName": "Salifou Hamadou",
      "phone": "+237 682 440 915",
      "email": "salifou.hamadou@northfresh.cm"
    },
    "receiver": {
      "fullName": "Ruth Madjou",
      "phone": "+237 676 229 804",
      "address": "Route de Pitoa, secteur industriel",
      "city": "Garoua"
    },
    "items": [
      {
        "itemName": "Cartons de poulet refroidi",
        "quantity": 140,
        "weight": 1680,
        "description": "Maintenir entre 0C et 4C"
      },
      {
        "itemName": "Caisses de yaourt nature",
        "quantity": 75,
        "weight": 525,
        "description": "Garder au frais, ne pas secouer"
      },
      {
        "itemName": "Plaques d oeufs frais",
        "quantity": 200,
        "weight": 1200,
        "description": "Fragile, manutention avec soin"
      }
    ],
    "notes": "Prevenir le destinataire 30 min avant arrivee. Controle integrite emballage a reception."
  }
]
```