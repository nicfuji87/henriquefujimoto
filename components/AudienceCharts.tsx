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
            <div className="rounded-3xl border border-white/[0.07] bg-coal p-8 text-center font-grotesk text-white/55">
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
                className="rounded-3xl border border-white/[0.07] bg-coal p-6 transition-all hover:border-lime/25"
            >
                <h4 className="mb-6 flex items-center gap-2 font-grotesk font-semibold text-white">
                    <span className="h-6 w-1.5 rounded-full bg-lime"></span>
                    Gênero e idade
                </h4>

                {/* Gender Split */}
                <div className="mb-8">
                    <div className="mb-2 flex justify-between font-grotesk text-xs text-white/50">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-lime"></span>
                            Mulheres
                        </span>
                        <span className="flex items-center gap-1.5">
                            Homens
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-white/40"></span>
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 text-right font-grotesk text-sm font-semibold text-lime">{processedGender.femalePercent}%</div>
                        <div className="flex h-4 flex-1 overflow-hidden rounded-full bg-white/10">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${processedGender.femalePercent}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full rounded-l-full bg-lime"
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${processedGender.malePercent}%` }}
                                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                className="h-full rounded-r-full bg-white/30"
                            />
                        </div>
                        <div className="w-10 text-left font-grotesk text-sm font-semibold text-white/60">{processedGender.malePercent}%</div>
                    </div>
                </div>

                {/* Age Bars */}
                <div className="space-y-2.5">
                    {processedGender.sortedAges.map(([age, val], i) => {
                        const pct = Math.round((val / processedGender.totalAge) * 100);
                        return (
                            <div key={age} className="flex items-center gap-2 font-grotesk text-xs">
                                <span className="w-12 text-right font-medium text-white/50">{age}</span>
                                <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(val / processedGender.maxAgeVal) * 100}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                                        className="h-full rounded-full bg-lime"
                                    />
                                </div>
                                <span className="w-8 text-right font-semibold text-white/70">
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
                className="rounded-3xl border border-white/[0.07] bg-coal p-6 transition-all hover:border-lime/25"
            >
                <h4 className="mb-6 flex items-center gap-2 font-grotesk font-semibold text-white">
                    <span className="h-6 w-1.5 rounded-full bg-lime"></span>
                    Principais cidades
                </h4>

                <div className="space-y-3">
                    {processedCities.sorted.map(([city, val], i) => {
                        const pct = Math.round((val / processedCities.totalFollowers) * 100);
                        return (
                            <div key={city} className="relative group">
                                <div className="relative z-10 mb-1 flex justify-between font-grotesk text-xs text-white/70">
                                    <span className="flex items-center gap-2 font-medium">
                                        <span className="w-4 font-grotesk text-white/40">{i + 1}.</span>
                                        {city}
                                    </span>
                                    <span className="font-grotesk font-semibold text-lime">{pct}%</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(val / processedCities.maxVal) * 100}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.08 }}
                                        className="h-full rounded-full bg-lime"
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
