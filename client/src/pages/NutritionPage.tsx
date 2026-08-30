import React, { useEffect, useState } from 'react';
import { ScanBarcode, Camera, Plus, Sparkles, Apple, Activity, Award, CheckCircle2, ChevronRight, Zap, ArrowRight } from 'lucide-react';
import { foodService } from '../services/api';
import { BarcodeScannerModal } from '../components/nutrition/BarcodeScannerModal';
import { Tooltip } from '../components/common/Tooltip';

export const NutritionPage: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedProductDetails, setScannedProductDetails] = useState<any>(null);
  const [scannedDomainInfo, setScannedDomainInfo] = useState<any>(null);
  const [healthierAlternatives, setHealthierAlternatives] = useState<any[]>([]);
  const [lookAlikeProduct, setLookAlikeProduct] = useState<any>(null);
  const [tasteAlikeProduct, setTasteAlikeProduct] = useState<any>(null);
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false);
  const [barcodeSearchError, setBarcodeSearchError] = useState<string | null>(null);

  // Manual Food Form State
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualBrand, setManualBrand] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualSugar, setManualSugar] = useState('');
  const [manualServingSize, setManualServingSize] = useState('100g');

  const [todayFoodLogs, setTodayFoodLogs] = useState<any[]>([]);
  const [macroTotals, setMacroTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [logSuccessNotification, setLogSuccessNotification] = useState<string | null>(null);

  const fetchFoodLogs = async () => {
    try {
      const response = await foodService.getFoodLogs();
      setTodayFoodLogs(response.logs || []);
      setMacroTotals(response.totals || { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 });
    } catch (error) {
      console.error('Failed to load food logs telemetry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodLogs();
  }, []);

  const handleBarcodeLookup = async (barcode: string) => {
    setIsScannerOpen(false);
    setIsSearchingBarcode(true);
    setBarcodeSearchError(null);
    setScannedProductDetails(null);
    setScannedDomainInfo(null);
    setLookAlikeProduct(null);
    setTasteAlikeProduct(null);
    setHealthierAlternatives([]);

    try {
      const data = await foodService.lookupBarcode(barcode);
      setScannedProductDetails(data.product);
      setScannedDomainInfo(data.domain || { domainLabel: data.product.domainLabel || 'Packaged Food' });
      setLookAlikeProduct(data.lookAlike || null);
      setTasteAlikeProduct(data.tasteAlike || null);
      setHealthierAlternatives(data.alternatives || []);
    } catch (error: any) {
      setBarcodeSearchError(error.message || 'Error searching barcode');
    } finally {
      setIsSearchingBarcode(false);
    }
  };

  const recordFoodLogEntry = async (item: any) => {
    const itemName = item.name || item.productName || 'Food Item';
    const cals = Number(item.calories) || 0;

    try {
      await foodService.logFood({
        productBarcode: item.barcode || null,
        productName: itemName,
        brand: item.brand || null,
        calories: cals,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
        sugar: Number(item.sugar) || 0,
        servingSize: item.servingSize || '100g',
      });

      setLogSuccessNotification(`✅ Logged "${itemName}" (${cals} kcal) to today's summary!`);
      setTimeout(() => setLogSuccessNotification(null), 4000);

      fetchFoodLogs();
    } catch (error) {
      console.error('Failed to record food log entry:', error);
    }
  };

  const handleManualFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    await recordFoodLogEntry({
      name: manualName.trim(),
      brand: manualBrand.trim() || undefined,
      calories: parseFloat(manualCalories) || 0,
      protein: parseFloat(manualProtein) || 0,
      carbs: parseFloat(manualCarbs) || 0,
      fat: parseFloat(manualFat) || 0,
      sugar: parseFloat(manualSugar) || 0,
      servingSize: manualServingSize.trim() || '1 serving',
    });

    setManualName('');
    setManualBrand('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setManualSugar('');
    setIsManualAddOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-gray-500">Retrieving nutrition logs...</span>
      </div>
    );
  }

  const domainLabel = scannedDomainInfo?.domainLabel || scannedProductDetails?.domainLabel || 'Packaged Food';

  return (
    <div className="space-y-6 pb-16 lg:pb-4 font-sans max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-brand-400 font-medium mb-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>OPEN FOOD FACTS & DOMAIN-MATCHED NUTRITION ENGINE</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Food Barcode Scanner & Nutrition Logger
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip content="Form to manually enter non-barcoded meals or recipes" position="bottom">
            <button
              onClick={() => setIsManualAddOpen(!isManualAddOpen)}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-dark-bg hover:bg-dark-surface text-gray-200 border border-dark-border/80 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer font-mono"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>{isManualAddOpen ? 'Close Form' : '➕ Manual Add'}</span>
            </button>
          </Tooltip>

          <Tooltip content="Launch camera scanner to scan food packet barcode" position="bottom">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-glow transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-200" />
              <span>📷 Scan Barcode</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Log Success Notification Toast */}
      {logSuccessNotification && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs text-center animate-fade-in flex items-center justify-center gap-2">
          <span>{logSuccessNotification}</span>
        </div>
      )}

      {/* Manual Entry Form */}
      {isManualAddOpen && (
        <form onSubmit={handleManualFormSubmit} className="telemetry-card rounded-2xl p-6 border border-emerald-500/40 space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white font-display uppercase tracking-wide flex items-center gap-2">
              <Apple className="w-4 h-4 text-emerald-400" />
              <span>Manual Meal & Food Entry</span>
            </h3>
            <span className="text-[10px] text-gray-400">Save custom meal or non-barcoded item</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-gray-400">Food / Meal Name *</label>
              <input
                type="text"
                required
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="e.g. Grilled Chicken Salad"
                className="w-full px-3.5 py-2 bg-dark-bg border border-dark-border/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-gray-400">Brand / Source</label>
              <input
                type="text"
                value={manualBrand}
                onChange={(e) => setManualBrand(e.target.value)}
                placeholder="e.g. Homemade"
                className="w-full px-3.5 py-2 bg-dark-bg border border-dark-border/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-gray-400">Calories (kcal)</label>
              <input
                type="number"
                required
                value={manualCalories}
                onChange={(e) => setManualCalories(e.target.value)}
                placeholder="350"
                className="w-full px-3.5 py-2 bg-dark-bg border border-dark-border/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-gray-400">Serving Size</label>
              <input
                type="text"
                value={manualServingSize}
                onChange={(e) => setManualServingSize(e.target.value)}
                placeholder="1 bowl / 200g"
                className="w-full px-3.5 py-2 bg-dark-bg border border-dark-border/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-emerald-400 font-bold">🥩 Protein (g)</label>
              <input
                type="number"
                step="0.1"
                value={manualProtein}
                onChange={(e) => setManualProtein(e.target.value)}
                placeholder="30"
                className="w-full px-3.5 py-2 bg-dark-bg border border-dark-border/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-blue-400 font-bold">🍞 Carbs (g)</label>
              <input
                type="number"
                step="0.1"
                value={manualCarbs}
                onChange={(e) => setManualCarbs(e.target.value)}
                placeholder="25"
                className="w-full px-3.5 py-2 bg-dark-bg border border-dark-border/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-amber-400 font-bold">🥑 Fat (g)</label>
              <input
                type="number"
                step="0.1"
                value={manualFat}
                onChange={(e) => setManualFat(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2 bg-dark-bg border border-dark-border/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-rose-400 font-bold">🍬 Sugar (g)</label>
              <input
                type="number"
                step="0.1"
                value={manualSugar}
                onChange={(e) => setManualSugar(e.target.value)}
                placeholder="4"
                className="w-full px-3.5 py-2 bg-dark-bg border border-dark-border/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsManualAddOpen(false)}
              className="px-4 py-2 rounded-xl bg-dark-bg text-gray-400 hover:text-white text-xs font-mono cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Meal</span>
            </button>
          </div>
        </form>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleBarcodeLookup}
      />

      {/* Lookup Loading State */}
      {isSearchingBarcode && (
        <div className="telemetry-card rounded-2xl p-8 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-gray-300">
            Scanning barcode, analyzing macros & matching domain-specific healthy alternatives...
          </p>
        </div>
      )}

      {barcodeSearchError && (
        <div className="telemetry-card rounded-2xl p-4 border border-red-500/30 text-red-400 text-xs font-mono text-center">
          {barcodeSearchError}
        </div>
      )}

      {/* Scanned Product Result & Domain Recommendations */}
      {scannedProductDetails && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Scanned Product Card */}
          <div className="telemetry-card rounded-2xl p-6 border border-emerald-500/40 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {scannedProductDetails.imageUrl ? (
                  <img
                    src={scannedProductDetails.imageUrl}
                    alt={scannedProductDetails.name}
                    className="w-16 h-16 object-contain rounded-xl bg-white/10 p-1 border border-dark-border/80"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    <Apple className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-emerald-400">
                      SCANNED PRODUCT
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 text-[10px] font-mono font-bold">
                      🏷️ Domain: {domainLabel}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-sans">{scannedProductDetails.name}</h3>
                  <p className="text-xs text-gray-400 font-mono">{scannedProductDetails.brand} • {scannedProductDetails.servingSize}</p>
                </div>
              </div>

              <Tooltip content="Add item to today's food log summary" position="left">
                <button
                  onClick={() => recordFoodLogEntry(scannedProductDetails)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider font-mono shadow-glow transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Scanned Item</span>
                </button>
              </Tooltip>
            </div>

            {/* Nutriments Monospace Grid */}
            <div className="grid grid-cols-5 gap-2 text-center pt-2 border-t border-dark-border/80 font-mono">
              <Tooltip content="Total Energy in kilocalories" position="top">
                <div className="p-2 rounded-xl bg-dark-bg cursor-pointer">
                  <div className="text-[10px] text-gray-500 uppercase">🔥 Cals</div>
                  <div className="text-sm font-bold text-white tabular-nums">{scannedProductDetails.calories}</div>
                </div>
              </Tooltip>

              <Tooltip content="🥩 Protein: Essential for muscle recovery & synthesis" position="top">
                <div className="p-2 rounded-xl bg-dark-bg cursor-pointer">
                  <div className="text-[10px] text-gray-500 uppercase">🥩 Prot</div>
                  <div className="text-sm font-bold text-emerald-400 tabular-nums">{scannedProductDetails.protein}g</div>
                </div>
              </Tooltip>

              <Tooltip content="🍞 Carbohydrates: Glycogen fuel source for workouts" position="top">
                <div className="p-2 rounded-xl bg-dark-bg cursor-pointer">
                  <div className="text-[10px] text-gray-500 uppercase">🍞 Carb</div>
                  <div className="text-sm font-bold text-blue-400 tabular-nums">{scannedProductDetails.carbs}g</div>
                </div>
              </Tooltip>

              <Tooltip content="🥑 Total Fat: Essential fatty acids & hormonal health" position="top">
                <div className="p-2 rounded-xl bg-dark-bg cursor-pointer">
                  <div className="text-[10px] text-gray-500 uppercase">🥑 Fat</div>
                  <div className="text-sm font-bold text-amber-400 tabular-nums">{scannedProductDetails.fat}g</div>
                </div>
              </Tooltip>

              <Tooltip content="🍬 Simple Sugars: Rapid glycemic response" position="top">
                <div className="p-2 rounded-xl bg-dark-bg cursor-pointer">
                  <div className="text-[10px] text-gray-500 uppercase">🍬 Sug</div>
                  <div className="text-sm font-bold text-rose-400 tabular-nums">{scannedProductDetails.sugar}g</div>
                </div>
              </Tooltip>
            </div>
          </div>

          {/* Look-Alike & Taste-Alike Healthier Alternatives (Strict Domain Matched) */}
          {(lookAlikeProduct || tasteAlikeProduct) && (
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Better Choices in {domainLabel}</span>
                </div>
                <span className="text-[10px] text-brand-400 font-bold">100% DOMAIN STICKY</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Look-Alike Card */}
                {lookAlikeProduct && (
                  <div className="p-4 rounded-2xl bg-dark-bg border border-amber-500/30 space-y-3 flex flex-col justify-between hover:border-amber-500/60 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                          🎨 Look-Alike {domainLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Score: {lookAlikeProduct.nutriScore}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white font-sans">{lookAlikeProduct.name}</h4>
                      <p className="text-[11px] text-gray-300 font-sans leading-snug">{lookAlikeProduct.reason}</p>

                      <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1">
                        <div className="p-1.5 rounded bg-dark-surface"><span className="text-gray-400 block">Cals</span><span className="font-bold text-white">{lookAlikeProduct.calories}</span></div>
                        <div className="p-1.5 rounded bg-dark-surface"><span className="text-emerald-400 block">Prot</span><span className="font-bold text-emerald-400">{lookAlikeProduct.protein}g</span></div>
                        <div className="p-1.5 rounded bg-dark-surface"><span className="text-blue-400 block">Carb</span><span className="font-bold text-blue-400">{lookAlikeProduct.carbs}g</span></div>
                        <div className="p-1.5 rounded bg-dark-surface"><span className="text-rose-400 block">Sug</span><span className="font-bold text-rose-400">{lookAlikeProduct.sugar}g</span></div>
                      </div>
                    </div>

                    <button
                      onClick={() => recordFoodLogEntry(lookAlikeProduct)}
                      className="w-full py-2 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Look-Alike {domainLabel}</span>
                    </button>
                  </div>
                )}

                {/* Taste-Alike Card */}
                {tasteAlikeProduct && (
                  <div className="p-4 rounded-2xl bg-dark-bg border border-cyan-500/30 space-y-3 flex flex-col justify-between hover:border-cyan-500/60 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">
                          😋 Taste-Alike {domainLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Score: {tasteAlikeProduct.nutriScore}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white font-sans">{tasteAlikeProduct.name}</h4>
                      <p className="text-[11px] text-gray-300 font-sans leading-snug">{tasteAlikeProduct.reason}</p>

                      <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1">
                        <div className="p-1.5 rounded bg-dark-surface"><span className="text-gray-400 block">Cals</span><span className="font-bold text-white">{tasteAlikeProduct.calories}</span></div>
                        <div className="p-1.5 rounded bg-dark-surface"><span className="text-emerald-400 block">Prot</span><span className="font-bold text-emerald-400">{tasteAlikeProduct.protein}g</span></div>
                        <div className="p-1.5 rounded bg-dark-surface"><span className="text-blue-400 block">Carb</span><span className="font-bold text-blue-400">{tasteAlikeProduct.carbs}g</span></div>
                        <div className="p-1.5 rounded bg-dark-surface"><span className="text-rose-400 block">Sug</span><span className="font-bold text-rose-400">{tasteAlikeProduct.sugar}g</span></div>
                      </div>
                    </div>

                    <button
                      onClick={() => recordFoodLogEntry(tasteAlikeProduct)}
                      className="w-full py-2 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Taste-Alike {domainLabel}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* List of 3 Healthy Domain-Matched Product Alternatives */}
          {healthierAlternatives.length > 0 && (
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Top 3 Healthy Options in {domainLabel}</span>
                </h4>
                <span className="text-[10px] text-gray-500">Curated Domain Matches</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {healthierAlternatives.map((altItem: any, idx: number) => (
                  <div
                    key={altItem.barcode || idx}
                    className="p-4 rounded-xl bg-dark-bg border border-dark-border/80 space-y-2.5 flex flex-col justify-between hover:border-emerald-500/40 transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">
                          Option #{idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Score: {altItem.nutriScore || 'A'}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white font-sans truncate">{altItem.name}</div>
                      <div className="text-[10px] text-gray-400">{altItem.brand} • {altItem.servingSize || '100g'}</div>
                      <div className="text-[10px] text-emerald-300 font-sans leading-tight">{altItem.reason}</div>

                      <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1">
                        <div className="p-1 rounded bg-dark-surface"><span className="text-gray-400 block">Cals</span><span className="font-bold text-white">{altItem.calories}</span></div>
                        <div className="p-1 rounded bg-dark-surface"><span className="text-emerald-400 block">Prot</span><span className="font-bold text-emerald-400">{altItem.protein}g</span></div>
                        <div className="p-1 rounded bg-dark-surface"><span className="text-blue-400 block">Carb</span><span className="font-bold text-blue-400">{altItem.carbs}g</span></div>
                        <div className="p-1 rounded bg-dark-surface"><span className="text-rose-400 block">Sug</span><span className="font-bold text-rose-400">{altItem.sugar}g</span></div>
                      </div>
                    </div>

                    <button
                      onClick={() => recordFoodLogEntry(altItem)}
                      className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer mt-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Log This Healthy {domainLabel.split(' ')[0]}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Today's Macro Totals Summary */}
      <div className="telemetry-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between font-mono">
          <h3 className="text-xs font-bold text-white font-display uppercase tracking-wide flex items-center gap-2">
            <Apple className="w-4 h-4 text-emerald-400" />
            <span>Today's Nutrition & Macro Summary</span>
          </h3>
          <span className="text-[10px] text-gray-400">DAILY TOTALS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
          <Tooltip content="🔥 Total Energy Intake Today" position="top">
            <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80 cursor-pointer hover:border-white/30 transition-all">
              <div className="text-[10px] text-gray-400 uppercase font-bold">🔥 Total Energy</div>
              <div className="text-xl font-bold text-white tabular-nums">{macroTotals.calories} kcal</div>
            </div>
          </Tooltip>

          <Tooltip content="🥩 Protein Intake Total (Target: 140g)" position="top">
            <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80 cursor-pointer hover:border-emerald-500/50 transition-all">
              <div className="text-[10px] text-emerald-400 uppercase font-bold">🥩 Protein</div>
              <div className="text-xl font-bold text-emerald-400 tabular-nums">{macroTotals.protein}g</div>
            </div>
          </Tooltip>

          <Tooltip content="🍞 Carbohydrate Intake Total (Target: 220g)" position="top">
            <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80 cursor-pointer hover:border-blue-500/50 transition-all">
              <div className="text-[10px] text-blue-400 uppercase font-bold">🍞 Carbohydrates</div>
              <div className="text-xl font-bold text-blue-400 tabular-nums">{macroTotals.carbs}g</div>
            </div>
          </Tooltip>

          <Tooltip content="🥑 Fat Intake Total (Target: 60g)" position="top">
            <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80 cursor-pointer hover:border-amber-500/50 transition-all">
              <div className="text-[10px] text-amber-400 uppercase font-bold">🥑 Total Fat</div>
              <div className="text-xl font-bold text-amber-400 tabular-nums">{macroTotals.fat}g</div>
            </div>
          </Tooltip>
        </div>

        {todayFoodLogs.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-gray-500 border border-dashed border-dark-border/80 rounded-xl flex items-center justify-center gap-2">
            <span>📷 No food items logged today yet. Launch camera barcode scanner to inspect items.</span>
          </div>
        ) : (
          <div className="space-y-2 font-mono">
            {todayFoodLogs.map((item: any) => (
              <Tooltip key={item.id} content={`Logged: ${item.productName} (${item.calories} kcal)`} position="top" className="w-full">
                <div className="flex items-center justify-between p-3 rounded-xl bg-dark-bg border border-dark-border/80 w-full cursor-pointer hover:border-emerald-500/40 transition-all">
                  <div>
                    <div className="text-sm font-bold text-white font-sans">{item.productName}</div>
                    <div className="text-xs text-gray-500">
                      {item.brand ? `${item.brand} • ` : ''}
                      {item.servingSize}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400 tabular-nums">{item.calories} kcal</div>
                    <div className="text-[10px] text-gray-500 tabular-nums">🥩 {item.protein}g | 🍞 {item.carbs}g | 🥑 {item.fat}g</div>
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
