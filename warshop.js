// War Shop Script - Buy Units for Large-Scale Battles (Attribute-based Version)
// Updated with tiered units and revised names (no x#)
// Includes `!cleararmy` refund/reset command and `!returnunit` partial refunds

on('ready', () => {
    log("✅ War Shop script (Attribute Version) loaded.");

    const UNIT_LIST = {
        inf_conscript: { name: "Infantry (Conscript)", cost: 5 },
        inf_regular:   { name: "Infantry (Regular)",   cost: 10 },
        inf_veteran:   { name: "Infantry (Veteran)",   cost: 20 },
        inf_elite:     { name: "Infantry (Elite)",     cost: 40 },

        spe_conscript: { name: "Spearmen (Conscript)", cost: 6 },
        spe_regular:   { name: "Spearmen (Regular)",   cost: 12 },
        spe_veteran:   { name: "Spearmen (Veteran)",   cost: 24 },
        spe_elite:     { name: "Spearmen (Elite)",     cost: 48 },

        arc_regular:   { name: "Archers (Regular)",    cost: 15 },
        arc_veteran:   { name: "Archers (Veteran)",    cost: 30 },
        arc_elite:     { name: "Archers (Elite)",      cost: 60 },

        cav_regular:   { name: "Cavalry (Regular)",    cost: 25 },
        cav_veteran:   { name: "Cavalry (Veteran)",    cost: 50 },
        cav_elite:     { name: "Cavalry (Elite)",      cost: 100 },

        sam_regular:   { name: "Samurai (Regular)",    cost: 40 },
        sam_veteran:   { name: "Samurai (Veteran)",    cost: 80 },
        sam_elite:     { name: "Samurai (Elite)",      cost: 160 }
    };

    const TEAM_NAME = 'TeamRoster';
    const INVENTORY_ATTR = 'unit_inventory';

    const getChar = () => findObjs({ type: 'character', name: TEAM_NAME })[0];

    const getPoints = (charid) => {
        const attr = findObjs({ type: 'attribute', characterid: charid, name: 'command_points' })[0];
        return attr ? parseInt(attr.get('current'), 10) || 0 : 0;
    };

    const setPoints = (charid, newVal) => {
        let attr = findObjs({ type: 'attribute', characterid: charid, name: 'command_points' })[0];
        if (!attr) {
            attr = createObj('attribute', {
                characterid: charid,
                name: 'command_points',
                current: newVal
            });
        } else {
            attr.set('current', newVal);
        }
    };

    const getInventory = (charid) => {
        const attr = findObjs({ type: 'attribute', characterid: charid, name: INVENTORY_ATTR })[0];
        if (!attr) return {};
        try {
            return JSON.parse(attr.get('current')) || {};
        } catch (e) {
            return {};
        }
    };

    const setInventory = (charid, inv) => {
        const json = JSON.stringify(inv);
        let attr = findObjs({ type: 'attribute', characterid: charid, name: INVENTORY_ATTR })[0];
        if (!attr) {
            createObj('attribute', {
                characterid: charid,
                name: INVENTORY_ATTR,
                current: json
            });
        } else {
            attr.set('current', json);
        }
    };

    const showUnitList = (who) => {
        let out = `/w "${who}" <div style="border:1px solid #aaa;padding:5px;"><b>⚔️ Available Units</b><hr>`;
        for (let [key, unit] of Object.entries(UNIT_LIST)) {
            out += `• <b>${unit.name}</b>: ${unit.cost} points – <code>!buyunit ${key} [amount]</code><br>`;
        }
        out += `</div>`;
        sendChat('War Shop', out);
    };

    // --- MODIFIED: ScriptCards UI for Unit Menu ---
    const showUnitMenu = (who) => {
        let out = `!scriptcard {{ --#title|⚔️ Buy Units --#whisper|${who}`;
        for (let [key, unit] of Object.entries(UNIT_LIST)) {
            // Display unit name and base cost, then separate buy buttons with their specific costs
            out += ` --+|<b>${unit.name}</b> (${unit.cost} pts)`;
            out += ` [Buy 1 (${unit.cost} pts)](!buyunit ${key} 1)`;
            out += ` [Buy 5 (${unit.cost * 5} pts)](!buyunit ${key} 5)`;
        }
        out += ` }}`; // Crucial: Double closing brace!
        sendChat('War Shop', out);
    };

    const buyUnit = (who, key, count) => {
        const unit = UNIT_LIST[key];
        if (!unit) {
            sendChat('War Shop', `/w "${who}" Unknown unit type: ${key}`);
            return;
        }

        const amount = parseInt(count, 10);
        if (isNaN(amount) || amount <= 0) {
            sendChat('War Shop', `/w "${who}" Invalid amount: ${count}`);
            return;
        }

        const char = getChar();
        if (!char) {
            sendChat('War Shop', `/w "${who}" Could not find team character \"${TEAM_NAME}\"`);
            return;
        }

        const totalCost = unit.cost * amount;
        const currentPoints = getPoints(char.id);

        if (currentPoints < totalCost) {
            sendChat('War Shop', `/w "${who}" Not enough command points (need ${totalCost}, have ${currentPoints}).`);
            return;
        }

        setPoints(char.id, currentPoints - totalCost);

        const inv = getInventory(char.id);
        inv[unit.name] = (inv[unit.name] || 0) + amount;
        setInventory(char.id, inv);

        sendChat('War Shop', `/w "${who}" Purchased <b>${amount}</b> × ${unit.name} for <b>${totalCost}</b> points.`);
    };

    const returnUnit = (who, key, count) => {
        const unit = UNIT_LIST[key];
        if (!unit) {
            sendChat('War Shop', `/w "${who}" Unknown unit type: ${key}`);
            return;
        }

        const amount = parseInt(count, 10);
        if (isNaN(amount) || amount <= 0) {
            sendChat('War Shop', `/w "${who}" Invalid return amount: ${count}`);
            return;
        }

        const char = getChar();
        if (!char) {
            sendChat('War Shop', `/w "${who}" Could not find team character.`);
            return;
        }

        const inv = getInventory(char.id);
        const currentQty = inv[unit.name] || 0;

        if (currentQty < amount) {
            sendChat('War Shop', `/w "${who}" You only have ${currentQty} of ${unit.name}, can't return ${amount}.`);
            return;
        }

        inv[unit.name] = currentQty - amount;
        if (inv[unit.name] === 0) delete inv[unit.name];

        setInventory(char.id, inv);
        setPoints(char.id, getPoints(char.id) + (unit.cost * amount));

        sendChat('War Shop', `/w "${who}" Returned <b>${amount}</b> × ${unit.name}. Refunded <b>${unit.cost * amount}</b> points.`);
    };

    // --- MODIFIED: ScriptCards UI for Inventory View ---
    const showInventory = (who) => {
        const char = getChar();
        if (!char) {
            sendChat('War Shop', `/w "${who}" Could not find team character.`);
            return;
        }
        const inv = getInventory(char.id);

        let out = `!scriptcard {{ --#title|Your Army --#whisper|${who}`;

        const keys = Object.keys(inv);
        if (!keys.length) {
            out += ` --+|No units purchased yet.`;
        } else {
            for (let [name, qty] of Object.entries(inv)) {
                let key = Object.entries(UNIT_LIST).find(([k, v]) => v.name === name)?.[0] || '';
                
                // Display current quantity
                out += ` --+|<b>${name}</b>: ${qty}`;
                
                // Add return buttons if applicable
                if (qty > 0) {
                    // Try to get the individual unit cost for display in the return button
                    const unitEntry = Object.values(UNIT_LIST).find(u => u.name === name);
                    const unitCost = unitEntry ? unitEntry.cost : 0;

                    out += ` [Return 1 (+${unitCost} pts)](!returnunit ${key} 1)`;
                }
                if (qty >= 5) {
                    const unitEntry = Object.values(UNIT_LIST).find(u => u.name === name);
                    const unitCost = unitEntry ? unitEntry.cost : 0;
                    out += ` [Return 5 (+${unitCost * 5} pts)](!returnunit ${key} 5)`;
                }
                if (qty > 0) {
                    const unitEntry = Object.values(UNIT_LIST).find(u => u.name === name);
                    const unitCost = unitEntry ? unitEntry.cost : 0;
                    out += ` [Return All (+${unitCost * qty} pts)](!returnunit ${key} ${qty})`;
                }
            }
        }
        
        if (keys.length > 0) {
            out += ` --+--X|Clear All Units [CLEAR ARMY](!cleararmy)`;
        }
        
        out += ` }}`;
        sendChat('War Shop', out);
    };

    const clearArmy = (who) => {
        const char = getChar();
        if (!char) {
            sendChat('War Shop', `/w "${who}" Could not find team character.`);
            return;
        }

        const inv = getInventory(char.id);
        let totalRefund = 0;
        const refundDetails = [];

        for (const [unitName, qty] of Object.entries(inv)) {
            const entry = Object.values(UNIT_LIST).find(u => u.name === unitName);
            if (entry) {
                const refund = entry.cost * qty;
                totalRefund += refund;
                refundDetails.push(`<b>${unitName}</b> × ${qty} → ${refund} points`);
            }
        }

        setInventory(char.id, {});
        setPoints(char.id, getPoints(char.id) + totalRefund);

        let out = `/w "${who}" <div style="border:1px solid #900;padding:5px;"><b>🗑 Army Cleared</b><hr>`;
        if (refundDetails.length) {
            out += refundDetails.join('<br>') + `<hr><b>Total Refund:</b> ${totalRefund} points</div>`;
        } else {
            out += `No units to clear.</div>`;
        }

        sendChat('War Shop', out);
    };

    on('chat:message', (msg) => {
        if (msg.type !== 'api') return;

        const args = msg.content.trim().split(/\s+/);
        const command = args.shift().toLowerCase();
        const who = getObj('player', msg.playerid)?.get('displayname') || 'GM';

        if (command === '!unitlist') showUnitList(who);
        if (command === '!unitmenu') showUnitMenu(who);
        if (command === '!buyunit' && args.length >= 2) buyUnit(who, args[0].toLowerCase(), args[1]);
        if (command === '!returnunit' && args.length >= 2) returnUnit(who, args[0].toLowerCase(), args[1]);
        if (command === '!armyview') showInventory(who);
        if (command === '!cleararmy') clearArmy(who);
    });
});