<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>OT Calculator</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />

        <!-- Styles -->
        @vite(['resources/css/app.css', 'resources/js/app.js', 'resources/js/ot-calculator.js'])
    </head>
    <body class="antialiased font-sans bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div class="min-h-screen">
            <div class="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <main>
                    <div class="flex flex-col items-center">
                        <!-- Header Section -->
                        <div class="text-center mb-12">
                            <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-500 to-blue-400 bg-clip-text text-transparent mb-4 tracking-tight">
                                OT Calculator
                            </h1>
                            <div class="mt-6 space-y-2">
                                <ul class="list-disc list-inside text-gray-700 text-sm md:text-base space-y-1 inline-block text-left">
                                    <li>2200 - 0600 = night rate</li>
                                    <li>0600 - 2200 = day rate</li>
                                    <li>9th hour auto-deduct</li>
                                    <li>overlapped hour auto-deduct</li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Input Cards Section -->
                        <div class="w-full max-w-2xl mb-12">
                            <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                                <div class="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label for="gaji" class="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                            Gaji
                                        </label>
                                        <div class="relative flex items-center">
                                            <span class="absolute left-4 text-gray-500 font-semibold pointer-events-none z-10">RM</span>
                                            <input 
                                                type="text" 
                                                inputmode="decimal"
                                                id="gaji" 
                                                name="gaji" 
                                                placeholder="0.00"
                                                class="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-400 font-medium"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label for="kadar-satu-jam" class="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                            Kadar Satu Jam
                                        </label>
                                        <div class="relative flex items-center">
                                            <span class="absolute left-4 text-gray-500 font-semibold pointer-events-none z-10">RM</span>
                                            <input 
                                                type="text" 
                                                id="kadar-satu-jam" 
                                                name="kadar-satu-jam" 
                                                placeholder="0.00"
                                                readonly
                                                class="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Table Section -->
                        <div class="w-full mb-8">
                            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                <div class="overflow-x-auto">
                                    <table class="w-full border-collapse">
                                        <thead>
                                            <tr class="bg-gradient-to-r from-slate-400 to-blue-400">
                                                <th class="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Tarikh</th>
                                                <th class="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[140px]">Waktu Kerja</th>
                                                <th class="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[140px]">Waktu Lembur</th>
                                                <th class="px-3 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">Jumlah Jam Lembur</th>
                                                <th class="px-2 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">1.125</th>
                                                <th class="px-2 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">1.25</th>
                                                <th class="px-2 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">1.5</th>
                                                <th class="px-2 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">1.75</th>
                                                <th class="px-2 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">2.0</th>
                                                <th class="px-2 py-3 text-center text-xs font-bold text-white uppercase tracking-wider w-20">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody id="ot-table-body" class="bg-white divide-y divide-gray-200">
                                            <!-- Rows will be generated here -->
                                        </tbody>
                                        <tfoot>
                                            <tr class="bg-gradient-to-r from-slate-100 to-blue-100 border-t-4 border-slate-300">
                                                <td colspan="3" class="px-3 py-3 text-sm font-bold text-slate-700">JUMLAH</td>
                                                <td id="total-jumlah-jam" class="px-3 py-3 text-sm font-bold text-slate-700 text-center">0</td>
                                                <td class="px-2 py-3 text-sm font-bold text-slate-700 text-center">
                                                    <div class="flex flex-col">
                                                        <span id="total-hours-1.125" class="text-base">0</span>
                                                        <span id="total-1.125" class="text-xs text-slate-500 font-normal">0.00</span>
                                                    </div>
                                                </td>
                                                <td class="px-2 py-3 text-sm font-bold text-slate-700 text-center">
                                                    <div class="flex flex-col">
                                                        <span id="total-hours-1.25" class="text-base">0</span>
                                                        <span id="total-1.25" class="text-xs text-slate-500 font-normal">0.00</span>
                                                    </div>
                                                </td>
                                                <td class="px-2 py-3 text-sm font-bold text-slate-700 text-center">
                                                    <div class="flex flex-col">
                                                        <span id="total-hours-1.5" class="text-base">0</span>
                                                        <span id="total-1.5" class="text-xs text-slate-500 font-normal">0.00</span>
                                                    </div>
                                                </td>
                                                <td class="px-2 py-3 text-sm font-bold text-slate-700 text-center">
                                                    <div class="flex flex-col">
                                                        <span id="total-hours-1.75" class="text-base">0</span>
                                                        <span id="total-1.75" class="text-xs text-slate-500 font-normal">0.00</span>
                                                    </div>
                                                </td>
                                                <td class="px-2 py-3 text-sm font-bold text-slate-700 text-center">
                                                    <div class="flex flex-col">
                                                        <span id="total-hours-2.0" class="text-base">0</span>
                                                        <span id="total-2.0" class="text-xs text-slate-500 font-normal">0.00</span>
                                                    </div>
                                                </td>
                                                <td class="px-2 py-3 text-sm font-bold text-slate-700 text-center"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                            
                            <!-- Add Row and Clear All Buttons -->
                            <div class="mt-6 flex justify-end gap-4">
                                <button 
                                    type="button" 
                                    id="clear-all-btn"
                                    class="px-6 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white font-semibold rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                    Clear All
                                </button>
                                <button 
                                    type="button" 
                                    id="add-row-btn"
                                    class="px-6 py-3 bg-gradient-to-r from-slate-400 to-blue-400 text-white font-semibold rounded-xl hover:from-slate-500 hover:to-blue-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            <!-- Grand Total Section -->
                            <div class="mt-8 flex justify-end">
                                <div class="bg-gradient-to-r from-slate-400 to-blue-400 rounded-2xl shadow-xl p-6 min-w-[400px]">
                                    <div class="flex items-center justify-between gap-6">
                                        <label class="text-lg font-bold text-white uppercase tracking-wide">Jumlah Tuntutan:</label>
                                        <div class="relative flex items-center bg-white rounded-xl px-4 py-3 shadow-inner">
                                            <span class="absolute left-4 text-slate-500 font-bold pointer-events-none z-10">RM</span>
                                            <div 
                                                id="jumlah-tuntutan"
                                                class="w-48 pl-10 pr-4 text-right text-2xl font-bold text-slate-900"
                                            >
                                                0.00
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </body>
</html>
