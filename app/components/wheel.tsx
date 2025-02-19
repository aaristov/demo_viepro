
      <div 
        ref={wheelRef}
        className="absolute left-0 top-1/2 -translate-y-1/2 touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <svg width="800" height="800" viewBox="0 0 800 800">
          <g transform={`translate(400, 400) rotate(${rotation * 180 / Math.PI})`}>
            {sectors.map((sector, index) => {
              const angle = (2 * Math.PI * index) / sectors.length;
              const nextAngle = (2 * Math.PI * (index + 1)) / sectors.length;
              const midAngle = (angle + nextAngle) / 2;
              
              const startX = Math.cos(angle) * 300;
              const startY = Math.sin(angle) * 300;
              const endX = Math.cos(nextAngle) * 300;
              const endY = Math.sin(nextAngle) * 300;
              
              const stars = domainAverages[sector.text] || 0;
              const starsDisplay = stars > 0 ? `${stars}★` : '';
              
              return (
                <g key={index} onClick={() => handleSectorClick(index)} style={{ cursor: 'pointer' }}>
                  <path
                    d={`M 0 0 L ${startX} ${startY} A 300 300 0 0 1 ${endX} ${endY} Z`}
                    fill={sector.color}
                    className="transition-opacity duration-200 hover:opacity-90"
                  />
                  <text
                    x={Math.cos(midAngle) * 200}
                    y={Math.sin(midAngle) * 200}
                    textAnchor="middle"
                    transform={`rotate(${90 + midAngle * 180 / Math.PI} ${Math.cos(midAngle) * 200} ${Math.sin(midAngle) * 200})`}
                    className="text-gray-700 text-lg font-medium"
                    style={{ userSelect: 'none' }}
                  >
                    {sector.text}
                  </text>
                  {stars > 0 && (
                    <text
                      x={Math.cos(midAngle) * 160}
                      y={Math.sin(midAngle) * 160}
                      textAnchor="middle"
                      transform={`rotate(${90 + midAngle * 180 / Math.PI} ${Math.cos(midAngle) * 160} ${Math.sin(midAngle) * 160})`}
                      className="text-gray-800 text-base font-bold"
                      style={{ userSelect: 'none' }}
                    >
                      {starsDisplay}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-gray-600">
        <p>Click on a sector to start the survey!</p>
        <p className="text-sm mt-2">Stars show your average rating for each domain</p>
      </div>
    </div>
  );
};

export default HealthWheel;