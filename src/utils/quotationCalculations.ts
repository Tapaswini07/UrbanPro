/**
 * Comprehensive quotation calculation utilities for UrbanPro Packers & Logistics.
 * Accurately cross-verifies:
 * - Base Moving Charges (Transportation, Packing, Unpacking, Loading, Unloading, Dismantling, Octroi, Car, Bike, Statistical, Custom)
 * - Sub Total
 * - Insurance (% on Goods Declared Value, Extra / Included / Exempted)
 * - GST (% on Sub Total, Extra / Included / Exempted, CGST/SGST vs IGST)
 * - Grand Total
 * - Advance Paid & Balance Due
 */

export interface QuotationCalculationResult {
  baseTotal: number;
  serviceChargeNum: number;
  subTotal: number;
  insuranceNum: number;
  gstNum: number;
  goodsVal: number;
  grandTotal: number;
  advanceNum: number;
  balanceDue: number;
  insStatus: 'Extra' | 'Included' | 'Exempted';
  gstStatus: 'Extra' | 'Included' | 'Exempted';
  insPercent: string;
  gstPercent: string;
  serviceChargePercent: string;
}

export interface ParsedCharge {
  amount: number;
  status: 'standard' | 'included' | 'excluded';
  rawText: string;
  displayAmount: string;
}

export function parseChargeDetails(val: any): ParsedCharge {
  if (val === undefined || val === null || val === '') {
    return { amount: 0, status: 'standard', rawText: '', displayAmount: '' };
  }
  if (typeof val === 'number') {
    const num = isNaN(val) ? 0 : val;
    return { amount: num, status: 'standard', rawText: String(num), displayAmount: num > 0 ? String(num) : '' };
  }
  const str = String(val).trim();
  const lower = str.toLowerCase();

  const isExcluded = lower.includes('excluded') || lower.includes('excl');
  const isIncluded = lower.includes('included') || lower.includes('incl');

  // Extract pure numeric part
  const clean = str.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(clean);
  const amount = isNaN(parsed) ? 0 : parsed;

  let status: 'standard' | 'included' | 'excluded' = 'standard';
  if (isExcluded) {
    status = 'excluded';
  } else if (isIncluded) {
    status = 'included';
  }

  let displayAmount = '';
  if (amount > 0) {
    displayAmount = String(amount);
  } else if (!isIncluded && !isExcluded && str.toLowerCase() !== 'nil') {
    displayAmount = str;
  }

  return { amount, status, rawText: str, displayAmount };
}

export function formatChargeValue(amountStr: string, status: 'standard' | 'included' | 'excluded'): string {
  const clean = String(amountStr ?? '').replace(/[^0-9.]/g, '');
  const num = parseFloat(clean);
  const hasAmount = !isNaN(num) && num > 0;

  if (status === 'included') {
    return hasAmount ? `${clean} Included` : 'Included';
  }
  if (status === 'excluded') {
    return hasAmount ? `${clean} Excluded` : 'Excluded';
  }
  return hasAmount ? clean : (amountStr?.trim() || '');
}

export function parseChargeNumber(val: any): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  
  const { amount, status, rawText } = parseChargeDetails(val);
  const lower = rawText.toLowerCase();

  // Explicit zero-equivalent terms
  if (lower === 'exempted' || lower === 'nil') {
    return 0;
  }

  // If explicitly Excluded, do NOT add to subtotal
  if (status === 'excluded') {
    return 0;
  }

  // If Included with an amount (e.g. "15000 Included"), the amount IS ADDED to the total!
  // If Included without an amount (just "Included"), amount is 0.
  // If Standard with an amount, the amount is added.
  return amount;
}

export function calculateQuotationTotals(data: any): QuotationCalculationResult {
  if (!data) {
    return {
      baseTotal: 0,
      serviceChargeNum: 0,
      subTotal: 0,
      insuranceNum: 0,
      gstNum: 0,
      goodsVal: 0,
      grandTotal: 0,
      advanceNum: 0,
      balanceDue: 0,
      insStatus: 'Extra',
      gstStatus: 'Extra',
      insPercent: '3%',
      gstPercent: '18%',
      serviceChargePercent: '0%'
    };
  }

  // 1. Base Moving Charges (Transportation, Packing, Loading, Unloading, Dismantling, Octroi, Stat, Custom)
  const baseItems = [
    data.transportCharges,
    data.packingCharges,
    data.unpackingCharges,
    data.loadingCharges,
    data.unloadingCharges,
    data.dismantlingCharges,
    data.octroiCharges,
    data.carCharges,
    data.bikeCharges,
    data.statCharges,
    ...(data.customCharges || []).map((c: any) => c?.val)
  ];

  let baseTotal = 0;
  for (const item of baseItems) {
    const num = parseChargeNumber(item);
    if (num > 0) {
      baseTotal += num;
    }
  }

  // Service charges are not part of quotations.
  const serviceChargeNum = 0;
  const serviceChargePercent = '0%';

  // 3. Sub Total is manually entered when provided; otherwise use charge details.
  const manualSub = parseChargeNumber(data.subTotal);
  const chargeSubTotal = baseTotal + serviceChargeNum;
  const subTotal = manualSub > 0 ? manualSub : chargeSubTotal;

  // 4. Insurance Charge
  const insRawStatus = String(data.insuranceStatus || '').toLowerCase();
  const insRawVal = String(data.insuranceCharge || '').toLowerCase();
  let insStatus: 'Extra' | 'Included' | 'Exempted' = 'Extra';
  if (insRawStatus === 'included' || insRawVal === 'included') {
    insStatus = 'Included';
  } else if (insRawStatus === 'exempted' || insRawVal === 'exempted' || String(data.insurancePercent || '').includes('0%')) {
    insStatus = 'Exempted';
  } else {
    insStatus = 'Extra';
  }

  const insPctClean = String(data.insurancePercent || '3%').replace(/[^0-9.]/g, '');
  const insPct = parseFloat(insPctClean) || 3;
  const insPercent = data.insurancePercent || `${insPct}%`;
  const insManual = parseChargeNumber(data.insuranceCharge);
  const goodsVal = parseChargeNumber(data.goodsValue);

  let insuranceNum = 0;
  if (insStatus !== 'Exempted') {
    if (insManual > 0) {
      insuranceNum = insManual;
    } else if (goodsVal > 0 && insPct > 0) {
      insuranceNum = Math.round((goodsVal * insPct) / 100);
    }
  }

  // 5. GST Charge
  const gstRawStatus = String(data.gstStatus || '').toLowerCase();
  const gstRawVal = String(data.gstCharge || '').toLowerCase();
  const gstType = String(data.gstType || '');
  let gstStatus: 'Extra' | 'Included' | 'Exempted' = 'Extra';

  if (gstType === 'Exempted' || gstRawStatus === 'exempted' || gstRawVal === 'exempted' || String(data.gstPercent || '').includes('0%')) {
    gstStatus = 'Exempted';
  } else if (gstRawStatus === 'included' || gstRawVal === 'included') {
    gstStatus = 'Included';
  } else {
    gstStatus = 'Extra';
  }

  const gstPctClean = String(data.gstPercent || '18%').replace(/[^0-9.]/g, '');
  const gstPct = parseFloat(gstPctClean) || 18;
  const gstPercent = data.gstPercent || `${gstPct}%`;
  const gstManual = parseChargeNumber(data.gstCharge);

  let gstNum = 0;
  if (gstStatus !== 'Exempted') {
    if (gstManual > 0) {
      gstNum = gstManual;
    } else if (subTotal > 0 && gstPct > 0) {
      gstNum = Math.round((subTotal * gstPct) / 100);
    }
  }

  // 6. Grand Total includes GST on subtotal and insurance on declared goods value.
  let grandTotal = subTotal + gstNum + goodsVal + insuranceNum;
  const manualGrand = parseChargeNumber(data.grandTotal);
  if (grandTotal === 0 && manualGrand > 0) {
    grandTotal = manualGrand;
  }

  // 7. Advance Paid & Balance Due
  const advanceNum = parseChargeNumber(data.advancePaid);
  const balanceDue = Math.max(0, grandTotal - advanceNum);

  return {
    baseTotal,
    serviceChargeNum,
    subTotal,
    insuranceNum,
    gstNum,
    goodsVal,
    grandTotal,
    advanceNum,
    balanceDue,
    insStatus,
    gstStatus,
    insPercent,
    gstPercent,
    serviceChargePercent
  };
}
