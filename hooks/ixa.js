import { useCanvas, useFormValidation, usePaperSizes, useQuoteManager } from "@/hooks"
import {useCalculation} from "@/hooks/useCalculations" 
import {useEfficiencyAnalysis} from "@/hooks/useEfficiencyAnalysis" 
import {useFinishingOptions} from "@/hooks/useFinishingOptions" 
import {useTabNavigation} from "@/hooks/useTabsNavigation" 
import {useJobSpecifications} from "@/hooks/useJobSpecifications" 

// component

import AnalysisTab from "./shared/AnalysisTab"
import CanvasVisualization from "./shared/CanvasVisualization"
import JobSpecificationForm from "./shared/JobSpecificationForm"
import QuotesManager from "./shared/QuotesManager"
import ResultsDisplay from "./shared/ResultsDisplay"
import TabNavigation from "./shared/TabNavigation"


const PrintingEstimationToolRefactored = () => {
  // All your custom hooks here
  const jobSpecs = useJobSpecifications();
  const paperConfig = usePaperSizes();
  const finishingOptions = useFinishingOptions();
  const costCalculation = useCalculation();
  const tabNavigation = useTabNavigation();
  const quoteManager = useQuoteManager();
  const efficiencyAnalysis = useEfficiencyAnalysis();
  const formValidation = useFormValidation();
  const canvasConfig = useCanvas();

  // Main calculation function
  const handleCalculate = () => {
    // Validation using formValidation hook
    if (!formValidation.validateInputs(/* ... */)) return;
    
    // Calculations using various hooks
    const calculations = costCalculation.calculateCosts(/* ... */);
    const efficiency = efficiencyAnalysis.calculateMaterialEfficiency(/* ... */);
    
    // Update results
    costCalculation.updateResults({
      ...calculations,
      ...efficiency
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <AppHeader quoteNumber="PE-001" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Input Section */}
          <JobSpecificationForm 
            jobSpecs={jobSpecs.jobSpecs}
            setters={jobSpecs.setters}
            jobTypeOptions={jobSpecs.jobTypeOptions}
            paperType={paperConfig.paperType}
            setPaperType={paperConfig.setPaperType}
            paperSizes={paperConfig.paperSizes}
            inputDimensions={paperConfig.inputDimensions}
            setInputDimensions={paperConfig.setInputDimensions}
            finishingOptions={finishingOptions.finishingOptions}
            finishingSetters={finishingOptions.setters}
            onCalculate={handleCalculate}
          />

          {/* Output Section */}
          <div className="space-y-6">
            <TabNavigation 
              tabs={tabNavigation.tabs}
              activeTab={tabNavigation.activeTab}
              onTabChange={tabNavigation.setActiveTab}
              getTabClass={tabNavigation.getTabClass}
            />

            {/* Tab Content */}
            {tabNavigation.activeTab === 'results' && (
              <>
                <ResultsDisplay 
                  results={costCalculation.results}
                  efficiencyBadge={efficiencyAnalysis.getEfficiencyBadge(costCalculation.results.materialEfficiency)}
                />
                <CanvasVisualization 
                  inputLength={paperConfig.inputDimensions.length}
                  inputWidth={paperConfig.inputDimensions.width}
                  outputLength={jobSpecs.jobSpecs.outputLength}
                  outputWidth={jobSpecs.jobSpecs.outputWidth}
                  results={costCalculation.results}
                />
              </>
            )}
            
            {tabNavigation.activeTab === 'analysis' && (
              <AnalysisTab 
                results={costCalculation.results}
                finishingOptions={finishingOptions.finishingOptions}
                efficiencyRecommendation={efficiencyAnalysis.getEfficiencyRecommendation(costCalculation.results.materialEfficiency)}
                costOptimizationTip={efficiencyAnalysis.getCostOptimizationTip(costCalculation.results.costPerItem)}
              />
            )}
            
            {tabNavigation.activeTab === 'quotes' && (
              <QuotesManager 
                savedQuotes={quoteManager.savedQuotes}
                onSaveQuote={() => quoteManager.saveQuote(/* current data */)}
                onClearQuotes={quoteManager.clearQuotes}
                onExportPdf={() => alert('PDF export functionality')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintingEstimationToolRefactored;