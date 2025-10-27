

// Putting everything in this block says, don't run my JavaS Script until the browser has finished building the web page
//. The reason this is done because some HTML components need to render in the browser before the script to run it, or else it will run when the elements don't exist yet.
document.addEventListener("DOMContentLoaded", () => { 
    // We're going to now map a reference specific elements in our HTML to variables in our JS script
    const form = document.getElementById("table-form"); // "table-form" is the intended element in HTML
    const clearBtn = document.getElementById("clearBtn");
    const tableHost = document.getElementById("tableHost");
    const errors = document.getElementById("errors");

    // For convenience: const,   We're defining a shortcut function called '$': instead of typing document.getElementById("something") everytime.
    const $ = (id) => document.getElementById(id); // The arrow funciton takes one parameter called 'id', so thats all you pass in when you call $("argument");
    
    // This line says whenever the user submits the form(element base) - for example, by pressing enter, or clicking the submit button - run this function
    form.addEventListener("submit", (evt) => { // This is what makes the app interactive whenever you hit enter - or trigger the "submit" event type - after which the browswer gives us special object called 'evt'
    // This block will read the user's 4 INPUT VALUES - Check if they're valid - Generate the Multiplication Table Dynamically
       
        evt.preventDefault(); // First thing we do in this block, to stop the default page reload behavior: 
        
        errors.textContent = ""; // clear old errors, "erase the warning message before checking again for a new error", essentially if there was a prior error, it will be wiped "from memory", think of it like that, so state doesn't persist
        tableHost.innerHTML = ""; // clear previous table, "Wipe the whiteboard before drawing a new chart", if you didn't clear, each new "Generate Table" would just keep adding new tables below the old one- messy and confusing
        
        // 1) Read values from inputs (they come in as strings) - read the numbers the user typed into the input boxes on my form
        const hStart = parseInt($("hStart").value, 10); // means find the HTML element with id "hStart"
        const hEnd = parseInt($("hEnd").value, 10); // every input box has a .value property - it's whatever the user typed in
        const vStart = parseInt($("vStart").value, 10); // parseInt(..., 10) converts that string into an actual integer. The 10 means "use base-10(a.k.a., Decimal)"
        const vEnd = parseInt($("vEnd").value, 10); // Flow each line: Read an input → grab the text → convert it to a number → store it, so we can now do math in JS, because we made the string to real numbers

        // 2) Validate: check if the inputs are valid: 
        //              are they real numbers, are they between −50 and 50, and is start smaller than end?”
        const msgs = [];    // An empty array that will hold all the validation error messages found during input validation-
                            //  ...Instead of stopping after the first error,this collects all the problems and then show them together.

        // These lines check two things about hte 4 numbers ('hStart', 'hEnd', 'vStart', 'vEnd'):
        //      1. Are they actually numbers?
        //      2. Are they within the allowed range (-50 to 50)?
        // ... if not, an error message gets added to the msgs array created above
        const isNum = (x) => Number.isFinite(x); // Helper function that checks if x is a real number (not NaN, null, or undefined)
        
        // the conditional makes a temporary array of the 4 values, and tests whether ALL of them return True, when passed into the 'isNum' helper function
        if (![hStart, hEnd, vStart, vEnd].every(isNum)) { // It would be same as doing [4, 10, -2, 8], but we're passing in the values from the input boxes
            msgs.push("All four values must be real numbers."); // Adds the message to the list of errors
        }

        //
        const inRange = (x) => x >= -50 && x <=50; // Helper function that returns true if x is between -50 and 50 (inclusive), otherwise False
        if (![hStart, hEnd, vStart, vEnd].every(inRange)) {
            msgs.push("Values must be between -50 and 50 (INCLUSIVE).");
        }

        // If no errors so far, normalize ranges (swap if start > end)
        // First we create four new variables, these new copies might have values changed(swapped) - leaving the originals untouched
        let hs = hStart, he = hEnd, vs = vStart, ve = vEnd;

        // First condition
        if (isNum(hs) && isNum(he) && hs > he) { // If both hs and he are valid numbers, and the start (hs) is greater than the end (he), continue to code block which swaps values
             [hs, he] = [he, hs]; // array destructuring assignment, a clean way to swap values w/o using a temporary variable
        }
        // Second condition
        if (isNum(vs) && isNum(ve) && vs > ve) {
            [vs, ve] = [ve, vs]; }
        
        // 3) Prevent HUGE tables from freezing UI / Calculate how big the multiplication table will be

        // Check that both start and end values are valid numbers - ? and : make up a ternary operator, a compact "if-else" in one line:
        const cols = isNum(hs) && isNum(he) ? (he - hs + 1) : 0; //  'condition' ? 'valueIfTrue' : 'valueIfFalse' 
        const rows = isNum(vs) && isNum(ve) ? (ve - vs + 1) : 0;
        const cells = rows * cols;

        // Don't let the browser freeze by generating a giant table - set a reasonable maximum size 4 the table
        const MAX_CELLS = 100000; // e.g., 100(-50 to 50: row values) x 100 (-50 to 50: col values) = 10,000
        if (cells <= 0 ) { msgs.push("Ranges must produce at least one row and one column."); }
        if (cells > MAX_CELLS) { msgs.push(`Table too large (${cells}). Please reduce the range.`); }

        if (msgs.length) { // If there's at least one error message in that list (if there's 0/null, then this condition returns false, else true)
            errors.textContent = msgs.join(" "); // refers to <div id="errors"> area - and .textContent changes the text inside that element. - lastly msgs.join(" ") combines all messages in the array into one string, separated by spaces.
            return; // if there are errors, no point continuing to build the table, so return exists the function early - preventing the rendering code below from running.
        }

        // 4) Bulid table efficiently using DOM APIs
        const table = document.createElement("table"); // creates building blocks, but not render them yet, create new table element in memory

        // THEAD with top header row
        const thead = document.createElement("thead"); // create new <thead> HTML element object in memory 
        const headRow = document.createElement("tr"); // creates corresponding real DOM element type - just not yet atttached to the visible page.

        // Top left corner cell
        const corner = document.createElement("th"); // creates table header cell element in memory (its the top-left intersection of the table headers)
        corner.className = "corner"; // gives the <th> element a css class called "corner", which in css (.corner) we make sticky in both directions(top and left) so it stays in place when we scroll
        corner.textContent = "x"; // sets the visible text "x"(multiply symbol) inside that <th>, marking where the row and column headers meet
        headRow.appendChild(corner); //headRow is the <tr> from earlier - means attach this new <th> cell as a child inside that row
        //      Later the loop will add the rest of the header cells to that same row

        //horizontal header cells
        for (let x = hs; x <= he; x++) {
            const th = document.createElement("th"); // Create header cell
            th.textContent = String(x);              // label = current column value
            // render order: cell → row → header section → full table,
            headRow.appendChild(th);                 // put cell inside header row
        }
        thead.appendChild(headRow);         // attach header row to THEAD(header section)
        table.appendChild(thead);           // attach header section to table

        // TBODY with rows
        const tbody = document.createElement("tbody"); // make body cells for the table
        for (let y = vs; y <= ve; y++) {
            const tr = document.createElement("tr"); 

            // left header (row label)
            const rowTh = document.createElement("th");
            rowTh.textContent = String(y);
            tr.appendChild(rowTh);                      // add row label to this
            
            // cells
            for(let x = hs; x <= he; x++) {
                const td = document.createElement("td"); // create data cell in memory / DOM
                td.textContent = String(x * y);          // product for the cell
                tr.appendChild(td);                      // put the cell into the row  
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);

        tableHost.appendChild(table);

        table.addEventListener("mouseover", (e) => {
            const td = e.target.closest("td, th");
            if (!td) return;

            // Ignore header row entirely
            if (td.closest("thead")) return;
            // Ignore header(first) column entirely
            if (td.cellIndex === 0) return;

            const col = td.cellIndex + 1; // 1-based for :nth-child

            const t = td.closest("table");
            t.classList.add("col-hovering");

            // Highlight column only in tbody (not thead)
            t.querySelectorAll(`tbody td:nth-child(${col}), tbody th:nth-child(${col})`)
                .forEach(el => el.classList.add("col-hover"));

            // Highlight the hovered row (this row is in tbody due to the guard above)
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