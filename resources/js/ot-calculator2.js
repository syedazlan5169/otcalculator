document.addEventListener("DOMContentLoaded", function () {
    const gajiInput = document.getElementById("gaji");
    const kadarInput = document.getElementById("kadar-satu-jam");

    // Function to format number with thousand separators
    function formatNumberWithCommas(num) {
        if (!num && num !== 0) return "";
        const parts = num.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    // Function to remove commas from string
    function removeCommas(str) {
        return str.replace(/,/g, "");
    }

    function formatCurrency(input) {
        input.addEventListener("blur", function () {
            if (this.value) {
                const numValue = parseFloat(removeCommas(this.value));
                if (!isNaN(numValue)) {
                    this.value = formatNumberWithCommas(numValue.toFixed(2));
                }
            }
        });

        input.addEventListener("input", function (e) {
            const cursorPosition = this.selectionStart;
            const oldValue = this.value;

            // Remove commas first, then allow only numbers and decimal point
            let newValue = removeCommas(this.value).replace(/[^0-9.]/g, "");

            // Prevent multiple decimal points
            const parts = newValue.split(".");
            if (parts.length > 2) {
                newValue = parts[0] + "." + parts.slice(1).join("");
            }

            if (oldValue !== newValue) {
                this.value = newValue;
                // Restore cursor position, adjusting for removed characters
                const diff = newValue.length - oldValue.length;
                const newCursorPosition = Math.max(
                    0,
                    Math.min(cursorPosition + diff, newValue.length)
                );
                this.setSelectionRange(newCursorPosition, newCursorPosition);
            }
        });
    }

    formatCurrency(gajiInput);

    // Function to truncate to 2 decimal places (not round)
    function truncateToTwoDecimals(num) {
        return Math.floor(num * 100) / 100;
    }

    // Function to calculate and update Kadar Satu Jam
    function calculateKadarSatuJam() {
        const gaji = parseFloat(removeCommas(gajiInput.value)) || 0;
        const kadarSatuJam = truncateToTwoDecimals((gaji * 12) / 2504);
        kadarInput.value = kadarSatuJam.toFixed(2);
        // Trigger total calculation when Kadar Satu Jam changes
        calculateTotals();
    }

    // Update Kadar Satu Jam when Gaji changes
    gajiInput.addEventListener("input", function () {
        calculateKadarSatuJam();
    });
    gajiInput.addEventListener("blur", function () {
        calculateKadarSatuJam();
    });

    // Get table body reference
    const tableBody = document.getElementById("ot-table-body");

    // Function to calculate and update totals
    function calculateTotals() {
        // Calculate total for Jumlah Jam Lembur column (index 3)
        let totalJumlahJam = 0;
        const rows = tableBody.querySelectorAll("tr");
        rows.forEach(function (row) {
            const input = row.querySelectorAll("td")[3]?.querySelector("input");
            if (input && input.value) {
                const hours = parseInt(input.value) || 0;
                totalJumlahJam += hours;
            }
        });
        const totalJumlahElement = document.getElementById("total-jumlah-jam");
        if (totalJumlahElement) {
            totalJumlahElement.textContent = totalJumlahJam;
        }

        // Calculate totals for multiplier columns
        const multipliers = [1.125, 1.25, 1.5, 1.75, 2.0];
        const multiplierIds = ["1.125", "1.25", "1.5", "1.75", "2.0"];
        const multiplierIndices = [4, 5, 6, 7, 8]; // Column indices for multiplier columns (0-based)

        multipliers.forEach(function (multiplier, index) {
            const colIndex = multiplierIndices[index];
            const multiplierId = multiplierIds[index];
            let totalHours = 0;

            // Sum all hours in this column
            rows.forEach(function (row) {
                const input = row
                    .querySelectorAll("td")
                    [colIndex]?.querySelector("input");
                if (input && input.value) {
                    const hours = parseInt(input.value) || 0;
                    totalHours += hours;
                }
            });

            // Update total hours display (first line)
            const totalHoursElement = document.getElementById(
                `total-hours-${multiplierId}`
            );
            if (totalHoursElement) {
                totalHoursElement.textContent = totalHours;
            }

            // Multiply by multiplier and update display (second line)
            const total = totalHours * multiplier;
            const totalElement = document.getElementById(
                `total-${multiplierId}`
            );
            if (totalElement) {
                totalElement.textContent = total.toFixed(2);
            }
        });

        // Calculate Jumlah Tuntutan (Grand Total)
        const kadarSatuJam = parseFloat(kadarInput.value) || 0;
        let grandTotal = 0;

        multipliers.forEach(function (multiplier, index) {
            const colIndex = multiplierIndices[index];
            let totalHours = 0;

            // Sum all hours in this column
            rows.forEach(function (row) {
                const input = row
                    .querySelectorAll("td")
                    [colIndex]?.querySelector("input");
                if (input && input.value) {
                    const hours = parseInt(input.value) || 0;
                    totalHours += hours;
                }
            });

            // Calculate: total hours × multiplier × Kadar Satu Jam
            grandTotal += totalHours * multiplier * kadarSatuJam;
        });

        // Update Jumlah Tuntutan display with thousand separators
        const jumlahTuntutanElement =
            document.getElementById("jumlah-tuntutan");
        if (jumlahTuntutanElement) {
            jumlahTuntutanElement.textContent = formatNumberWithCommas(
                grandTotal.toFixed(2)
            );
        }
    }

    // Function to create a new table row
    function createTableRow() {
        const row = document.createElement("tr");
        row.className = "hover:bg-slate-50 transition-colors duration-150";
        row.innerHTML = `
            <td class="px-3 py-3 whitespace-nowrap">
                <input 
                    type="date" 
                    class="w-full px-2 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white text-gray-900"
                />
            </td>
            <td class="px-3 py-3 whitespace-nowrap min-w-[140px]">
                <select class="waktu-kerja-select w-full min-w-[140px] px-2 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white text-gray-900">
                    <option value=""> </option>
                    <option value="0000-0800">0000 - 0800</option>
                    <option value="0700-1600">0700 - 1600</option>
                    <option value="1500-0000">1500 - 0000</option>
                    <option value="KELEPASAN_GILIRAN">KEL. GILIRAN</option>
                    <option value="KELEPASAN_AM">KEL. AM</option>
                    <option value="KELEPASAN_AM_GANTIAN">KEL. AM GANTIAN</option>
                </select>
            </td>
            <td class="px-3 py-3 whitespace-nowrap min-w-[140px]">
                <select class="waktu-lembur-select w-full min-w-[140px] px-2 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white text-gray-900">
                    <option value=""> </option>
                    <option value="0000-0800">0000 - 0800</option>
                    <option value="0700-1600">0700 - 1600</option>
                    <option value="1500-0000">1500 - 0000</option>
                    <option value="0800-1600">0800 - 1600</option>
                    <option value="1600-0000">1600 - 0000</option>
                    <option value="0000-0700">0000 - 0700</option>
                    <option value="0700-1500">0700 - 1500</option>
                    <option value="0800-1500">0800 - 1500</option>
                </select>
            </td>
            <td class="px-3 py-3 whitespace-nowrap text-center">
                <input 
                    type="number" 
                    step="1"
                    min="0"
                    placeholder="0"
                    readonly
                    class="jumlah-jam-input w-full px-2 py-2 text-sm border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-400 cursor-not-allowed text-center"
                />
            </td>
            <td class="px-2 py-3 whitespace-nowrap">
                <input 
                    type="number" 
                    step="1"
                    min="0"
                    placeholder="0"
                    class="w-full px-2 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white text-gray-900 placeholder-gray-400 text-center"
                />
            </td>
            <td class="px-2 py-3 whitespace-nowrap">
                <input 
                    type="number" 
                    step="1"
                    min="0"
                    placeholder="0"
                    class="w-full px-2 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white text-gray-900 placeholder-gray-400 text-center"
                />
            </td>
            <td class="px-2 py-3 whitespace-nowrap">
                <input 
                    type="number" 
                    step="1"
                    min="0"
                    placeholder="0"
                    class="w-full px-2 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white text-gray-900 placeholder-gray-400 text-center"
                />
            </td>
            <td class="px-2 py-3 whitespace-nowrap">
                <input 
                    type="number" 
                    step="1"
                    min="0"
                    placeholder="0"
                    class="w-full px-2 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white text-gray-900 placeholder-gray-400 text-center"
                />
            </td>
            <td class="px-2 py-3 whitespace-nowrap">
                <input 
                    type="number" 
                    step="1"
                    min="0"
                    placeholder="0"
                    class="w-full px-2 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white text-gray-900 placeholder-gray-400 text-center"
                />
            </td>
            <td class="px-2 py-3 whitespace-nowrap text-center">
                <button 
                    type="button" 
                    class="clear-row-btn px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-lg border-2 border-red-700"
                    style="opacity: 1 !important; visibility: visible !important; display: inline-block !important; min-width: 40px; min-height: 32px;"
                    title="Clear this row"
                >
                    <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline-block !important;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </td>
        `;

        // Add event listeners to hour inputs in the new row
        const hourInputs = row.querySelectorAll(
            'input[type="number"][step="1"]'
        );
        hourInputs.forEach(function (input) {
            input.addEventListener("input", function (e) {
                // Remove any decimal point or non-numeric characters
                if (this.value.includes(".")) {
                    this.value = this.value.split(".")[0];
                }
                // Only allow digits
                this.value = this.value.replace(/[^0-9]/g, "");
                // Trigger total calculation
                calculateTotals();
            });
        });

        // Add event listeners to waktu kerja and waktu lembur selects
        const waktuKerjaSelect = row.querySelector(".waktu-kerja-select");
        const waktuLemburSelect = row.querySelector(".waktu-lembur-select");
        const jumlahJamInput = row.querySelector(".jumlah-jam-input");

        // Get rate input references
        const rateInputs = {
            1.125: row.querySelectorAll("td")[4]?.querySelector("input"),
            1.25: row.querySelectorAll("td")[5]?.querySelector("input"),
            1.5: row.querySelectorAll("td")[6]?.querySelector("input"),
            1.75: row.querySelectorAll("td")[7]?.querySelector("input"),
            "2.0": row.querySelectorAll("td")[8]?.querySelector("input"),
        };

        // Function to recalculate all rows (for continuous overtime detection)
        function recalculateAllRows() {
            const allRows = tableBody.querySelectorAll("tr");
            const rowData = [];

            // Collect all row data
            allRows.forEach((r) => {
                const dateInput = r.querySelector('input[type="date"]');
                const waktuKerjaSel = r.querySelector(".waktu-kerja-select");
                const waktuLemburSel = r.querySelector(".waktu-lembur-select");
                const jumlahJamIn = r.querySelector(".jumlah-jam-input");
                const rateInps = {
                    1.125: r.querySelectorAll("td")[4]?.querySelector("input"),
                    1.25: r.querySelectorAll("td")[5]?.querySelector("input"),
                    1.5: r.querySelectorAll("td")[6]?.querySelector("input"),
                    1.75: r.querySelectorAll("td")[7]?.querySelector("input"),
                    "2.0": r.querySelectorAll("td")[8]?.querySelector("input"),
                };

                if (dateInput && waktuKerjaSel && waktuLemburSel) {
                    rowData.push({
                        row: r,
                        date: dateInput.value,
                        waktuKerja: waktuKerjaSel.value,
                        waktuLembur: waktuLemburSel.value,
                        jumlahJamInput: jumlahJamIn,
                        rateInputs: rateInps,
                    });
                }
            });

            // Group rows by date
            const rowsByDate = {};
            rowData.forEach((data) => {
                if (data.date && data.waktuKerja && data.waktuLembur) {
                    if (!rowsByDate[data.date]) {
                        rowsByDate[data.date] = [];
                    }
                    rowsByDate[data.date].push(data);
                }
            });

            // Process each row
            rowData.forEach((data) => {
                // Clear inputs first
                Object.values(data.rateInputs).forEach((input) => {
                    if (input) input.value = "";
                });
                if (data.jumlahJamInput) data.jumlahJamInput.value = "";

                if (!data.waktuKerja || !data.waktuLembur) {
                    return;
                }

                // Update jumlah jam
                const waktuLemburHours = {
                    "0000-0800": 8,
                    "0700-1600": 9,
                    "1500-0000": 9,
                    "0800-1600": 8,
                    "1600-0000": 8,
                    "0000-0700": 7,
                    "0700-1500": 8,
                    "0800-1500": 7,
                };
                if (data.jumlahJamInput) {
                    data.jumlahJamInput.value =
                        waktuLemburHours[data.waktuLembur] || "";
                }

                // Determine rates based on waktu kerja
                let dayRate, nightRate;
                if (
                    data.waktuKerja === "0000-0800" ||
                    data.waktuKerja === "0700-1600" ||
                    data.waktuKerja === "1500-0000"
                ) {
                    dayRate = 1.125;
                    nightRate = 1.25;
                } else if (data.waktuKerja === "KELEPASAN_GILIRAN") {
                    dayRate = 1.25;
                    nightRate = 1.5;
                } else if (
                    data.waktuKerja === "KELEPASAN_AM" ||
                    data.waktuKerja === "KELEPASAN_AM_GANTIAN"
                ) {
                    dayRate = 1.75;
                    nightRate = "2.0";
                }

                // Calculate hours based on waktu kerja and waktu lembur
                let dayHours = 0;
                let nightHours = 0;

                // Case 1: waktu kerja = 0000-0800, waktu lembur = 0800-1600 (standalone)
                if (
                    data.waktuKerja === "0000-0800" &&
                    data.waktuLembur === "0800-1600"
                ) {
                    // Check if this is part of continuous overtime
                    const dateRows = rowsByDate[data.date] || [];
                    const has1600_0000 = dateRows.some(
                        (r) =>
                            r.waktuKerja === "0000-0800" &&
                            r.waktuLembur === "1600-0000" &&
                            r !== data
                    );

                    if (!has1600_0000) {
                        // Standalone: full 8 hours day rate
                        dayHours = 8;
                        nightHours = 0;
                    } else {
                        // Part of continuous: full 8 hours day rate (no 9th hour deduction for first row)
                        dayHours = 8;
                        nightHours = 0;
                    }
                }
                // Case 2: waktu kerja = 0000-0800, waktu lembur = 1600-0000
                else if (
                    data.waktuKerja === "0000-0800" &&
                    data.waktuLembur === "1600-0000"
                ) {
                    // Check if this is part of continuous overtime
                    const dateRows = rowsByDate[data.date] || [];
                    const has0800_1600 = dateRows.some(
                        (r) =>
                            r.waktuKerja === "0000-0800" &&
                            r.waktuLembur === "0800-1600" &&
                            r !== data
                    );

                    if (has0800_1600) {
                        // Continuous overtime: 9th hour is at 1600-1700 (from start at 0800)
                        // 1600-0000 breakdown: 1600-2200 = 6 day, 2200-0000 = 2 night
                        // Deduct 9th hour (1600-1700) from day: 6 - 1 = 5 day, 2 night
                        dayHours = 5;
                        nightHours = 2;
                    } else {
                        // Standalone: 8 hours (6 day + 2 night), no 9th hour deduction
                        dayHours = 6;
                        nightHours = 2;
                    }
                }
                // Case 3: waktu kerja = 0000-0800, waktu lembur = 1500-0000 (standalone)
                else if (
                    data.waktuKerja === "0000-0800" &&
                    data.waktuLembur === "1500-0000"
                ) {
                    // 9 hours: 7 day (1500-2200) + 2 night (2200-0000)
                    // 9th hour from start (1500) = 2300-0000 (night shift)
                    // Deduct 9th hour (1 hour from night): 7 day + 1 night
                    dayHours = 7;
                    nightHours = 1;
                }
                // Case 4: waktu kerja = 0700-1600, waktu lembur = 0000-0700
                else if (
                    data.waktuKerja === "0700-1600" &&
                    data.waktuLembur === "0000-0700"
                ) {
                    // Check if this is part of continuous overtime with 1600-0000
                    const dateRows = rowsByDate[data.date] || [];
                    const has1600_0000 = dateRows.some(
                        (r) =>
                            r.waktuKerja === "0700-1600" &&
                            r.waktuLembur === "1600-0000" &&
                            r !== data
                    );

                    if (has1600_0000) {
                        // Continuous overtime: 0000-0700 breakdown
                        // 0000-0600 = 6 hours night, 0600-0700 = 1 hour day
                        dayHours = 1;
                        nightHours = 6;
                    } else {
                        // Standalone: 0000-0700 breakdown
                        // 0000-0600 = 6 hours night (2200-0600 is night shift)
                        // 0600-0700 = 1 hour day (0600-2200 is day shift)
                        // No 9th hour deduction (only 7 hours)
                        dayHours = 1;
                        nightHours = 6;
                    }
                }
                // Case 5: waktu kerja = 0700-1600, waktu lembur = 1600-0000
                else if (
                    data.waktuKerja === "0700-1600" &&
                    data.waktuLembur === "1600-0000"
                ) {
                    // Check if this is part of continuous overtime with 0000-0700
                    const dateRows = rowsByDate[data.date] || [];
                    const has0000_0700 = dateRows.some(
                        (r) =>
                            r.waktuKerja === "0700-1600" &&
                            r.waktuLembur === "0000-0700" &&
                            r !== data
                    );

                    if (has0000_0700) {
                        // Continuous overtime: 1600-0000 breakdown
                        // 1600-2200 = 6 hours day, 2200-0000 = 2 hours night
                        // No 9th hour deduction
                        dayHours = 6;
                        nightHours = 2;
                    } else {
                        // Standalone: 6 day (1600-2200) + 2 night (2200-0000), no 9th hour deduction
                        dayHours = 6;
                        nightHours = 2;
                    }
                }
                // Case 6: waktu kerja = 1500-0000, waktu lembur = 0000-0800
                else if (
                    data.waktuKerja === "1500-0000" &&
                    data.waktuLembur === "0000-0800"
                ) {
                    // Check if this is part of continuous overtime with 0800-1500
                    const dateRows = rowsByDate[data.date] || [];
                    const has0800_1500 = dateRows.some(
                        (r) =>
                            r.waktuKerja === "1500-0000" &&
                            r.waktuLembur === "0800-1500" &&
                            r !== data
                    );

                    if (has0800_1500) {
                        // Continuous overtime: 0000-0800 breakdown
                        // 0000-0600 = 6 hours night, 0600-0800 = 2 hours day
                        // No 9th hour deduction (9th hour is in the next row)
                        dayHours = 2;
                        nightHours = 6;
                    } else {
                        // Standalone case: 0000-0800 breakdown
                        // 0000-0600 = 6 hours night (2200-0600 is night shift)
                        // 0600-0800 = 2 hours day (0600-2200 is day shift)
                        // No 9th hour deduction (only 8 hours)
                        dayHours = 2;
                        nightHours = 6;
                    }
                }
                // Case 7: waktu kerja = 1500-0000, waktu lembur = 0800-1500
                else if (
                    data.waktuKerja === "1500-0000" &&
                    data.waktuLembur === "0800-1500"
                ) {
                    // Check if this is part of continuous overtime with 0000-0800
                    const dateRows = rowsByDate[data.date] || [];
                    const has0000_0800 = dateRows.some(
                        (r) =>
                            r.waktuKerja === "1500-0000" &&
                            r.waktuLembur === "0000-0800" &&
                            r !== data
                    );

                    if (has0000_0800) {
                        // Continuous overtime: 0800-1500 breakdown
                        // Original: 0800-1500 = 7 hours (all day, since 0600-2200 is day)
                        // 9th hour from start (0000) is at 0800-0900, which falls in this period
                        // Deduct 9th hour: 7 - 1 = 6 hours day rate
                        dayHours = 6;
                        nightHours = 0;
                    } else {
                        // Standalone: 0800-1500 = 7 hours (all day)
                        // No 9th hour deduction (only 7 hours)
                        dayHours = 7;
                        nightHours = 0;
                    }
                }
                // Case 7b: waktu kerja = 1500-0000, waktu lembur = 0700-1500 (standalone)
                else if (
                    data.waktuKerja === "1500-0000" &&
                    data.waktuLembur === "0700-1500"
                ) {
                    // Pre-deducted version: overlap already deducted
                    // Claim hours: 0700-1500 = 8 hours
                    // All 8 hours are day rate (0600-2200 is day shift)
                    // No 9th hour deduction (only 8 hours)
                    dayHours = 8;
                    nightHours = 0;
                }
                // Case 8: KELEPASAN cases with basic waktu lembur
                else if (
                    (data.waktuKerja === "KELEPASAN_GILIRAN" ||
                        data.waktuKerja === "KELEPASAN_AM" ||
                        data.waktuKerja === "KELEPASAN_AM_GANTIAN") &&
                    (data.waktuLembur === "0000-0800" ||
                        data.waktuLembur === "0700-1600" ||
                        data.waktuLembur === "1500-0000")
                ) {
                    if (data.waktuLembur === "0000-0800") {
                        // Check if this is part of continuous overtime with 0800-1600
                        const dateRows = rowsByDate[data.date] || [];
                        const has0800_1600 = dateRows.some(
                            (r) =>
                                (r.waktuKerja === "KELEPASAN_GILIRAN" ||
                                    r.waktuKerja === "KELEPASAN_AM" ||
                                    r.waktuKerja === "KELEPASAN_AM_GANTIAN") &&
                                r.waktuLembur === "0800-1600" &&
                                r !== data
                        );

                        if (has0800_1600) {
                            // Continuous overtime: 0000-0800 breakdown
                            // 0000-0600 = 6 hours night, 0600-0800 = 2 hours day
                            // No 9th hour deduction (9th hour is in the next row)
                            nightHours = 6;
                            dayHours = 2;
                        } else {
                            // Standalone: 8 hours: 6 night (0000-0600) + 2 day (0600-0800)
                            nightHours = 6;
                            dayHours = 2;
                            // No 9th hour deduction (only 8 hours)
                        }
                    } else if (data.waktuLembur === "0700-1600") {
                        // Check if this is part of continuous overtime with 1600-0000
                        const dateRows = rowsByDate[data.date] || [];
                        const has1600_0000 = dateRows.some(
                            (r) =>
                                (r.waktuKerja === "KELEPASAN_GILIRAN" ||
                                    r.waktuKerja === "KELEPASAN_AM" ||
                                    r.waktuKerja === "KELEPASAN_AM_GANTIAN") &&
                                r.waktuLembur === "1600-0000" &&
                                r !== data
                        );

                        if (has1600_0000) {
                            // Continuous overtime: 0700-1600 breakdown
                            // Original: 0700-1600 = 9 hours (all day)
                            // 9th hour from start (0700) is at 1500-1600, which falls in this period
                            // Deduct 9th hour: 9 - 1 = 8 hours day rate (0700-1500)
                            dayHours = 8;
                            nightHours = 0;
                        } else {
                            // Standalone: 9 hours: all day (0700-1600)
                            dayHours = 9;
                            nightHours = 0;
                            // Deduct 9th hour (1 hour from day)
                            dayHours = 8;
                        }
                    } else if (data.waktuLembur === "1500-0000") {
                        // 9 hours: 7 day (1500-2200) + 2 night (2200-0000)
                        dayHours = 7;
                        nightHours = 2;
                        // Deduct 9th hour (1 hour from night)
                        nightHours = 1;
                    }
                }
                // Case 9: KELEPASAN cases with waktu lembur = 0800-1600
                else if (
                    (data.waktuKerja === "KELEPASAN_GILIRAN" ||
                        data.waktuKerja === "KELEPASAN_AM" ||
                        data.waktuKerja === "KELEPASAN_AM_GANTIAN") &&
                    data.waktuLembur === "0800-1600"
                ) {
                    // Check if this is part of continuous overtime with 0000-0800
                    const dateRows = rowsByDate[data.date] || [];
                    const has0000_0800 = dateRows.some(
                        (r) =>
                            (r.waktuKerja === "KELEPASAN_GILIRAN" ||
                                r.waktuKerja === "KELEPASAN_AM" ||
                                r.waktuKerja === "KELEPASAN_AM_GANTIAN") &&
                            r.waktuLembur === "0000-0800" &&
                            r !== data
                    );

                    if (has0000_0800) {
                        // Continuous overtime: 0800-1600 breakdown
                        // Original: 0800-1600 = 8 hours (all day, since 0600-2200 is day)
                        // 9th hour from start (0000) is at 0800-0900, which falls in this period
                        // Deduct 9th hour: 8 - 1 = 7 hours day rate
                        dayHours = 7;
                        nightHours = 0;
                    } else {
                        // Standalone: 0800-1600 = 8 hours (all day)
                        // No 9th hour deduction (only 8 hours)
                        dayHours = 8;
                        nightHours = 0;
                    }
                }
                // Case 10: KELEPASAN cases with waktu lembur = 1600-0000
                else if (
                    (data.waktuKerja === "KELEPASAN_GILIRAN" ||
                        data.waktuKerja === "KELEPASAN_AM" ||
                        data.waktuKerja === "KELEPASAN_AM_GANTIAN") &&
                    data.waktuLembur === "1600-0000"
                ) {
                    // Check if this is part of continuous overtime with 0700-1600
                    const dateRows = rowsByDate[data.date] || [];
                    const has0700_1600 = dateRows.some(
                        (r) =>
                            (r.waktuKerja === "KELEPASAN_GILIRAN" ||
                                r.waktuKerja === "KELEPASAN_AM" ||
                                r.waktuKerja === "KELEPASAN_AM_GANTIAN") &&
                            r.waktuLembur === "0700-1600" &&
                            r !== data
                    );

                    if (has0700_1600) {
                        // Continuous overtime: 1600-0000 breakdown
                        // 1600-2200 = 6 hours day, 2200-0000 = 2 hours night
                        // No 9th hour deduction (9th hour was already deducted from first row)
                        dayHours = 6;
                        nightHours = 2;
                    } else {
                        // Standalone: 1600-0000 = 8 hours
                        // 1600-2200 = 6 hours day, 2200-0000 = 2 hours night
                        // No 9th hour deduction (only 8 hours)
                        dayHours = 6;
                        nightHours = 2;
                    }
                }

                // Fill in the rate inputs
                if (dayRate && data.rateInputs[dayRate] && dayHours > 0) {
                    data.rateInputs[dayRate].value = dayHours;
                }
                if (nightRate && data.rateInputs[nightRate] && nightHours > 0) {
                    data.rateInputs[nightRate].value = nightHours;
                }
            });

            calculateTotals();
        }

        // Function to calculate overtime for row (triggers recalculation of all rows)
        function calculateOvertimeForRow() {
            recalculateAllRows();
        }

        waktuKerjaSelect.addEventListener("change", function () {
            calculateOvertimeForRow();
        });

        waktuLemburSelect.addEventListener("change", function () {
            calculateOvertimeForRow();
        });

        // Add date change listener
        const dateInput = row.querySelector('input[type="date"]');
        if (dateInput) {
            dateInput.addEventListener("change", function () {
                calculateOvertimeForRow();
            });
        }

        // Add clear row button event listener
        const clearRowBtn = row.querySelector(".clear-row-btn");
        if (clearRowBtn) {
            clearRowBtn.addEventListener("click", function () {
                // Clear date input
                if (dateInput) dateInput.value = "";

                // Clear dropdowns
                if (waktuKerjaSelect) waktuKerjaSelect.value = "";
                if (waktuLemburSelect) waktuLemburSelect.value = "";

                // Clear jumlah jam input
                if (jumlahJamInput) jumlahJamInput.value = "";

                // Clear all rate inputs
                hourInputs.forEach((input) => {
                    if (
                        input &&
                        !input.classList.contains("jumlah-jam-input")
                    ) {
                        input.value = "";
                    }
                });

                // Recalculate totals
                calculateTotals();
            });
        }

        return row;
    }

    // Initialize with 6 rows
    for (let i = 0; i < 6; i++) {
        tableBody.appendChild(createTableRow());
    }

    // Format hour inputs to only allow whole numbers (for initial rows)
    const hourInputs = document.querySelectorAll(
        'input[type="number"][step="1"]'
    );
    hourInputs.forEach(function (input) {
        input.addEventListener("input", function (e) {
            // Remove any decimal point or non-numeric characters
            if (this.value.includes(".")) {
                this.value = this.value.split(".")[0];
            }
            // Only allow digits
            this.value = this.value.replace(/[^0-9]/g, "");
            // Trigger total calculation
            calculateTotals();
        });
    });

    // Add row button functionality
    const addRowBtn = document.getElementById("add-row-btn");
    addRowBtn.addEventListener("click", function () {
        const newRow = createTableRow();
        tableBody.appendChild(newRow);
        calculateTotals();
    });

    // Clear All button functionality
    const clearAllBtn = document.getElementById("clear-all-btn");
    clearAllBtn.addEventListener("click", function () {
        if (confirm("Are you sure you want to clear all entries?")) {
            // Clear all table rows
            const rows = tableBody.querySelectorAll("tr");
            rows.forEach(function (row) {
                // Clear date input
                const dateInput = row.querySelector('input[type="date"]');
                if (dateInput) dateInput.value = "";

                // Clear dropdowns
                const waktuKerjaSelect = row.querySelector(
                    ".waktu-kerja-select"
                );
                const waktuLemburSelect = row.querySelector(
                    ".waktu-lembur-select"
                );
                if (waktuKerjaSelect) waktuKerjaSelect.value = "";
                if (waktuLemburSelect) waktuLemburSelect.value = "";

                // Clear jumlah jam input
                const jumlahJamInput = row.querySelector(".jumlah-jam-input");
                if (jumlahJamInput) jumlahJamInput.value = "";

                // Clear all rate inputs
                const rateInputs = row.querySelectorAll(
                    'input[type="number"][step="1"]'
                );
                rateInputs.forEach(function (input) {
                    if (!input.classList.contains("jumlah-jam-input")) {
                        input.value = "";
                    }
                });
            });

            // Recalculate totals (will reset all totals to 0)
            calculateTotals();
        }
    });

    // Initial formatting and calculation
    if (gajiInput.value) {
        const numValue = parseFloat(removeCommas(gajiInput.value));
        if (!isNaN(numValue)) {
            gajiInput.value = formatNumberWithCommas(numValue.toFixed(2));
        }
    }
    calculateKadarSatuJam();
    calculateTotals();
});
