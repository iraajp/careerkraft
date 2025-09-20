

import React, { useState, useMemo } from 'react';
// Fix: Import BackgroundVariant from reactflow to use for the variant prop.
import ReactFlow, { Background, Controls, MiniMap, Edge, Node, BackgroundVariant } from 'reactflow';
import { Roadmap } from '../types';
import 'reactflow/dist/style.css';

interface RoadmapDisplayProps {
  roadmaps: Roadmap[];
  onSelect: (roadmap: Roadmap) => void;
}

const nodeTypes = {
  custom: ({ data }: { data: any }) => (
    <div className="p-3 bg-gray-800 border-2 border-purple-500 rounded-md shadow-lg">
      <p className="text-white text-sm">{data.label}</p>
    </div>
  ),
};

const proOptions = { hideAttribution: true };

const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({ roadmaps, onSelect }) => {
  const [activeTab, setActiveTab] = useState(0);

  const memoizedRoadmaps = useMemo(() => roadmaps, [roadmaps]);
  const currentRoadmap = memoizedRoadmaps[activeTab];

  if (!memoizedRoadmaps || memoizedRoadmaps.length === 0) {
    return <div>No roadmaps to display.</div>;
  }

  // Ensure all nodes have a type, defaulting to 'default' if not present
  const nodesWithType: Node[] = currentRoadmap.nodes.map(node => ({
    ...node,
    type: node.type || 'default'
  }));


  return (
    <div className="w-full h-[80vh] flex flex-col p-6 bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 text-center text-purple-300">Your Personalized Career Roadmaps</h1>
        <p className="text-center text-gray-400 mb-6">Explore the paths we've generated for you and select one to meet your AI mentor.</p>
      
      <div className="flex border-b border-gray-600 mb-4">
        {memoizedRoadmaps.map((roadmap, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-3 text-sm font-semibold transition-colors duration-200 focus:outline-none ${
              activeTab === index
                ? 'border-b-2 border-purple-500 text-purple-300 font-bold'
                : 'text-gray-400 hover:text-purple-400 border-b-2 border-transparent'
            }`}
          >
            {roadmap.title}
          </button>
        ))}
      </div>

      <div className="flex-grow flex flex-col md:flex-row gap-6 h-full overflow-hidden">
        <div className="md:w-1/3 flex flex-col">
            <h2 className="text-xl font-bold text-purple-400 mb-2">{currentRoadmap.title}</h2>
            <p className="text-gray-300 mb-6 flex-grow">{currentRoadmap.description}</p>
            <button
                onClick={() => onSelect(currentRoadmap)}
                className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
                Meet Your AI Mentor
            </button>
        </div>
        <div className="md:w-2/3 h-full bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700">
           <ReactFlow
              nodes={nodesWithType}
              edges={currentRoadmap.edges as Edge[]}
              nodeTypes={nodeTypes}
              fitView
              proOptions={proOptions}
            >
              {/* Fix: Use BackgroundVariant.Dots for type safety. */}
              <Background color="#4a044e" variant={BackgroundVariant.Dots} />
              <Controls />
              <MiniMap nodeColor={(n) => {
                  if (n.type === 'input') return '#6366f1';
                  if (n.type === 'output') return '#a855f7';
                  return '#2dd4bf';
              }} />
            </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDisplay;