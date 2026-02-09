import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface BrazilMapProps {
    cityData: Record<string, number>;
}

// Map city state names from Instagram API to Brazilian state codes
const stateNameToCode: Record<string, string> = {
    'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
    'Bahia': 'BA', 'Ceará': 'CE', 'Federal District': 'DF',
    'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA',
    'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
    'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE',
    'Piauí': 'PI', 'Rio de Janeiro (state)': 'RJ', 'Rio de Janeiro': 'RJ',
    'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS', 'Rondônia': 'RO',
    'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo (state)': 'SP',
    'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO',
};

const stateCodeToName: Record<string, string> = {
    'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
    'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal',
    'ES': 'Espírito Santo', 'GO': 'Goiás', 'MA': 'Maranhão',
    'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
    'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco',
    'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima',
    'SC': 'Santa Catarina', 'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins',
};

// Simplified SVG paths for Brazilian states (low-detail for performance)
const statePaths: Record<string, string> = {
    'AM': 'M46,80 L100,55 L155,55 L180,75 L185,105 L170,130 L140,140 L100,135 L60,120 L40,100Z',
    'PA': 'M185,65 L250,55 L270,80 L265,125 L240,140 L215,150 L185,140 L170,130 L185,105Z',
    'MA': 'M270,80 L300,70 L310,90 L300,120 L280,130 L265,125Z',
    'PI': 'M300,90 L315,85 L320,115 L310,135 L295,130 L300,120Z',
    'CE': 'M315,75 L335,75 L340,95 L325,105 L315,95Z',
    'RN': 'M340,85 L355,82 L350,95 L340,95Z',
    'PB': 'M340,95 L355,95 L352,105 L335,105Z',
    'PE': 'M310,105 L355,105 L350,115 L305,118Z',
    'AL': 'M335,115 L350,115 L348,125 L332,122Z',
    'SE': 'M330,122 L345,125 L340,133 L328,130Z',
    'BA': 'M280,130 L330,122 L340,133 L335,175 L300,195 L270,185 L260,160 L265,140Z',
    'MT': 'M140,140 L200,135 L215,150 L220,195 L200,210 L160,205 L140,180Z',
    'GO': 'M220,190 L260,180 L270,200 L260,225 L240,230 L220,215Z',
    'DF': 'M252,200 L262,198 L262,210 L252,210Z',
    'MS': 'M160,205 L200,210 L210,240 L195,260 L170,255 L155,230Z',
    'MG': 'M260,180 L300,195 L310,220 L295,250 L265,255 L250,240 L240,230 L260,225 L270,200Z',
    'ES': 'M310,220 L325,215 L325,240 L310,245Z',
    'SP': 'M210,240 L250,240 L265,255 L255,275 L225,280 L210,265Z',
    'RJ': 'M285,255 L310,248 L305,268 L280,268Z',
    'PR': 'M195,260 L225,275 L235,290 L215,300 L190,295 L185,275Z',
    'SC': 'M205,300 L225,295 L230,315 L210,318Z',
    'RS': 'M185,310 L215,315 L225,340 L205,365 L180,355 L175,330Z',
    'RO': 'M95,135 L140,140 L140,180 L120,185 L100,170 L85,155Z',
    'AC': 'M40,135 L85,140 L85,160 L60,170 L35,155Z',
    'RR': 'M100,20 L130,15 L145,35 L130,55 L105,50Z',
    'AP': 'M250,20 L270,15 L280,35 L270,55 L250,50Z',
    'TO': 'M230,130 L260,130 L265,165 L250,185 L230,175Z',
};

