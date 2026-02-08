import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface AudienceProps {
    cityData: Record<string, number>;
    genderAgeData: Record<string, number>;
}

const AudienceCharts: React.FC<AudienceProps> = ({ cityData, genderAgeData }) => {
    // --- Process Gender/Age Data ---
    // The data comes like: "F.18-24": 120, "M.25-34": 80
    const processedGender = useMemo(() => {
        let male = 0;
        let female = 0;
        const ageDistribution: Record<string, number> = {};

        Object.entries(genderAgeData).forEach(([key, val]) => {
            const [gender, age] = key.split('.');
            if (gender === 'M') male += val;
            if (gender === 'F') female += val;

            ageDistribution[age] = (ageDistribution[age] || 0) + val;
        });

        const total = male + female;

        // Convert directly to percentages for display
        const malePercent = total ? Math.round((male / total) * 100) : 0;
        const femalePercent = total ? Math.round((female / total) * 100) : 0;

        // Sort age groups
        const sortedAges = Object.entries(ageDistribution).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
        const maxAgeVal = Math.max(...Object.values(ageDistribution), 1); // Avoid div by zero

        return { malePercent, femalePercent, sortedAges, maxAgeVal };
    }, [genderAgeData]);


    // --- Process City Data ---
    const processedCities = useMemo(() => {
        // Sort by value descending and take top 5
        const sorted = Object.entries(cityData)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        const maxVal = sorted.length > 0 ? sorted[0][1] : 1;

        return { sorted, maxVal };
    }, [cityData]);

    if (!genderAgeData || Object.keys(genderAgeData).length === 0) {
        return (
            <div className="text-center p-8 text-gray-500 bg-white/5 rounded-xl border border-white/10">
                Dados de audiência indisponíveis no momento.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

            {/* Gender & Age Chart */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl"
            >
                <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                    Gênero e Idade
                </h4>

                {/* Gender Bar */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 text-right text-sm font-medium text-pink-400">{processedGender.femalePercent}% M</div>
                    <div className="flex-1 h-3 bg-gray-700/50 rounded-full overflow-hidden flex">
                        <div
                            style={{ width: `${processedGender.femalePercent}%` }}
                            className="h-full bg-pink-500"
                        />
                        <div
                            style={{ width: `${processedGender.malePercent}%` }}
                            className="h-full bg-blue-500"
                        />
                    </div>
                    <div className="w-12 text-left text-sm font-medium text-blue-400">{processedGender.malePercent}% H</div>
                </div>

                {/* Age Bars */}
                <div className="space-y-3">
                    {processedGender.sortedAges.map(([age, val]) => (
                        <div key={age} className="flex items-center text-xs">
                            <span className="w-10 text-gray-400">{age}</span>
                            <div className="flex-1 h-2 bg-gray-700/30 rounded-full overflow-hidden mx-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${(val / processedGender.maxAgeVal) * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-blue-600 to-purple-500 rounded-full"
                                />
                            </div>
                            <span className="w-8 text-right text-gray-300 font-mono">
                                {Math.round((val / (Object.values(processedGender.sortedAges).reduce((acc, curr) => acc + curr[1], 0))) * 100)}%
                            </span>
                            {/* Note: Actually val is raw count, need logic to show % of total or raw? Usually % of total audience.
                  Let's re-calculate total age sum for accurate %. */}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Top Cities Chart */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl"
            >
                <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                    Top Cidades
                </h4>

                <div className="space-y-4">
                    {processedCities.sorted.map(([city, val], i) => (
                        <div key={city} className="relative group">
                            <div className="flex justify-between text-xs text-gray-300 mb-1 z-10 relative">
                                <span className="font-medium">{city}</span>
                                <span className="font-mono text-gray-400">{val}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-700/30 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${(val / processedCities.maxVal) * 100}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

        </div>
    );
};

export default AudienceCharts;
