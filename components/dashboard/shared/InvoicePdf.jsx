import React from 'react';

const InvoicePdf = ({ results, formatUSD }) => {
  if (!results) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No invoice to display. Click "Calculate Estimate" first.
      </div>
    );
  }

  const c = results;

  return (
    <div 
      id="invoiceContent" 
      style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        lineHeight: '1.4'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '30px', borderBottom: '2px solid #1f2937', paddingBottom: '15px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          margin: '0',
          textAlign: 'center'
        }}>
          Invoice — {c.quoteNumber}
        </h1>
      </div>

      {/* Client & Job Info */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '30px',
        gap: '40px'
      }}>
        <div style={{ flex: '1' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '15px', fontSize: '16px' }}>Client Information</h3>
          <div style={{ fontSize: '14px' }}>
            <p style={{ margin: '8px 0', color: '#1f2937' }}>
              <strong>Client:</strong> {c.clientName}
            </p>
            <p style={{ margin: '8px 0', color: '#1f2937' }}>
              <strong>Job Type:</strong> {c.jobType}
            </p>
            <p style={{ margin: '8px 0', color: '#1f2937' }}>
              <strong>Quantity:</strong> {c.itemsNeeded.toLocaleString()} items
            </p>
            <p style={{ margin: '8px 0', color: '#1f2937' }}>
              <strong>Item Size:</strong> {c.itemL.toFixed(1)}cm × {c.itemW.toFixed(1)}cm
            </p>
            <p style={{ margin: '8px 0', color: '#1f2937' }}>
              <strong>Paper Type:</strong> {c.paperType} ({c.sheetL}cm × {c.sheetW}cm)
            </p>
          </div>
        </div>
        
        <div style={{ flex: '1' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '15px', fontSize: '16px' }}>Production Details</h3>
          <div style={{ fontSize: '14px' }}>
            <p style={{ margin: '8px 0', color: '#1f2937' }}>
              <strong>Items/Sheet:</strong> {c.itemsPerSheet}
            </p>
            <p style={{ margin: '8px 0', color: '#1f2937' }}>
              <strong>Total Sheets:</strong> {c.totalSheets}
            </p>
            <p style={{ margin: '8px 0', color: '#1f2937' }}>
              <strong>Production Time:</strong> {c.prodRes.hours}h ({c.prodRes.days} days)
            </p>
            <p style={{ margin: '8px 0', color: '#1f2937' }}>
              <strong>Estimated Delivery:</strong> {c.prodRes.delivery}
            </p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown Table */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ color: '#1f2937', marginBottom: '15px', fontSize: '16px' }}>Cost Breakdown</h3>
        
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          border: '1px solid #d1d5db'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151',
                border: '1px solid #d1d5db',
                width: '70%'
              }}>
                Description
              </th>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'right', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151',
                border: '1px solid #d1d5db',
                width: '30%'
              }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Base Production */}
            <tr>
              <td style={{ 
                padding: '12px 16px', 
                color: '#374151', 
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}>
                Base Production
              </td>
              <td style={{ 
                padding: '12px 16px', 
                textAlign: 'right', 
                color: '#1f2937', 
                border: '1px solid #d1d5db',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {formatUSD(c.costBreakdown.baseCost)}
              </td>
            </tr>

            {/* Additional Services */}
            {Object.entries(c.costBreakdown.additions).map(([addName, addCost]) => (
              <tr key={addName}>
                <td style={{ 
                  padding: '12px 16px', 
                  color: '#374151', 
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}>
                  {addName}
                </td>
                <td style={{ 
                  padding: '12px 16px', 
                  textAlign: 'right', 
                  color: '#1f2937', 
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {formatUSD(addCost)}
                </td>
              </tr>
            ))}

            {/* Rush Surcharge */}
            {c.costBreakdown.rushSurcharge > 0 && (
              <tr style={{ backgroundColor: '#fef3c7' }}>
                <td style={{ 
                  padding: '12px 16px', 
                  color: '#374151', 
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}>
                  Rush Surcharge
                </td>
                <td style={{ 
                  padding: '12px 16px', 
                  textAlign: 'right', 
                  color: '#1f2937', 
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {formatUSD(c.costBreakdown.rushSurcharge)}
                </td>
              </tr>
            )}

            {/* Total */}
            <tr style={{ backgroundColor: '#dcfce7' }}>
              <td style={{ 
                padding: '16px', 
                color: '#1f2937', 
                border: '1px solid #d1d5db',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                Total Due:
              </td>
              <td style={{ 
                padding: '16px', 
                textAlign: 'right', 
                color: '#15803d', 
                border: '1px solid #d1d5db',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {formatUSD(c.costBreakdown.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '40px', 
        paddingTop: '20px', 
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <p style={{ margin: '0' }}>
          Thank you for your business! Please contact us if you have any questions.
        </p>
      </div>
    </div>
  );
};

export default InvoicePdf;