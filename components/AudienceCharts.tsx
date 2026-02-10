import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface AudienceProps {
    cityData: Record<string, number>;
    genderAgeData: Record<string, number>;
}

const AudienceCharts: React.FC<AudienceProps> = ({ cityData, genderAgeData }) => {
    // --- Process Gender/Age Data ---
    // New API format: "F, 25-34": 120, "M, 18-24": 80
    // Old API format: "F.18-24": 120, "M.25-34": 80
    const processedGender = useMemo(() => {
        let male = 0;
        let female = 0;
        const ageDistribution: Record<string, number> = {};

        Object.entries(genderAgeData).forEach(([key, val]) => {
            const numVal = Number(val) || 0;
            // Support both formats: "F.18-24" and "F, 18-24"
            const separator = key.includes(', ') ? ', ' : '.';
            const [gender, age] = key.split(separator);
            const genderTrimmed = gender?.trim();
            const ageTrimmed = age?.trim();

            if (genderTrimmed === 'M') male += numVal;
            if (genderTrimmed === 'F') female += numVal;

            if (ageTrimmed) {
                ageDistribution[ageTrimmed] = (ageDistribution[ageTrimmed] || 0) + numVal;
            }
        });

        const total = male + female;
        const malePercent = total ? Math.round((male / total) * 100) : 0;
        const femalePercent = total ? Math.round((female / total) * 100) : 0;

        // Sort age groups logically
        const sortedAges = Object.entries(ageDistribution).sort((a, b) => {
            const numA = parseInt(a[0].split('-')[0]) || 0;
            const numB = parseInt(b[0].split('-')[0]) || 0;
            return numA - numB;
        });
        const maxAgeVal = Math.max(...Object.values(ageDistribution), 1);
        const totalAge = Object.values(ageDistribution).reduce((a, b) => a + b, 0) || 1;

        return { malePercent, femalePercent, sortedAges, maxAgeVal, total, totalAge };
    }, [genderAgeData]);


    // --- Process City Data ---
    const processedCities = useMemo(() => {
        // Clean city names: remove " (state)" from names
        const cleaned: Record<string, number> = {};
        Object.entries(cityData).forEach(([key, val]) => {
            const numVal = Number(val) || 0;
            // Remove state info: "São Paulo, São Paulo (state)" → "São Paulo"
            const cityName = key.split(',')[0]?.trim() || key;
            cleaned[cityName] = (cleaned[cityName] || 0) + numVal;
        });

        const sorted = Object.entries(cleaned)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8);

        const maxVal = sorted.length > 0 ? sorted[0][1] : 1;
        const totalFollowers = Object.values(cleaned).reduce((a, b) => a + b, 0) || 1;

        return { sorted, maxVal, totalFollowers };
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

                {/* Gender Split */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 bg-pink-500 rounded-full inline-block"></span>
                            Mulheres
                        </span>
                        <span className="flex items-center gap-1.5">
                            Homens
                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block"></span>
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 text-right text-sm font-bold text-pink-400">{processedGender.femalePercent}%</div>
                        <div className="flex-1 h-4 bg-gray-700/50 rounded-full overflow-hidden flex">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${processedGender.femalePercent}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-l-full"
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${processedGender.malePercent}%` }}
                                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-r-full"
                            />
                        </div>
                        <div className="w-10 text-left text-sm font-bold text-blue-400">{processedGender.malePercent}%</div>
                    </div>
                </div>

                {/* Age Bars */}
                <div className="space-y-2.5">
                    {processedGender.sortedAges.map(([age, val], i) => {
                        const pct = Math.round((val / processedGender.totalAge) * 100);
                        return (
                            <div key={age} className="flex items-center text-xs gap-2">
                                <span className="w-12 text-gray-400 font-medium text-right">{age}</span>
                                <div className="flex-1 h-3 bg-gray-700/30 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(val / processedGender.maxAgeVal) * 100}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                                        className="h-full bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 rounded-full"
                                    />
                                </div>
                                <span className="w-8 text-right text-gray-300 font-mono font-bold">
                                    {pct}%
                                </span>
                            </div>
                        );
                    })}
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

                <div className="space-y-3">
                    {processedCities.sorted.map(([city, val], i) => {
                        const pct = Math.round((val / processedCities.totalFollowers) * 100);
                        return (
                            <div key={city} className="relative group">
                                <div className="flex justify-between text-xs text-gray-300 mb-1 z-10 relative">
                                    <span className="font-medium flex items-center gap-2">
                                        <span className="text-gray-500 font-mono w-4">{i + 1}.</span>
                                        {city}
                                    </span>
                                    <span className="font-mono text-green-400 font-bold">{pct}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-700/30 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(val / processedCities.maxVal) * 100}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.08 }}
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

        </div>
    );
};

export default AudienceCharts;
