
import React, { useState, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Edge, Node } from 'reactflow';
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
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === index
                ? 'border-b-2 border-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
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
                className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
                Meet Your Mentor for this Path
            </button>
        </div>
        <div className="md:w-2/3 h-full bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700">
           <ReactFlow
              nodes={nodesWithType}
              edges={currentRoadmap.edges}
              fitView
              proOptions={proOptions}
              nodeTypes={nodeTypes}
           >
            <Background color="#4a5568" gap={16} />
            <Controls />
            <MiniMap nodeColor={n => n.type === 'input' ? '#A78BFA' : (n.type === 'output' ? '#6EE7B7' : '#3B82F6')} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDisplay;
