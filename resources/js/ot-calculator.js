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
        const rateInputs = {
            1.125: row.querySelectorAll("td")[4]?.querySelector("input"),
            1.25: row.querySelectorAll("td")[5]?.querySelector("input"),
            1.5: row.querySelectorAll("td")[6]?.querySelector("input"),
            1.75: row.querySelectorAll("td")[7]?.querySelector("input"),
            "2.0": row.querySelectorAll("td")[8]?.querySelector("input"),
        };

        function calculateRowHours() {
            // Recalculate all rows to handle continuous overtime
            recalculateAllRows();
        }

        waktuKerjaSelect.addEventListener("change", calculateRowHours);
        waktuLemburSelect.addEventListener("change", calculateRowHours);

        // Add date change listener
        const dateInput = row.querySelector('input[type="date"]');
        if (dateInput) {
            dateInput.addEventListener("change", calculateRowHours);
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
                Object.values(rateInputs).forEach((input) => {
                    if (input) input.value = "";
                });

                // Recalculate totals and all rows
                calculateTotals();
                recalculateAllRows();
            });
        }

        return row;
    }

    // Global function to recalculate all rows
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

        // Process each row (individual calculation first)
        rowData.forEach((data) => {
            // Clear inputs first
            Object.values(data.rateInputs).forEach((input) => {
                if (input) input.value = "";
            });
            if (data.jumlahJamInput) data.jumlahJamInput.value = "";

            if (!data.waktuKerja || !data.waktuLembur) {
                return;
            }

            // Calculate individual row hours (without 9th hour deduction yet)
            const result = calculateIndividualRow(
                data.waktuKerja,
                data.waktuLembur
            );

            // Set jumlah jam lembur
            if (data.jumlahJamInput) {
                const waktuLemburHours = {
                    "0000-0800": 8,
                    "0700-1600": 9,
                    "1500-0000": 9,
                };
                data.jumlahJamInput.value =
                    waktuLemburHours[data.waktuLembur] || 0;
            }

            // Store initial calculation
            data.initialDayHours = result.dayHours;
            data.initialNightHours = result.nightHours;
            data.dayRate = result.dayRate;
            data.nightRate = result.nightRate;

            // Handle overlap case 1: waktu kerja 0000-0800 and waktu lembur 0700-1600
            // Overlap: 0700-0800 (1 hour, day shift) - deduct this first
            // 9th hour: 0800-0900 (1 hour, day shift) - will be deducted by apply9thHourDeduction
            // Total deduction: 2 hours from day rate (9 - 1 - 1 = 7)
            if (
                data.waktuKerja === "0000-0800" &&
                data.waktuLembur === "0700-1600"
            ) {
                // Deduct 1 hour for overlap (0700-0800)
                if (data.initialDayHours > 0) {
                    data.initialDayHours--;
                }
                // The 9th hour deduction (0800-0900) will be handled by apply9thHourDeduction later
            }

            // Handle overlap case 2: waktu kerja 0700-1600 and waktu lembur 1500-0000
            // Overlap: 1500-1600 (1 hour, day shift)
            // 9th hour: 1500-1600 (1 hour, day shift) - same as overlap hour!
            // Since overlap and 9th hour are the same, apply9thHourDeduction will handle the deduction
            // Total deduction: 1 hour from day rate (7 - 1 = 6 day, 2 night)
            // No need to deduct overlap separately since it's the same as 9th hour

            // Handle overlap case 3: waktu kerja 0700-1600 and waktu lembur 0000-0800
            // Overlap: 0700-0800 (1 hour, day shift) - deduct this
            // Since work starts at 0700, overtime should stop at 0700 instead of 0800
            // Total deduction: 1 hour from day rate (2 - 1 = 1 day, 6 night)
            if (
                data.waktuKerja === "0700-1600" &&
                data.waktuLembur === "0000-0800"
            ) {
                // Deduct 1 hour for overlap (0700-0800)
                if (data.initialDayHours > 0) {
                    data.initialDayHours--;
                }
            }
        });

        // Process continuous overtime for same dates
        Object.keys(rowsByDate).forEach((date) => {
            const dateRows = rowsByDate[date].sort((a, b) => {
                const order = {
                    "0000-0800": 1,
                    "0700-1600": 2,
                    "1500-0000": 3,
                };
                return (
                    (order[a.waktuLembur] || 0) - (order[b.waktuLembur] || 0)
                );
            });

            if (dateRows.length > 1) {
                // Special case 1: Check for 24-hour continuous period
                // When waktu kerja is 0000-0800 (not KELEPASAN) and there are 0700-1600 & 1500-0000
                const has0700_1600 = dateRows.some(
                    (r) => r.waktuLembur === "0700-1600"
                );
                const has1500_0000 = dateRows.some(
                    (r) => r.waktuLembur === "1500-0000"
                );
                const allWaktuKerja0000_0800 = dateRows.every(
                    (r) => r.waktuKerja === "0000-0800"
                );

                // Special case 2: Check for 24-hour continuous period
                // When waktu kerja is KELEPASAN types and there are 0000-0800, 0700-1600 & 1500-0000
                const has0000_0800 = dateRows.some(
                    (r) => r.waktuLembur === "0000-0800"
                );
                const allWaktuKerjaKelepasan = dateRows.every((r) =>
                    [
                        "KELEPASAN_GILIRAN",
                        "KELEPASAN_AM",
                        "KELEPASAN_AM_GANTIAN",
                    ].includes(r.waktuKerja)
                );

                if (allWaktuKerja0000_0800 && has0700_1600 && has1500_0000) {
                    // Special 24-hour continuous case: 0000-0800 (waktu kerja) + 0700-1600 + 1500-0000
                    // Overlaps:
                    // - 0000-0800 and 0700-1600 overlap from 0700-0800 (1 hour, day shift)
                    // - 0700-1600 and 1500-0000 overlap from 1500-1600 (1 hour, day shift)
                    // First 9th hour: 0800-0900 (from start of 0000-0800) - affects 0700-1600 row
                    // Second 9th hour: 1700-1800 (from start of continuous period at 0000) - affects 1500-0000 row
                    dateRows.forEach((data) => {
                        let finalDay = data.initialDayHours;
                        let finalNight = data.initialNightHours;

                        if (data.waktuLembur === "0700-1600") {
                            // Overlap with 0000-0800: 0700-0800 (1 hour day) - deduct from day
                            if (finalDay > 0) {
                                finalDay--;
                            }
                            // First 9th hour (0800-0900) is in day shift, deduct from day
                            if (finalDay > 0) {
                                finalDay--;
                            }
                        } else if (data.waktuLembur === "1500-0000") {
                            // Overlap with 0700-1600: 1500-1600 (1 hour day) - deduct from day
                            if (finalDay > 0) {
                                finalDay--;
                            }
                            // Second 9th hour (1700-1800) is in day shift, deduct from day
                            if (finalDay > 0) {
                                finalDay--;
                            }
                        }

                        data.finalDayHours = finalDay;
                        data.finalNightHours = finalNight;
                    });
                } else if (
                    allWaktuKerjaKelepasan &&
                    has0000_0800 &&
                    has0700_1600 &&
                    has1500_0000
                ) {
                    // Special 24-hour continuous case 2: KELEPASAN types + 0000-0800 + 0700-1600 + 1500-0000
                    // Overlaps:
                    // - 0000-0800 and 0700-1600 overlap from 0700-0800 (1 hour, day shift) - deducted from 0700-1600 only
                    // - 0700-1600 and 1500-0000 overlap from 1500-1600 (1 hour, day shift)
                    // First 9th hour: 0800-0900 (from start of continuous period at 0000) - affects 0700-1600 row
                    // Second 9th hour: 1700-1800 (from start of continuous period at 0000) - affects 1500-0000 row
                    dateRows.forEach((data) => {
                        let finalDay = data.initialDayHours;
                        let finalNight = data.initialNightHours;

                        if (data.waktuLembur === "0000-0800") {
                            // Keep full 8 hours (2 day + 6 night) - no deduction
                            // The overlap hour (0700-0800) is deducted from 0700-1600 row instead
                        } else if (data.waktuLembur === "0700-1600") {
                            // Overlap with 0000-0800: 0700-0800 (1 hour day) - deduct from day
                            if (finalDay > 0) {
                                finalDay--;
                            }
                            // First 9th hour (0800-0900) is in day shift, deduct from day
                            if (finalDay > 0) {
                                finalDay--;
                            }
                        } else if (data.waktuLembur === "1500-0000") {
                            // Overlap with 0700-1600: 1500-1600 (1 hour day) - deduct from day
                            if (finalDay > 0) {
                                finalDay--;
                            }
                            // Second 9th hour (1700-1800) is in day shift, deduct from day
                            if (finalDay > 0) {
                                finalDay--;
                            }
                        }

                        data.finalDayHours = finalDay;
                        data.finalNightHours = finalNight;
                    });
                } else {
                    // Regular continuous overtime processing
                    const continuousGroups = [];
                    let currentGroup = [dateRows[0]];

                    for (let i = 1; i < dateRows.length; i++) {
                        const prev = currentGroup[currentGroup.length - 1];
                        const curr = dateRows[i];

                        // Check if continuous
                        if (isContinuous(prev.waktuLembur, curr.waktuLembur)) {
                            currentGroup.push(curr);
                        } else {
                            if (currentGroup.length > 1) {
                                continuousGroups.push([...currentGroup]);
                            }
                            currentGroup = [curr];
                        }
                    }
                    if (currentGroup.length > 1) {
                        continuousGroups.push(currentGroup);
                    }

                    // Process continuous groups
                    continuousGroups.forEach((group) => {
                        processContinuousOvertime(group);
                    });

                    // Mark which rows are in continuous groups
                    const inContinuousGroup = new Set();
                    continuousGroups.forEach((group) => {
                        group.forEach((data) => inContinuousGroup.add(data));
                    });

                    // Apply 9th hour deduction for individual rows (not in continuous groups)
                    dateRows.forEach((data) => {
                        if (!inContinuousGroup.has(data)) {
                            apply9thHourDeduction(data);
                        }
                    });
                }
            } else {
                // Single row for this date, apply 9th hour deduction
                apply9thHourDeduction(dateRows[0]);
            }
        });

        // Apply calculated hours to inputs
        rowData.forEach((data) => {
            let finalDay = data.initialDayHours || 0;
            let finalNight = data.initialNightHours || 0;

            if (data.finalDayHours !== undefined) {
                finalDay = data.finalDayHours;
                finalNight = data.finalNightHours;
            } else if (data.waktuKerja && data.waktuLembur) {
                // Apply 9th hour deduction if not already processed
                const waktuLemburHours = {
                    "0000-0800": 8,
                    "0700-1600": 9,
                    "1500-0000": 9,
                };

                if (waktuLemburHours[data.waktuLembur] === 9) {
                    if (data.waktuLembur === "0700-1600") {
                        if (finalDay > 0) finalDay--;
                    } else if (data.waktuLembur === "1500-0000") {
                        if (finalNight > 0) finalNight--;
                    }
                }
            }

            if (data.dayRate && data.rateInputs[data.dayRate]) {
                data.rateInputs[data.dayRate].value =
                    finalDay > 0 ? finalDay : "";
            }
            if (data.nightRate && data.rateInputs[data.nightRate]) {
                data.rateInputs[data.nightRate].value =
                    finalNight > 0 ? finalNight : "";
            }
        });

        calculateTotals();
    }

    function calculateIndividualRow(waktuKerja, waktuLembur) {
        // Determine rates based on waktu kerja
        let dayRate, nightRate;
        if (["0000-0800", "0700-1600", "1500-0000"].includes(waktuKerja)) {
            dayRate = "1.125";
            nightRate = "1.25";
        } else if (waktuKerja === "KELEPASAN_GILIRAN") {
            dayRate = "1.25";
            nightRate = "1.5";
        } else if (
            ["KELEPASAN_AM", "KELEPASAN_AM_GANTIAN"].includes(waktuKerja)
        ) {
            dayRate = "1.75";
            nightRate = "2.0";
        }

        let dayHours = 0;
        let nightHours = 0;

        if (waktuLembur === "0000-0800") {
            nightHours = 6;
            dayHours = 2;
        } else if (waktuLembur === "0700-1600") {
            dayHours = 9;
            nightHours = 0;
        } else if (waktuLembur === "1500-0000") {
            dayHours = 7;
            nightHours = 2;
        }

        return { dayHours, nightHours, dayRate, nightRate };
    }

    function isContinuous(waktuLembur1, waktuLembur2) {
        // Check if two waktu lembur periods are continuous
        const combinations = [
            ["0000-0800", "0700-1600"],
            ["0700-1600", "1500-0000"],
        ];
        return combinations.some(
            (combo) =>
                (combo[0] === waktuLembur1 && combo[1] === waktuLembur2) ||
                (combo[0] === waktuLembur2 && combo[1] === waktuLembur1)
        );
    }

    function processContinuousOvertime(group) {
        // Find the start and end of continuous period
        const startPeriod = group[0].waktuLembur;
        const endPeriod = group[group.length - 1].waktuLembur;

        let continuousStart = 0;

        if (startPeriod === "0000-0800" && endPeriod === "0700-1600") {
            continuousStart = 0;
        } else if (startPeriod === "0700-1600" && endPeriod === "1500-0000") {
            continuousStart = 7;
        }

        // The 9th hour from continuous start
        // For 0700 start: 9th hour is at 15:00-16:00 (hour 15, which is day shift)
        const ninthHourStart = continuousStart + 8;

        // Process each row in the group
        group.forEach((data) => {
            const periodRange = getPeriodRange(data.waktuLembur);

            // Check if this row contains the 9th hour
            let deductFromDay = false;
            let deductFromNight = false;

            if (
                periodRange.start <= ninthHourStart &&
                periodRange.end > ninthHourStart
            ) {
                // 9th hour falls in this period
                // 9th hour is at hour 15 (15:00-16:00), which is day shift
                deductFromDay = true;
            }

            // Apply deduction
            let finalDay = data.initialDayHours;
            let finalNight = data.initialNightHours;

            // For continuous 0700-1600 & 1500-0000, both rows deduct from day rate
            if (startPeriod === "0700-1600" && endPeriod === "1500-0000") {
                // 9th hour is at 15:00-16:00 (day shift)
                // Both rows should deduct 1 from day rate
                if (finalDay > 0) {
                    finalDay--;
                }
            } else {
                // For other continuous periods or if 9th hour is in this row
                if (deductFromDay && finalDay > 0) {
                    finalDay--;
                } else if (deductFromNight && finalNight > 0) {
                    finalNight--;
                }
            }

            data.finalDayHours = finalDay;
            data.finalNightHours = finalNight;
        });
    }

    function getPeriodRange(waktuLembur) {
        if (waktuLembur === "0000-0800") return { start: 0, end: 8 };
        if (waktuLembur === "0700-1600") return { start: 7, end: 16 };
        if (waktuLembur === "1500-0000") return { start: 15, end: 24 };
        return { start: 0, end: 0 };
    }

    function apply9thHourDeduction(data) {
        // Apply 9th hour deduction for individual rows
        let finalDay = data.initialDayHours;
        let finalNight = data.initialNightHours;

        const waktuLemburHours = {
            "0000-0800": 8,
            "0700-1600": 9,
            "1500-0000": 9,
        };

        if (waktuLemburHours[data.waktuLembur] === 9) {
            // Need to deduct 9th hour
            if (data.waktuLembur === "0700-1600") {
                // Special case: if waktu kerja is 0000-0800, 9th hour is 0800-0900 (from start of 0000-0800)
                // Otherwise, 9th hour is 15:00-16:00 (from start of 0700-1600)
                if (data.waktuKerja === "0000-0800") {
                    // 9th hour is 0800-0900 (day shift) - already deducted overlap, now deduct 9th hour
                    if (finalDay > 0) finalDay--;
                } else {
                    // 9th hour is 15:00-16:00 (day shift)
                    if (finalDay > 0) finalDay--;
                }
            } else if (data.waktuLembur === "1500-0000") {
                // Special case: if waktu kerja is 0700-1600, 9th hour is 1500-1600 (from start of 0700-1600)
                // Otherwise, 9th hour is 23:00-00:00 (from start of 1500-0000)
                if (data.waktuKerja === "0700-1600") {
                    // 9th hour is 1500-1600 (day shift) - this is also the overlap hour, deduct once
                    if (finalDay > 0) finalDay--;
                } else {
                    // 9th hour is 23:00-00:00 (night shift)
                    if (finalNight > 0) finalNight--;
                }
            }
        }

        data.finalDayHours = finalDay;
        data.finalNightHours = finalNight;
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
                    input.value = "";
                });
            });

            // Recalculate totals (will reset all totals to 0)
            calculateTotals();

            // Trigger recalculation to clear any calculated values
            recalculateAllRows();
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
