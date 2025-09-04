# War Shop Script (Attribute-Based)

## Overview

The **War Shop** script is a Roll20 API tool for running large-scale battles where players spend **command points** to recruit units. Armies are tracked on a dedicated character sheet (default: `TeamRoster`) using attributes. The system supports **tiered unit types**, **ScriptCards menus**, and **refund/reset functionality**.

It's pretty customized for a specific campaign, but you might find it useful. You may need to tweak the number of command points you hand out based on the scale of the battle you want to run. 

---

## Features

* **Tiered Units**: Conscripts, Regulars, Veterans, and Elites for Infantry, Spearmen, Archers, Cavalry, and Samurai.
* **Command Point Economy**: Purchases deduct from a shared `command_points` attribute.
* **Army Inventory**: Units stored in the `unit_inventory` attribute (JSON format).
* **ScriptCards UI**:

  * Buy menu with buttons for buying 1 or 5 units.
  * Inventory view with return buttons and a “Clear Army” option.
* **Refunds**:

  * `!returnunit` returns units for partial refund.
  * `!cleararmy` clears the army and refunds all points.

---

## Installation

1. Open your Roll20 campaign as GM.
2. Go to **Game Settings → API Scripts**.
3. Create a new script called `War Shop`.
4. Paste the contents of `war_shop.js` into the editor.
5. Save the script.

---

## Commands

### Unit Reference

```text
!unitlist
```

Whispers a simple list of all units and their costs.

### Buy Menu (ScriptCards)

```text
!unitmenu
```

Displays a menu with buttons to purchase units.

* \[Buy 1] or \[Buy 5] per unit type.

### Purchase Units

```text
!buyunit {unit_key} {amount}
```

Example:

```text
!buyunit inf_regular 10
```

Buys 10 Regular Infantry.

### Return Units

```text
!returnunit {unit_key} {amount}
```

Refunds units to regain command points.

### Army Inventory (ScriptCards)

```text
!armyview
```

Shows current army with quantities and return buttons.

* \[Return 1] / \[Return 5] / \[Return All]
* \[CLEAR ARMY] button refunds all units.

### Clear Army

```text
!cleararmy
```

Deletes all purchased units and refunds all points.

---

## Unit Costs

* **Infantry**: 5 / 10 / 20 / 40 (Conscript → Elite)
* **Spearmen**: 6 / 12 / 24 / 48
* **Archers**: 15 / 30 / 60
* **Cavalry**: 25 / 50 / 100
* **Samurai**: 40 / 80 / 160

---

## Example Workflow

1. GM assigns a character called `TeamRoster` with attributes:

   * `command_points` → starting pool of points.
   * `unit_inventory` → created/managed automatically.
2. Players run `!unitmenu` to open the purchase menu.
3. A player buys 5 Archers (`!buyunit arc_regular 5`).
4. Army view (`!armyview`) now shows **Archers (Regular): 5**.
5. If the army needs a reset, `!cleararmy` refunds all points.

---

## Notes & Customization

* Change `TEAM_NAME` constant (`'TeamRoster'`) to use a different character sheet.
* Add or edit units in the `UNIT_LIST` object at the top of the script.
* ScriptCards is used for menus; ensure you have the **ScriptCards API** installed in Roll20.
* The system is designed for **shared army pools** but can be adapted to individual players.

---