const BrazilMap: React.FC<BrazilMapProps> = ({ cityData }) => {
    const [hoveredState, setHoveredState] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Aggregate city data by state
    const stateData = useMemo(() => {
        const result: Record<string, number> = {};

        Object.entries(cityData).forEach(([cityName, count]) => {
            // City names from API: "São Paulo, São Paulo (state)"
            const parts = cityName.split(', ');
            if (parts.length >= 2) {
                const stateRaw = parts[parts.length - 1]; // last part is state
                const stateCode = stateNameToCode[stateRaw];
                if (stateCode) {
                    result[stateCode] = (result[stateCode] || 0) + Number(count);
                }
            }
        });

        return result;
    }, [cityData]);

    const maxVal = useMemo(() => Math.max(...Object.values(stateData).map(Number), 1), [stateData]);

    // Sorted states for the legend
    const sortedStates = useMemo(() => {
        return Object.entries(stateData)
            .sort(([, a], [, b]) => Number(b) - Number(a))
            .slice(0, 10);
    }, [stateData]);

    const getColor = (code: string) => {
        const val = stateData[code] || 0;
        if (val === 0) return 'rgba(255,255,255,0.04)';
        const intensity = Math.max(0.15, val / maxVal);
        // Gradient from teal to gold based on intensity
        const r = Math.round(20 + intensity * 220);
        const g = Math.round(200 - intensity * 30);
        const b = Math.round(120 - intensity * 80);
        return `rgba(${r},${g},${b},${0.4 + intensity * 0.6})`;
    };

    const getStrokeColor = (code: string) => {
        if (code === hoveredState) return '#fbbf24';
        return stateData[code] ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    if (!cityData || Object.keys(cityData).length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl col-span-1 md:col-span-2"
        >
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                Seguidores por Estado
            </h4>

            <div className="flex flex-col md:flex-row items-center gap-6">
                {/* SVG Map */}
                <div
                    className="relative flex-1 w-full max-w-[400px]"
                    onMouseMove={handleMouseMove}
                >
                    <svg viewBox="20 5 360 375" className="w-full h-auto">
                        {Object.entries(statePaths).map(([code, path]) => (
                            <motion.path
                                key={code}
                                d={path}
                                fill={getColor(code)}
                                stroke={getStrokeColor(code)}
                                strokeWidth={code === hoveredState ? 2.5 : 1}
                                onMouseEnter={() => setHoveredState(code)}
                                onMouseLeave={() => setHoveredState(null)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
                                style={{ cursor: stateData[code] ? 'pointer' : 'default' }}
                                className="transition-all duration-200"
                            />
                        ))}
                        {/* State labels for states with data */}
                        {Object.entries(stateData).map(([code]) => {
                            const path = statePaths[code];
                            if (!path) return null;
                            // Calculate approximate center from path
                            const nums = path.match(/\d+/g)?.map(Number) || [];
                            if (nums.length < 4) return null;
                            const xs = nums.filter((_, i) => i % 2 === 0);
                            const ys = nums.filter((_, i) => i % 2 === 1);
                            const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
                            const cy = ys.reduce((a, b) => a + b, 0) / ys.length;
                            return (
                                <text
                                    key={`label-${code}`}
                                    x={cx}
                                    y={cy}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill="white"
                                    fontSize="8"
                                    fontWeight="bold"
                                    opacity={0.7}
                                    pointerEvents="none"
                                >
                                    {code}
                                </text>
                            );
                        })}
                    </svg>

                    {/* Tooltip */}
                    {hoveredState && stateData[hoveredState] && (
                        <div
                            className="absolute pointer-events-none z-30 bg-gray-900/95 border border-white/20 px-3 py-2 rounded-lg shadow-xl backdrop-blur-sm"
                            style={{
                                left: Math.min(tooltipPos.x + 10, 280),
                                top: tooltipPos.y - 40,
                            }}
                        >
                            <p className="text-white text-xs font-bold">{stateCodeToName[hoveredState] || hoveredState}</p>
                            <p className="text-amber-400 text-sm font-bold">{stateData[hoveredState]} seguidores</p>
                        </div>
                    )}
                </div>

                {/* State Ranking */}
                <div className="flex-1 w-full space-y-2.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">
                        Top {sortedStates.length} Estados
                    </p>
                    {sortedStates.map(([code, val], i) => (
                        <div
                            key={code}
                            className={`relative group py-1.5 transition-colors ${hoveredState === code ? 'bg-white/5 rounded-lg px-2 -mx-2' : ''}`}
                            onMouseEnter={() => setHoveredState(code)}
                            onMouseLeave={() => setHoveredState(null)}
                        >
                            <div className="flex justify-between text-xs text-gray-300 mb-1">
                                <span className="font-medium flex items-center gap-2">
                                    <span className="text-gray-500 font-mono w-4">{i + 1}.</span>
                                    <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: getColor(code) }}></span>
                                    {stateCodeToName[code] || code}
                                </span>
                                <span className="font-mono text-amber-400 font-bold">{val}</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-700/30 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${(val / maxVal) * 100}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.08 }}
                                    className="h-full rounded-full"
                                    style={{
                                        background: `linear-gradient(90deg, #f59e0b, #eab308)`
                                    }}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Total */}
                    <div className="pt-3 mt-3 border-t border-white/10 flex justify-between items-center">
                        <span className="text-xs text-gray-400">Total mapeado</span>
                        <span className="text-sm font-bold text-white">
                            {Object.values(stateData).reduce((a: number, b) => a + Number(b), 0)} seguidores
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default BrazilMap;
