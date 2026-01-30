import React from 'react';
import { AiRecommendation } from '../types';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface RecommendationPanelProps {
  rec: AiRecommendation | null;
}

const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ rec }) => {
  if (!rec) return null;

  return (
    <div 
      className="bg-gradient-to-br from-grid-800 to-grid-900 border border-gray-700 rounded-lg p-6 mb-6 relative overflow-hidden"
      role="region"
      aria-label="AI Recommendation Strategy"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-grid-accent opacity-5 rounded-bl-full pointer-events-none" aria-hidden="true"></div>
      
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="text-grid-accent w-5 h-5" aria-hidden="true" />
        <h3 className="text-grid-accent font-mono font-bold uppercase tracking-wider">AI Strategy</h3>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-white font-semibold text-xl mb-1">{rec.summary}</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/20 p-4 rounded border border-gray-800">
            <h5 className="text-gray-500 text-xs uppercase mb-2 font-mono">Analysis</h5>
            <p className="text-gray-300 text-sm leading-relaxed">{rec.reasoning}</p>
          </div>
          <div className="bg-black/20 p-4 rounded border border-gray-800">
            <h5 className="text-gray-500 text-xs uppercase mb-2 font-mono">Projected Impact</h5>
            <p className="text-grid-success text-sm leading-relaxed flex items-start">
               <ArrowRight className="w-4 h-4 mr-2 mt-0.5 shrink-0" aria-hidden="true" />
               {rec.impact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RecommendationPanel);