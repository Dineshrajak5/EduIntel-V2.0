import ExcelJS from 'exceljs';
import { Institution } from '@/types/institution';

const INDIGO_HEX = 'FF6366F1';
const LIGHT_HEX = 'FFF8FAFC';

function headerStyle(): Partial<ExcelJS.Style> {
  return {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: INDIGO_HEX } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    },
  };
}

function rowStyle(even: boolean): Partial<ExcelJS.Style> {
  return {
    fill: even
      ? { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_HEX } }
      : { type: 'pattern', pattern: 'none' },
    alignment: { vertical: 'middle' },
  };
}

export async function generateExcel(institution: Institution): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'EduIntel';
  wb.created = new Date();

  const { profile, fees, placement } = institution;

  // ── Sheet 1: Fee Summary ─────────────────────────────────────
  const summary = wb.addWorksheet('Fee Summary');
  summary.columns = [
    { key: 'metric', width: 30 },
    { key: 'value', width: 25 },
  ];

  const ugFees = fees.filter(f => ['B.E.', 'B.Tech', 'BCA', 'BSc', 'BBA', 'B.Com', 'BA', 'B.Pharm'].includes(f.degreeType));
  const pgFees = fees.filter(f => ['M.E.', 'M.Tech', 'MCA', 'MBA', 'MSc', 'M.Com', 'MA', 'M.Pharm'].includes(f.degreeType));
  const avgUG = ugFees.length ? ugFees.reduce((s, f) => s + (f.totalFees || 0), 0) / ugFees.length : 0;
  const avgPG = pgFees.length ? pgFees.reduce((s, f) => s + (f.totalFees || 0), 0) / pgFees.length : 0;
  const allTotal = fees.map(f => f.totalFees || 0);
  const minFee = allTotal.length ? Math.min(...allTotal) : 0;
  const maxFee = allTotal.length ? Math.max(...allTotal) : 0;

  summary.addRow({ metric: 'Institution', value: profile.name });
  summary.addRow({ metric: 'Total Programs', value: fees.length });
  summary.addRow({ metric: 'UG Programs', value: ugFees.length });
  summary.addRow({ metric: 'PG Programs', value: pgFees.length });
  summary.addRow({ metric: 'Average UG Fee (₹)', value: Math.round(avgUG) });
  summary.addRow({ metric: 'Average PG Fee (₹)', value: Math.round(avgPG) });
  summary.addRow({ metric: 'Lowest Fee Program', value: fees.find(f => f.totalFees === minFee)?.programName || '—' });
  summary.addRow({ metric: 'Highest Fee Program', value: fees.find(f => f.totalFees === maxFee)?.programName || '—' });
  summary.addRow({ metric: 'Minimum Total Fee (₹)', value: minFee });
  summary.addRow({ metric: 'Maximum Total Fee (₹)', value: maxFee });
  summary.addRow({ metric: 'Report Generated', value: new Date().toLocaleDateString('en-IN') });

  summary.getRow(1).font = { bold: true, size: 13 };

  // ── Sheet 2: Program-wise Fees ────────────────────────────────
  const feeSheet = wb.addWorksheet('Program-wise Fees');
  feeSheet.columns = [
    { key: 'programName', header: 'Program Name', width: 30 },
    { key: 'degreeType', header: 'Degree', width: 12 },
    { key: 'duration', header: 'Duration (Yrs)', width: 14 },
    { key: 'department', header: 'Department', width: 25 },
    { key: 'year1', header: 'Year 1 Fee (₹)', width: 15 },
    { key: 'year2', header: 'Year 2 Fee (₹)', width: 15 },
    { key: 'year3', header: 'Year 3 Fee (₹)', width: 15 },
    { key: 'year4', header: 'Year 4 Fee (₹)', width: 15 },
    { key: 'admissionFee', header: 'Admission Fee (₹)', width: 18 },
    { key: 'hostelFee', header: 'Hostel/Yr (₹)', width: 15 },
    { key: 'totalFees', header: 'Total Fees (₹)', width: 15 },
    { key: 'academicYear', header: 'Academic Year', width: 14 },
    { key: 'source', header: 'Source', width: 20 },
  ];

  // Style header row
  feeSheet.getRow(1).eachCell(cell => {
    Object.assign(cell, headerStyle());
    cell.style = headerStyle();
  });
  feeSheet.getRow(1).height = 22;

  fees.forEach((f, i) => {
    const row = feeSheet.addRow({
      programName: f.programName,
      degreeType: f.degreeType,
      duration: f.duration,
      department: f.department || '',
      year1: f.annualFees.year1 || '',
      year2: f.annualFees.year2 || '',
      year3: f.annualFees.year3 || '',
      year4: f.annualFees.year4 || '',
      admissionFee: f.admissionFee || '',
      hostelFee: f.hostelFeePerYear || '',
      totalFees: f.totalFees || '',
      academicYear: f.academicYear,
      source: f.feeSource,
    });
    if (i % 2 === 0) {
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_HEX } };
      });
    }
    // Currency cells
    ['year1', 'year2', 'year3', 'year4', 'admissionFee', 'hostelFee', 'totalFees'].forEach(key => {
      const col = feeSheet.getColumn(key);
      const cell = row.getCell(col.number);
      if (cell.value) cell.numFmt = '₹#,##0';
    });
  });

  // ── Sheet 3: Placement Stats ─────────────────────────────────
  const placeSheet = wb.addWorksheet('Placement Stats');
  placeSheet.columns = [
    { key: 'year', header: 'Academic Year', width: 16 },
    { key: 'offers', header: 'Total Offers', width: 14 },
    { key: 'eligible', header: 'Eligible', width: 12 },
    { key: 'rate', header: 'Placement Rate (%)', width: 20 },
    { key: 'avgCTC', header: 'Avg CTC (₹)', width: 14 },
    { key: 'highCTC', header: 'Highest CTC (₹)', width: 16 },
    { key: 'companies', header: 'Companies', width: 12 },
  ];

  placeSheet.getRow(1).eachCell(cell => { cell.style = headerStyle(); });
  placeSheet.getRow(1).height = 22;

  const allStats = [placement.currentYear, ...(placement.historicalStats || [])].filter(Boolean);
  allStats.forEach((s, i) => {
    const row = placeSheet.addRow({
      year: s.academicYear,
      offers: s.totalOffers || '',
      eligible: s.totalEligible || '',
      rate: s.placementRate || '',
      avgCTC: s.averageCTC || '',
      highCTC: s.highestCTC || '',
      companies: s.totalCompanies || '',
    });
    if (i % 2 === 0) {
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_HEX } };
      });
    }
  });

  // Download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${profile.name.replace(/\s+/g, '_')}_EduIntel_Fees.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
