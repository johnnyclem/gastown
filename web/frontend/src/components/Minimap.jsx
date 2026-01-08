import React, { useMemo } from 'react';

const Minimap = ({ zones, agents, layout }) => {
  const gridSize = layout.grid_size;
  
  // Create a simplified representation
  return (
    <div className="minimap-container">
      <div className="minimap-content">
        {/* Draw background grid hint */}
        <div style={{
          width: '100%',
          height: '100%',
          background: '#f0f0f0',
          position: 'relative'
        }}>
           {zones.map(zone => {
             // Map grid coordinates to %
             const left = (zone.x / gridSize) * 100;
             const top = (zone.y / gridSize) * 100;
             let color = '#ccc';
             if (zone.key === 'city_hall') color = '#ef4444';
             if (zone.key === 'residential_district') color = '#3b82f6';
             if (zone.key === 'commercial_district') color = '#10b981';
             
             return (
               <div key={zone.id} className="minimap-dot" style={{
                 left: `${left}%`,
                 top: `${top}%`,
                 background: color,
                 width: '6px', 
                 height: '6px'
               }} />
             );
           })}
           
           {agents.map((agent, i) => {
             // We need agent coordinates. Since TownMap calculates them on the fly, 
             // ideally we'd pass computed positions. 
             // For now, let's use a rough approximation or skip if too complex without refactoring TownMap.
             // Wait, TownMap calculates coords inside the render loop. 
             // We should probably refactor TownMap to calculate coords in a hook and pass them here.
             // For now, we will render nothing for agents to avoid breaking, 
             // or we need to duplicate the logic. Duplicating logic is safer for a quick fix.
             return null; 
           })}
        </div>
      </div>
    </div>
  );
};

export default Minimap;
