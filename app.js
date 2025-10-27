/*
File: app.js
Assignment: Dynamic Multiplication Table (Interactive Web App)
About: This webpage allows users to generate a fully dynamic and scrollable
multiplication table by entering custom row and column ranges. The page
includes input validation, smooth hover highlighting, and sticky headers
for improved readability and user experience.

Author: Afsa Nafe
Affiliation: UMass Lowell, Computer Science Department
Email: afsa_nafe@student.uml.edu
Copyright (c) 2025 by Afsa Nafe. 
All rights reserved. May be freely copied or excerpted for educational purposes 
with credit to the author.
Last updated by Afsa Nafe on October 26th, 2025 at 10:19 PM
*/

// Wait until the DOM is ready before running any code that queries elements.
document.addEventListener("DOMContentLoaded", () => { 
    // Element references
    const form = document.getElementById("table-form"); // "table-form" is the intended element in HTML
    const clearBtn = document.getElementById("clearBtn");
    const tableHost = document.getElementById("tableHost");
    const errors = document.getElementById("errors");

    // Shortcut for document.getElementById
    const $ = (id) => document.getElementById(id);

    // Handle form submission: validate inputs and (if valid) render the table
    form.addEventListener("submit", (evt) => {
       
    evt.preventDefault(); // prevent page reload

    // reset UI
    errors.textContent = "";
    tableHost.innerHTML = "";
        
        // 1) Read values from inputs (they come in as strings) - read the numbers the user typed into the input boxes on my form
        const hStart = parseInt($("hStart").value, 10); // means find the HTML element with id "hStart"
        const hEnd = parseInt($("hEnd").value, 10); // every input box has a .value property - it's whatever the user typed in
        const vStart = parseInt($("vStart").value, 10); // parseInt(..., 10) converts that string into an actual integer. The 10 means "use base-10(a.k.a., Decimal)"
        const vEnd = parseInt($("vEnd").value, 10); // Flow each line: Read an input → grab the text → convert it to a number → store it, so we can now do math in JS, because we made the string to real numbers

    // 2) Validate inputs and collect error messages
    const msgs = [];

        // helpers
        const isNum = (x) => Number.isFinite(x);
        const inRange = (x) => x >= -50 && x <= 50;

        // basic checks
        if (![hStart, hEnd, vStart, vEnd].every(isNum)) {
            msgs.push("All four values must be real numbers.");
        }
        if (![hStart, hEnd, vStart, vEnd].every(inRange)) {
            msgs.push("Values must be between -50 and 50 (INCLUSIVE).");
        }

       // Normalize ranges (swap start/end if needed) while preserving original variables
       let hs = hStart, he = hEnd, vs = vStart, ve = vEnd;
       if (isNum(hs) && isNum(he) && hs > he) [hs, he] = [he, hs];
       if (isNum(vs) && isNum(ve) && vs > ve) [vs, ve] = [ve, vs];
        
    // Compute table size and guard against huge tables
    const cols = isNum(hs) && isNum(he) ? (he - hs + 1) : 0;
    const rows = isNum(vs) && isNum(ve) ? (ve - vs + 1) : 0;
    const cells = rows * cols;
    const MAX_CELLS = 100000;
    if (cells <= 0) msgs.push("Ranges must produce at least one row and one column.");
    if (cells > MAX_CELLS) msgs.push(`Table too large (${cells}). Please reduce the range.`);

        if (msgs.length) { // If there's at least one error message in that list (if there's 0/null, then this condition returns false, else true)
            errors.textContent = msgs.join(" "); // refers to <div id="errors"> area - and .textContent changes the text inside that element. - lastly msgs.join(" ") combines all messages in the array into one string, separated by spaces.
            return; // if there are errors, no point continuing to build the table, so return exists the function early - preventing the rendering code below from running.
        }

    // Build table: create elements in memory, then attach to DOM
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    // top-left corner header
    const corner = document.createElement("th");
    corner.className = "corner"; // styled in CSS (e.g. sticky)
    corner.textContent = "x";
    headRow.appendChild(corner);

        // horizontal header cells
        for (let x = hs; x <= he; x++) {
            const th = document.createElement("th");
            th.textContent = String(x);
            headRow.appendChild(th);
        }
        thead.appendChild(headRow);
        table.appendChild(thead);

        // tbody rows and cells
        const tbody = document.createElement("tbody");
        for (let y = vs; y <= ve; y++) {
            const tr = document.createElement("tr");
            const rowTh = document.createElement("th"); // row header (left-most)
            rowTh.textContent = String(y);
            tr.appendChild(rowTh);

            for (let x = hs; x <= he; x++) {
                const td = document.createElement("td");
                td.textContent = String(x * y);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);

        tableHost.appendChild(table);

        // Hover handler: highlight the hovered row and its column (excluding top header
        // and left-most row labels by default).
        table.addEventListener("mouseover", (e) => {
            const td = e.target.closest("td, th");
            if (!td) return;

            // ignore the header area
            if (td.closest("thead")) return;
            if (td.cellIndex === 0) return; // skip left-most row-label column

            const col = td.cellIndex + 1; // convert 0-based cellIndex -> 1-based nth-child
            const t = td.closest("table");
            t.classList.add("col-hovering");

            // highlight cells in the same column within tbody
            t.querySelectorAll(`tbody td:nth-child(${col}), tbody th:nth-child(${col})`)
                .forEach(el => el.classList.add("col-hover"));

            td.closest("tr").classList.add("row-hover");
        });


        table.addEventListener("mouseout", (e) => {
            const td = e.target.closest("td, th");
            if (!td) return;
            table.querySelectorAll(".col-hover").forEach(el => el.classList.remove("col-hover"));
            table.querySelectorAll(".row-hover").forEach(el => el.classList.remove("row-hover"));
            table.classList.remove("col-hovering");
            });

        });

        clearBtn.addEventListener("click", () => {
            // Resets everything to olding empty strings
            $("hStart").value = "";
            $("hEnd").value = "";
            $("vStart").value = "";
            $("vEnd").value = "";
            errors.textContent = "";
            tableHost.innerHTML = "";
        });
});