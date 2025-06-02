"use client"
import { useState, useEffect, useRef } from 'react';

export default function PrintingDashboard() {
  const canvasRef = useRef(null);
  
  // User state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Notification state
  const [notification, setNotification] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    jobType: 'Business Card',
    cardsNeeded: 1000,
    paperType: 'SRA3',
    inputLength: 45,
    inputWidth: 32,
    outputLength: 9,
    outputWidth: 5,
    printSides: 1,
    addFolding: false,
    numFoldLines: 1,
    addFoiling: false,
    addEmbossing: false,
    addUvPrinting: false
  });

  // Results state
  const [results, setResults] = useState({
    cardsPerSheet: 0,
    totalSheetsRequired: 0,
    paperTypeName: 'SRA3 (45cm x 32cm)',
    inputDimensions: '45cm x 32cm',
    outputDimensions: '9cm x 5cm',
    printSidesText: 'One Side',
    estimatedCost: 0,
    additionsCost: {},
    totalAdditionsCost: 0
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Constants
  const PAPER_SIZES = {
    SRA3: { length: 45, width: 32, name: "SRA3 (45cm x 32cm)" },
    A3: { length: 42, width: 29.7, name: "A3 (42cm x 29.7cm)" },
    SRA2: { length: 64, width: 45, name: "SRA2 (64cm x 45cm)" },
    Custom: { length: 0, width: 0, name: "Custom Size" }
  };

  const ADDITION_COSTS = {
    foldingPerLinePerSheet: 0.02,
    foilingPerSheet: 0.15,
    embossingPerSheet: 0.20,
    uvPrintingPerSheet: 0.10
  };

  const TIERED_SHEET_PRICING = [
    { maxSheets: 100, pricePerSheet: 0.50 },
    { maxSheets: 500, pricePerSheet: 0.45 },
    { maxSheets: Infinity, pricePerSheet: 0.40 }
  ];

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      window.location.href = '/login';
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      showNotification(`Welcome back, ${parsedUser.full_name || parsedUser.employee_id}!`);
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  }, []);

  // Update paper dimensions when paper type changes
  useEffect(() => {
    if (formData.paperType !== 'Custom' && PAPER_SIZES[formData.paperType]) {
      setFormData(prev => ({
        ...prev,
        inputLength: PAPER_SIZES[formData.paperType].length,
        inputWidth: PAPER_SIZES[formData.paperType].width
      }));
    }
  }, [formData.paperType]);

  // Calculate estimate whenever form data changes
  useEffect(() => {
    if (user) {
      calculateEstimate();
    }
  }, [formData, user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateInput = (value, fieldName, message) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: message
      }));
      return false;
    }
    return true;
  };

  const calculateMaxItemsPerSheet = (sheetLength, sheetWidth, itemLength, itemWidth) => {
    const count1 = Math.floor(sheetLength / itemLength) * Math.floor(sheetWidth / itemWidth);
    const count2 = Math.floor(sheetLength / itemWidth) * Math.floor(sheetWidth / itemLength);
    
    if (count1 >= count2) {
      return { count: count1, orientation: 'normal' };
    } else {
      return { count: count2, orientation: 'rotated' };
    }
  };

  const calculateCost = (totalSheets, printSides) => {
    let baseCost = 0;
    for (const tier of TIERED_SHEET_PRICING) {
      if (totalSheets <= tier.maxSheets) {
        baseCost = totalSheets * tier.pricePerSheet;
        break;
      }
    }
    const printSurcharge = totalSheets * 0.05 * (printSides - 1);

    let additionsCost = {};
    let totalAdditionsCost = 0;

    if (formData.addFolding) {
      const cost = totalSheets * formData.numFoldLines * ADDITION_COSTS.foldingPerLinePerSheet;
      additionsCost['Folding'] = cost;
      totalAdditionsCost += cost;
    }
    if (formData.addFoiling) {
      const cost = totalSheets * ADDITION_COSTS.foilingPerSheet;
      additionsCost['Foiling'] = cost;
      totalAdditionsCost += cost;
    }
    if (formData.addEmbossing) {
      const cost = totalSheets * ADDITION_COSTS.embossingPerSheet;
      additionsCost['Embossing/Debossing'] = cost;
      totalAdditionsCost += cost;
    }
    if (formData.addUvPrinting) {
      const cost = totalSheets * ADDITION_COSTS.uvPrintingPerSheet;
      additionsCost['UV Printing'] = cost;
      totalAdditionsCost += cost;
    }

    return {
      baseCost: baseCost + printSurcharge,
      additionsCost,
      totalAdditionsCost,
      totalEstimatedCost: baseCost + printSurcharge + totalAdditionsCost
    };
  };

  const drawDiePattern = (sheetLength, sheetWidth, itemLength, itemWidth, orientation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 20;
    const canvasUsableWidth = canvas.width - 2 * padding;
    const canvasUsableHeight = canvas.height - 2 * padding;

    const scaleX = canvasUsableWidth / sheetLength;
    const scaleY = canvasUsableHeight / sheetWidth;
    const scale = Math.min(scaleX, scaleY);

    const scaledSheetLength = sheetLength * scale;
    const scaledSheetWidth = sheetWidth * scale;

    const startX = (canvas.width - scaledSheetLength) / 2;
    const startY = (canvas.height - scaledSheetWidth) / 2;

    // Draw sheet outline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, scaledSheetLength, scaledSheetWidth);

    // Calculate item dimensions based on orientation
    let currentItemLength = itemLength;
    let currentItemWidth = itemWidth;

    if (orientation === 'rotated') {
      currentItemLength = itemWidth;
      currentItemWidth = itemLength;
    }

    const scaledItemLength = currentItemLength * scale;
    const scaledItemWidth = currentItemWidth * scale;

    const itemsPerRow = Math.floor(sheetLength / currentItemLength);
    const itemsPerCol = Math.floor(sheetWidth / currentItemWidth);

    // Draw items
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;

    for (let row = 0; row < itemsPerCol; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const x = startX + col * scaledItemLength;
        const y = startY + row * scaledItemWidth;
        ctx.fillRect(x, y, scaledItemLength, scaledItemWidth);
        ctx.strokeRect(x, y, scaledItemLength, scaledItemWidth);
      }
    }

    // Add dimension labels
    ctx.fillStyle = '#1f2937';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${sheetLength.toFixed(1)}cm`, startX + scaledSheetLength / 2, startY + scaledSheetWidth + 15);
    
    ctx.save();
    ctx.translate(startX - 15, startY + scaledSheetWidth / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${sheetWidth.toFixed(1)}cm`, 0, 0);
    ctx.restore();
  };

  const calculateEstimate = () => {
    // Validate inputs
    let isValid = true;
    const newErrors = {};

    if (!validateInput(formData.cardsNeeded, 'cardsNeeded', 'Please enter a valid number of items (minimum 1).')) {
      newErrors.cardsNeeded = 'Please enter a valid number of items (minimum 1).';
      isValid = false;
    }
    if (!validateInput(formData.outputLength, 'outputLength', 'Please enter a valid length (minimum 1cm).')) {
      newErrors.outputLength = 'Please enter a valid length (minimum 1cm).';
      isValid = false;
    }
    if (!validateInput(formData.outputWidth, 'outputWidth', 'Please enter a valid width (minimum 1cm).')) {
      newErrors.outputWidth = 'Please enter a valid width (minimum 1cm).';
      isValid = false;
    }

    if (formData.paperType === 'Custom') {
      if (!validateInput(formData.inputLength, 'inputLength', 'Please enter a valid length (minimum 1cm).')) {
        newErrors.inputLength = 'Please enter a valid length (minimum 1cm).';
        isValid = false;
      }
      if (!validateInput(formData.inputWidth, 'inputWidth', 'Please enter a valid width (minimum 1cm).')) {
        newErrors.inputWidth = 'Please enter a valid width (minimum 1cm).';
        isValid = false;
      }
    }

    if (formData.addFolding && !validateInput(formData.numFoldLines, 'numFoldLines', 'Please enter a valid number of fold lines (minimum 1).')) {
      newErrors.numFoldLines = 'Please enter a valid number of fold lines (minimum 1).';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      setResults(prev => ({
        ...prev,
        cardsPerSheet: 0,
        totalSheetsRequired: 0,
        estimatedCost: 0,
        additionsCost: {},
        totalAdditionsCost: 0
      }));
      return;
    }

    // Get dimensions
    let inputLength, inputWidth, paperTypeName;
    if (formData.paperType === 'Custom') {
      inputLength = parseFloat(formData.inputLength);
      inputWidth = parseFloat(formData.inputWidth);
      paperTypeName = `Custom (${inputLength.toFixed(1)}cm x ${inputWidth.toFixed(1)}cm)`;
    } else {
      inputLength = PAPER_SIZES[formData.paperType].length;
      inputWidth = PAPER_SIZES[formData.paperType].width;
      paperTypeName = PAPER_SIZES[formData.paperType].name;
    }

    const outputLength = parseFloat(formData.outputLength);
    const outputWidth = parseFloat(formData.outputWidth);

    // Calculate items per sheet
    const { count: itemsPerSheet, orientation } = calculateMaxItemsPerSheet(
      inputLength, inputWidth, outputLength, outputWidth
    );

    if (itemsPerSheet === 0) {
      setResults({
        cardsPerSheet: 0,
        totalSheetsRequired: 'Items too large',
        estimatedCost: 0,
        additionsCost: {},
        totalAdditionsCost: 0,
        paperTypeName,
        inputDimensions: `${inputLength.toFixed(1)}cm x ${inputWidth.toFixed(1)}cm`,
        outputDimensions: `${outputLength.toFixed(1)}cm x ${outputWidth.toFixed(1)}cm`,
        printSidesText: formData.printSides === 1 ? 'One Side' : 'Both Sides'
      });
      return;
    }

    // Calculate total sheets
    const totalSheetsRequired = Math.ceil(formData.cardsNeeded / itemsPerSheet);

    // Calculate cost
    const costData = calculateCost(totalSheetsRequired, formData.printSides);

    setResults({
      cardsPerSheet: itemsPerSheet,
      totalSheetsRequired,
      paperTypeName,
      inputDimensions: `${inputLength.toFixed(1)}cm x ${inputWidth.toFixed(1)}cm`,
      outputDimensions: `${outputLength.toFixed(1)}cm x ${outputWidth.toFixed(1)}cm`,
      printSidesText: formData.printSides === 1 ? 'One Side' : 'Both Sides',
      estimatedCost: costData.totalEstimatedCost,
      additionsCost: costData.additionsCost,
      totalAdditionsCost: costData.totalAdditionsCost
    });

    // Draw pattern
    drawDiePattern(inputLength, inputWidth, outputLength, outputWidth, orientation);
  };


  const exportPdf = async () => {
    try {
      // Dynamic import for client-side only
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF();
      
      let y = 10;
      doc.setFontSize(22);
      doc.text("Printing Estimate Summary", 10, y);
      y += 10;
      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, y);
      doc.text(`Employee: ${user?.employee_id}`, 120, y);
      y += 10;

      doc.setFontSize(14);
      doc.text("Job Details:", 10, y);
      y += 7;
      doc.setFontSize(12);
      doc.text(`Job Type: ${formData.jobType}`, 20, y); y += 7;
      doc.text(`Items Needed: ${formData.cardsNeeded}`, 20, y); y += 7;
      doc.text(`Input Paper Type: ${results.paperTypeName}`, 20, y); y += 7;
      doc.text(`Input Sheet Dimensions: ${results.inputDimensions}`, 20, y); y += 7;
      doc.text(`Output Item Dimensions: ${results.outputDimensions}`, 20, y); y += 7;
      doc.text(`Print Sides: ${results.printSidesText}`, 20, y); y += 7;

      doc.setFontSize(14);
      doc.text("Production Summary:", 10, y += 10);
      y += 7;
      doc.setFontSize(12);
      doc.text(`Items per Input Sheet: ${results.cardsPerSheet}`, 20, y); y += 7;
      doc.text(`Total Input Sheets Required: ${results.totalSheetsRequired}`, 20, y); y += 7;

      if (Object.keys(results.additionsCost).length > 0) {
        doc.setFontSize(14);
        doc.text("Additional Finishing Options:", 10, y += 10);
        y += 7;
        doc.setFontSize(12);
        Object.entries(results.additionsCost).forEach(([addition, cost]) => {
          doc.text(`${addition}: $${cost.toFixed(2)}`, 20, y);
          y += 7;
        });
      }

      doc.setFontSize(18);
      doc.setTextColor(16, 185, 129);
      doc.text(`Estimated Total Cost: $${results.estimatedCost.toFixed(2)}`, 10, y += 15);
      doc.setTextColor(0, 0, 0);

      // Add canvas image
      if (canvasRef.current) {
        y += 15;
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 10;
        }

        doc.setFontSize(14);
        doc.text("Die Pattern Visualization:", 10, y);
        y += 5;

        const canvasImage = canvasRef.current.toDataURL('image/png');
        const imgWidth = 150;
        const imgHeight = (canvasRef.current.height * imgWidth) / canvasRef.current.width;

        doc.addImage(canvasImage, 'PNG', (doc.internal.pageSize.width - imgWidth) / 2, y, imgWidth, imgHeight);
      }

      doc.save('PrintingEstimate.pdf');
      showNotification('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showNotification('Failed to export PDF. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <main style={{
        fontFamily: 'Inter, sans-serif',
        backgroundColor: '#f0f2f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        padding: '2rem',
        boxSizing: 'border-box'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          padding: '2.5rem',
          maxWidth: '1000px',
          width: '100%',
          display: 'flex',
          flexDirection: window.innerWidth >= 768 ? 'row' : 'column',
          gap: '2.5rem'
        }}>
          {/* Input Section */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Printing Job Details</h2>

            {/* Job Type */}
            <div>
              <label htmlFor="jobType" style={{ fontWeight: 600, color: '#333', marginBottom: '0.5rem', display: 'block' }}>Job Type:</label>
              <select
                id="jobType"
                value={formData.jobType}
                onChange={(e) => handleInputChange('jobType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  color: '#4b5563',
                  transition: 'border-color 0.2s'
                }}
              >
                <option value="Business Card">Business Card</option>
                <option value="Flyer">Flyer</option>
                <option value="Poster">Poster</option>
                <option value="Other">Other (Custom Item)</option>
              </select>
            </div>

            {/* Number of Items */}
            <div>
              <label htmlFor="cardsNeeded" style={{ fontWeight: 600, color: '#333', marginBottom: '0.5rem', display: 'block' }}>Number of Items Needed:</label>
              <input
                type="number"
                id="cardsNeeded"
                value={formData.cardsNeeded}
                onChange={(e) => handleInputChange('cardsNeeded', parseInt(e.target.value))}
                min="1"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  color: '#4b5563',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.cardsNeeded && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.cardsNeeded}</p>}
            </div>

            {/* Paper Type */}
            <div>
              <label htmlFor="paperType" style={{ fontWeight: 600, color: '#333', marginBottom: '0.5rem', display: 'block' }}>Input Paper Type:</label>
              <select
                id="paperType"
                value={formData.paperType}
                onChange={(e) => handleInputChange('paperType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  color: '#4b5563',
                  transition: 'border-color 0.2s'
                }}
              >
                <option value="SRA3">SRA3 (45cm x 32cm)</option>
                <option value="A3">A3 (42cm x 29.7cm)</option>
                <option value="SRA2">SRA2 (64cm x 45cm)</option>
                <option value="Custom">Custom Size</option>
              </select>
            </div>

            {/* Custom Paper Size */}
            {formData.paperType === 'Custom' && (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="inputLength" style={{ fontWeight: 600, color: '#333', marginBottom: '0.5rem', display: 'block' }}>Custom Input Paper Length (cm):</label>
                  <input
                    type="number"
                    id="inputLength"
                    value={formData.inputLength}
                    onChange={(e) => handleInputChange('inputLength', parseFloat(e.target.value))}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      color: '#4b5563',
                      transition: 'border-color 0.2s'
                    }}
                  />
                  {errors.inputLength && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.inputLength}</p>}
                </div>
                <div>
                  <label htmlFor="inputWidth" style={{ fontWeight: 600, color: '#333', marginBottom: '0.5rem', display: 'block' }}>Custom Input Paper Width (cm):</label>
                  <input
                    type="number"
                    id="inputWidth"
                    value={formData.inputWidth}
                    onChange={(e) => handleInputChange('inputWidth', parseFloat(e.target.value))}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      color: '#4b5563',
                      transition: 'border-color 0.2s'
                    }}
                  />
                  {errors.inputWidth && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.inputWidth}</p>}
                </div>
              </div>
            )}

            {/* Output Dimensions */}
            <div>
              <label htmlFor="outputLength" style={{ fontWeight: 600, color: '#333', marginBottom: '0.5rem', display: 'block' }}>
                Output {formData.jobType} Length (cm):
              </label>
              <input
                type="number"
                id="outputLength"
                value={formData.outputLength}
                onChange={(e) => handleInputChange('outputLength', parseFloat(e.target.value))}
                min="1"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  color: '#4b5563',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.outputLength && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.outputLength}</p>}
            </div>

            <div>
              <label htmlFor="outputWidth" style={{ fontWeight: 600, color: '#333', marginBottom: '0.5rem', display: 'block' }}>
                Output {formData.jobType} Width (cm):
              </label>
              <input
                type="number"
                id="outputWidth"
                value={formData.outputWidth}
                onChange={(e) => handleInputChange('outputWidth', parseFloat(e.target.value))}
                min="1"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  color: '#4b5563',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.outputWidth && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.outputWidth}</p>}
            </div>

            {/* Print Sides */}
            <div>
              <label style={{ fontWeight: 600, color: '#333', marginBottom: '0.5rem', display: 'block' }}>Print Sides:</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: 500, color: '#4b5563' }}>
                  <input
                    type="radio"
                    name="printSides"
                    value={1}
                    checked={formData.printSides === 1}
                    onChange={(e) => handleInputChange('printSides', parseInt(e.target.value))}
                    style={{ marginRight: '0.5rem' }}
                  />
                  One Side
                </label>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: 500, color: '#4b5563' }}>
                  <input
                    type="radio"
                    name="printSides"
                    value={2}
                    checked={formData.printSides === 2}
                    onChange={(e) => handleInputChange('printSides', parseInt(e.target.value))}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Both Sides
                </label>
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <label style={{ fontWeight: 600, color: '#333', marginBottom: '0.5rem', display: 'block' }}>Additional Finishing Options:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', fontWeight: 500, color: '#4b5563' }}>
                    <input
                      type="checkbox"
                      checked={formData.addFolding}
                      onChange={(e) => handleInputChange('addFolding', e.target.checked)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Folding
                  </label>
                  {formData.addFolding && (
                    <div style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                      <label htmlFor="numFoldLines" style={{ fontWeight: 500, color: '#333', marginBottom: '0.25rem', display: 'block', fontSize: '0.875rem' }}>
                        Number of Fold Lines:
                      </label>
                      <input
                        type="number"
                        id="numFoldLines"
                        value={formData.numFoldLines}
                        onChange={(e) => handleInputChange('numFoldLines', parseInt(e.target.value))}
                        min="1"
                        style={{
                          width: '6rem',
                          padding: '0.375rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}
                      />
                      {errors.numFoldLines && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.numFoldLines}</p>}
                    </div>
                  )}
                </div>
                
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: 500, color: '#4b5563' }}>
                  <input
                    type="checkbox"
                    checked={formData.addFoiling}
                    onChange={(e) => handleInputChange('addFoiling', e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Foiling
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: 500, color: '#4b5563' }}>
                  <input
                    type="checkbox"
                    checked={formData.addEmbossing}
                    onChange={(e) => handleInputChange('addEmbossing', e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Embossing/Debossing
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: 500, color: '#4b5563' }}>
                  <input
                    type="checkbox"
                    checked={formData.addUvPrinting}
                    onChange={(e) => handleInputChange('addUvPrinting', e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  UV Printing
                </label>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={exportPdf}
              style={{
                backgroundColor: '#6b7280',
                color: '#ffffff',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s, transform 0.1s',
                boxShadow: '0 4px 10px rgba(107, 114, 128, 0.3)',
                border: 'none',
                marginTop: '1rem'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#4b5563';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#6b7280';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Export as PDF
            </button>
          </div>

          {/* Results Section */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Results */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#1f2937',
                marginBottom: '1rem'
              }}>Estimation Results</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px dashed #e5e7eb'
                }}>
                  <span style={{ fontWeight: 500, color: '#4b5563' }}>Items per Input Sheet:</span>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>{results.cardsPerSheet}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px dashed #e5e7eb'
                }}>
                  <span style={{ fontWeight: 500, color: '#4b5563' }}>Total Input Sheets Required:</span>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>{results.totalSheetsRequired}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px dashed #e5e7eb'
                }}>
                  <span style={{ fontWeight: 500, color: '#4b5563' }}>Selected Paper Type:</span>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>{results.paperTypeName}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px dashed #e5e7eb'
                }}>
                  <span style={{ fontWeight: 500, color: '#4b5563' }}>Input Sheet Dimensions:</span>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>{results.inputDimensions}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px dashed #e5e7eb'
                }}>
                  <span style={{ fontWeight: 500, color: '#4b5563' }}>Output Item Type:</span>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>{formData.jobType}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px dashed #e5e7eb'
                }}>
                  <span style={{ fontWeight: 500, color: '#4b5563' }}>Output Item Dimensions:</span>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>{results.outputDimensions}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: Object.keys(results.additionsCost).length > 0 ? '1px dashed #e5e7eb' : 'none'
                }}>
                  <span style={{ fontWeight: 500, color: '#4b5563' }}>Print Sides:</span>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>{results.printSidesText}</span>
                </div>
                
                {/* Additional costs */}
                {Object.keys(results.additionsCost).length > 0 && (
                  <>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: '1px dashed #e5e7eb',
                      marginTop: '0.5rem'
                    }}>
                      <span style={{ fontWeight: 600, color: '#374151' }}>Additional Costs:</span>
                      <span></span>
                    </div>
                    {Object.entries(results.additionsCost).map(([addition, cost]) => (
                      <div key={addition} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.25rem 0',
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginLeft: '1rem'
                      }}>
                        <span>- {addition}:</span>
                        <span>${cost.toFixed(2)}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
              
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#10b981',
                marginTop: '1rem',
                textAlign: 'right'
              }}>
                Estimated Cost: ${results.estimatedCost.toFixed(2)}
              </div>
            </div>

            {/* Visualization */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#1f2937',
                marginBottom: '1rem'
              }}>Die Pattern Visualization</h3>
              
              <canvas
                ref={canvasRef}
                width="400"
                height="300"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
              
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginTop: '0.5rem',
                textAlign: 'center'
              }}>
                Visualization of items on a single input sheet (scaled).
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}