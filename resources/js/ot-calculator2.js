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
                    Math.min(cursorPosition + diff, newValue.length),
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

    // Prevent time controls (custom selects) from looping when using scroll/arrow keys
    function attachNonLoopingTimeControl(control) {
        if (!control) return;

        // Block mouse wheel from changing value
        control.addEventListener(
            "wheel",
            function (e) {
                e.preventDefault();
            },
            { passive: false },
        );

        // Clamp arrow key changes so they don't wrap around from last to first
        control.addEventListener("keydown", function (e) {
            if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
            if (this.tagName !== "SELECT") return;

            const maxIndex = this.options.length - 1;
            const idx = this.selectedIndex;

            if (e.key === "ArrowUp" && idx <= 0) {
                e.preventDefault();
            } else if (e.key === "ArrowDown" && idx >= maxIndex) {
                e.preventDefault();
            }
        });
    }

    // Function to calculate and update totals
    function calculateTotals() {
        // Calculate total for Jumlah Jam Lembur column (index 3)
        let totalJumlahJam = 0;
        const rows = tableBody.querySelectorAll("tr");
        rows.forEach(function (row) {
            const input = row.querySelectorAll("td")[4]?.querySelector("input");
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
        const multiplierIndices = [5, 6, 7, 8, 9]; // Column indices for multiplier columns (0-based)

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
                `total-hours-${multiplierId}`,
            );
            if (totalHoursElement) {
                totalHoursElement.textContent = totalHours;
            }

            // Multiply by multiplier and update display (second line)
            const total = totalHours * multiplier;
            const totalElement = document.getElementById(
                `total-${multiplierId}`,
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
                grandTotal.toFixed(2),
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
                    <option value="2200-0700">2200 - 0700</option>
                    <option value="0700-1500">0700 - 1500</option>
                    <option value="1400-2300">1400 - 2300</option>
                    <option value="KELEPASAN_GILIRAN">KEL. GILIRAN</option>
                    <option value="KELEPASAN_AM">KEL. AM</option>
                    <option value="KELEPASAN_AM_GANTIAN">KEL. AM GANTIAN</option>
                </select>
            </td>
            <td class="px-3 py-3 whitespace-nowrap min-w-[140px]">
                <select
                    class="waktu-lembur-in-select w-full min-w-[140px] px-2 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white text-gray-900"
                >
                    <option value=""> </option>
                    <option value="00:00">00:00</option>
                    <option value="01:00">01:00</option>
                    <option value="02:00">02:00</option>
                    <option value="03:00">03:00</option>
                    <option value="04:00">04:00</option>
                    <option value="05:00">05:00</option>
                    <option value="06:00">06:00</option>
                    <option value="07:00">07:00</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="20:00">20:00</option>
                    <option value="21:00">21:00</option>
                    <option value="22:00">22:00</option>
                    <option value="23:00">23:00</option>
                </select>
            </td>
            <td class="px-3 py-3 whitespace-nowrap min-w-[140px]">
                <select
                    class="waktu-lembur-out-select w-full min-w-[140px] px-2 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white text-gray-900"
                >
                    <option value=""> </option>
                    <option value="00:00">00:00</option>
                    <option value="01:00">01:00</option>
                    <option value="02:00">02:00</option>
                    <option value="03:00">03:00</option>
                    <option value="04:00">04:00</option>
                    <option value="05:00">05:00</option>
                    <option value="06:00">06:00</option>
                    <option value="07:00">07:00</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="20:00">20:00</option>
                    <option value="21:00">21:00</option>
                    <option value="22:00">22:00</option>
                    <option value="23:00">23:00</option>
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
            'input[type="number"][step="1"]',
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

        // Add event listeners to waktu kerja and waktu lembur controls
        const waktuKerjaSelect = row.querySelector(".waktu-kerja-select");
        const waktuLemburInSelect = row.querySelector(
            ".waktu-lembur-in-select",
        );
        const waktuLemburOutSelect = row.querySelector(
            ".waktu-lembur-out-select",
        );
        const jumlahJamInput = row.querySelector(".jumlah-jam-input");

        // Attach non-looping behavior to time controls
        attachNonLoopingTimeControl(waktuLemburInSelect);
        attachNonLoopingTimeControl(waktuLemburOutSelect);

        // Get rate input references
        const rateInputs = {
            1.125: row.querySelectorAll("td")[5]?.querySelector("input"),
            1.25: row.querySelectorAll("td")[6]?.querySelector("input"),
            1.5: row.querySelectorAll("td")[7]?.querySelector("input"),
            1.75: row.querySelectorAll("td")[8]?.querySelector("input"),
            "2.0": row.querySelectorAll("td")[9]?.querySelector("input"),
        };

        // Function to recalculate all rows (for continuous overtime detection)
        function recalculateAllRows() {
            const allRows = tableBody.querySelectorAll("tr");
            const rowData = [];

            // Collect all row data
            allRows.forEach((r) => {
                const dateInput = r.querySelector('input[type="date"]');
                const waktuKerjaSel = r.querySelector(".waktu-kerja-select");
                const waktuLemburIn = r.querySelector(
                    ".waktu-lembur-in-select",
                );
                const waktuLemburOut = r.querySelector(
                    ".waktu-lembur-out-select",
                );
                const jumlahJamIn = r.querySelector(".jumlah-jam-input");
                const rateInps = {
                    1.125: r.querySelectorAll("td")[5]?.querySelector("input"),
                    1.25: r.querySelectorAll("td")[6]?.querySelector("input"),
                    1.5: r.querySelectorAll("td")[7]?.querySelector("input"),
                    1.75: r.querySelectorAll("td")[8]?.querySelector("input"),
                    "2.0": r.querySelectorAll("td")[9]?.querySelector("input"),
                };

                if (
                    dateInput &&
                    waktuKerjaSel &&
                    waktuLemburIn &&
                    waktuLemburOut
                ) {
                    rowData.push({
                        row: r,
                        date: dateInput.value,
                        waktuKerja: waktuKerjaSel.value,
                        waktuLemburIn: waktuLemburIn.value,
                        waktuLemburOut: waktuLemburOut.value,
                        jumlahJamInput: jumlahJamIn,
                        rateInputs: rateInps,
                    });
                }
            });

            // Helper to parse "HH:MM" into minutes from 00:00
            function parseTimeToMinutes(timeStr) {
                if (!timeStr) return null;
                const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
                if (isNaN(h) || isNaN(m)) return null;
                return h * 60 + m;
            }

            // Determine day/night rates based on waktu kerja
            function getRatesForShift(shift) {
                if (shift === "KELEPASAN_GILIRAN") {
                    return { dayRate: 1.25, nightRate: 1.5 };
                }
                if (
                    shift === "KELEPASAN_AM" ||
                    shift === "KELEPASAN_AM_GANTIAN"
                ) {
                    return { dayRate: 1.75, nightRate: "2.0" };
                }
                // Default for normal shifts
                return { dayRate: 1.125, nightRate: 1.25 };
            }

            // Check if a given minute (mod 24h) is night
            function isNightMinute(minute) {
                const m = ((minute % (24 * 60)) + 24 * 60) % (24 * 60);
                return m < 6 * 60 || m >= 22 * 60; // 2200 - 0600 night
            }

            // Clear all rate inputs and jumlah jam first
            rowData.forEach((data) => {
                Object.values(data.rateInputs).forEach((input) => {
                    if (input) input.value = "";
                });
                if (data.jumlahJamInput) data.jumlahJamInput.value = "";
            });

            // If no valid rows, nothing to do
            if (!rowData.length) {
                calculateTotals();
                return;
            }

            // Build a stable index for dates so we can create absolute minutes across days
            const uniqueDates = Array.from(
                new Set(
                    rowData
                        .map((d) => d.date)
                        .filter((d) => d && d.length > 0),
                ),
            ).sort();
            const dateIndexMap = {};
            uniqueDates.forEach((d, idx) => {
                dateIndexMap[d] = idx;
            });

            // Build intervals for all rows with absolute minutes
            const intervals = [];
            let globalEarliest = Infinity;
            let globalLatest = -Infinity;

            rowData.forEach((data) => {
                if (
                    !data.date ||
                    !data.waktuKerja ||
                    !data.waktuLemburIn ||
                    !data.waktuLemburOut
                ) {
                    return;
                }

                const dayIndex = dateIndexMap[data.date];
                if (dayIndex == null) return;

                const startLocal = parseTimeToMinutes(data.waktuLemburIn);
                const endLocal = parseTimeToMinutes(data.waktuLemburOut);
                if (startLocal == null || endLocal == null) return;

                let startAbs = dayIndex * 24 * 60 + startLocal;
                let endAbs = dayIndex * 24 * 60 + endLocal;

                // If OT crosses midnight within the same calendar entry
                if (endAbs <= startAbs) {
                    endAbs += 24 * 60;
                }

                // Update jumlah jam (raw hours, before 9th hour deduction)
                const rawHours = (endAbs - startAbs) / 60;
                if (data.jumlahJamInput) {
                    data.jumlahJamInput.value =
                        Number.isFinite(rawHours) && rawHours > 0
                            ? rawHours
                            : "";
                }

                intervals.push({
                    row: data.row,
                    startAbs,
                    endAbs,
                    shift: data.waktuKerja,
                });

                if (startAbs < globalEarliest) globalEarliest = startAbs;
                if (endAbs > globalLatest) globalLatest = endAbs;
            });

            if (
                !intervals.length ||
                !Number.isFinite(globalEarliest) ||
                !Number.isFinite(globalLatest)
            ) {
                calculateTotals();
                return;
            }

            // Sort intervals by absolute start time
            intervals.sort((a, b) => a.startAbs - b.startAbs);

            // Track per-row accumulated day/night hours
            const perRowHours = new Map();
            rowData.forEach((data) => {
                perRowHours.set(data.row, { day: 0, night: 0 });
            });

            // Walk hour by hour across the entire OT window.
            // 9th-hour deduction is applied every 9th hour (9th, 18th, 27th, ...)
            // within each continuous OT block across dates.
            let otHourIndex = 0;
            let previousHadCoverage = false;
            const hourStartAbs = Math.floor(globalEarliest / 60) * 60;
            const hourEndAbs = Math.ceil(globalLatest / 60) * 60;

            for (let t = hourStartAbs; t < hourEndAbs; t += 60) {
                const tEnd = t + 60;

                // Find intervals that fully cover this hour
                const covering = intervals.filter(
                    (iv) => iv.startAbs <= t && iv.endAbs >= tEnd,
                );

                if (!covering.length) {
                    // Gap: reset sequence
                    previousHadCoverage = false;
                    otHourIndex = 0;
                    continue;
                }

                if (!previousHadCoverage) {
                    otHourIndex = 0;
                }
                previousHadCoverage = true;

                otHourIndex += 1;
                // Skip every 9th hour (auto-deduct)
                if (otHourIndex % 9 === 0) {
                    continue;
                }

                // Assign this hour to the first covering row (prevents double-counting overlaps)
                const targetInterval = covering[0];
                const targetRow = targetInterval.row;
                const counters = perRowHours.get(targetRow);
                if (!counters) continue;

                // Determine if this hour is day or night based on middle of the hour (wrapped to 24h)
                const midMinuteAbs = t + 30;
                const midMinuteLocal =
                    ((midMinuteAbs % (24 * 60)) + 24 * 60) % (24 * 60);
                const { dayRate, nightRate } = getRatesForShift(
                    targetInterval.shift,
                );

                if (isNightMinute(midMinuteLocal)) {
                    counters.night += 1;
                } else {
                    counters.day += 1;
                }
            }

            // Apply accumulated hours to each row's rate inputs
            rowData.forEach((data) => {
                const counters = perRowHours.get(data.row);
                if (!counters) return;

                const { dayRate, nightRate } = getRatesForShift(
                    data.waktuKerja,
                );

                if (
                    dayRate &&
                    data.rateInputs[dayRate] &&
                    counters.day > 0
                ) {
                    data.rateInputs[dayRate].value = counters.day;
                }
                if (
                    nightRate &&
                    data.rateInputs[nightRate] &&
                    counters.night > 0
                ) {
                    data.rateInputs[nightRate].value = counters.night;
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

        if (waktuLemburInSelect) {
            waktuLemburInSelect.addEventListener("change", function () {
                calculateOvertimeForRow();
            });
        }
        if (waktuLemburOutSelect) {
            waktuLemburOutSelect.addEventListener("change", function () {
                calculateOvertimeForRow();
            });
        }

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
                if (waktuLemburInSelect) waktuLemburInSelect.value = "";
                if (waktuLemburOutSelect) waktuLemburOutSelect.value = "";

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
        'input[type="number"][step="1"]',
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
                    ".waktu-kerja-select",
                );
                const waktuLemburInSelect = row.querySelector(
                    ".waktu-lembur-in-select",
                );
                const waktuLemburOutSelect = row.querySelector(
                    ".waktu-lembur-out-select",
                );
                if (waktuKerjaSelect) waktuKerjaSelect.value = "";
                if (waktuLemburInSelect) waktuLemburInSelect.value = "";
                if (waktuLemburOutSelect) waktuLemburOutSelect.value = "";

                // Clear jumlah jam input
                const jumlahJamInput = row.querySelector(".jumlah-jam-input");
                if (jumlahJamInput) jumlahJamInput.value = "";

                // Clear all rate inputs
                const rateInputs = row.querySelectorAll(
                    'input[type="number"][step="1"]',
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
