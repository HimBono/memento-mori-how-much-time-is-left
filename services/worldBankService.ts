import { LifeData, ExpectancyResult } from "../types";

// Map common country names to ISO 3166-1 alpha-3 codes used by World Bank API
const countryCodeMap: Record<string, string> = {
    // Asia
    'singapore': 'SGP', 'japan': 'JPN', 'hong kong': 'HKG', 'south korea': 'KOR', 'korea': 'KOR',
    'china': 'CHN', 'india': 'IND', 'indonesia': 'IDN', 'malaysia': 'MYS', 'thailand': 'THA',
    'vietnam': 'VNM', 'philippines': 'PHL', 'taiwan': 'TWN', 'pakistan': 'PAK', 'bangladesh': 'BGD',
    'sri lanka': 'LKA', 'nepal': 'NPL', 'myanmar': 'MMR', 'cambodia': 'KHM', 'laos': 'LAO',

    // Europe
    'uk': 'GBR', 'united kingdom': 'GBR', 'england': 'GBR', 'great britain': 'GBR',
    'germany': 'DEU', 'france': 'FRA', 'italy': 'ITA', 'spain': 'ESP', 'portugal': 'PRT',
    'switzerland': 'CHE', 'netherlands': 'NLD', 'holland': 'NLD', 'belgium': 'BEL',
    'sweden': 'SWE', 'norway': 'NOR', 'denmark': 'DNK', 'finland': 'FIN', 'iceland': 'ISL',
    'austria': 'AUT', 'ireland': 'IRL', 'poland': 'POL', 'czech republic': 'CZE', 'czechia': 'CZE',
    'hungary': 'HUN', 'romania': 'ROU', 'greece': 'GRC', 'ukraine': 'UKR', 'turkey': 'TUR',

    // Americas
    'usa': 'USA', 'united states': 'USA', 'america': 'USA', 'us': 'USA',
    'canada': 'CAN', 'mexico': 'MEX', 'brazil': 'BRA', 'argentina': 'ARG', 'chile': 'CHL',
    'colombia': 'COL', 'peru': 'PER', 'venezuela': 'VEN', 'ecuador': 'ECU', 'bolivia': 'BOL',
    'uruguay': 'URY', 'paraguay': 'PRY', 'cuba': 'CUB', 'puerto rico': 'PRI',

    // Oceania
    'australia': 'AUS', 'new zealand': 'NZL',

    // Africa
    'south africa': 'ZAF', 'egypt': 'EGY', 'nigeria': 'NGA', 'kenya': 'KEN', 'morocco': 'MAR',
    'ethiopia': 'ETH', 'ghana': 'GHA', 'tanzania': 'TZA', 'algeria': 'DZA', 'uganda': 'UGA',

    // Middle East
    'israel': 'ISR', 'saudi arabia': 'SAU', 'uae': 'ARE', 'united arab emirates': 'ARE',
    'qatar': 'QAT', 'kuwait': 'KWT', 'iran': 'IRN', 'iraq': 'IRQ', 'jordan': 'JOR', 'lebanon': 'LBN',

    // Other
    'russia': 'RUS', 'world': 'WLD', 'earth': 'WLD', 'global': 'WLD'
};

// Fallback life expectancy data when API fails
const fallbackExpectancy: Record<string, number> = {
    'WLD': 73.0, 'USA': 77.5, 'GBR': 81.0, 'JPN': 84.5, 'AUS': 83.0,
    'DEU': 81.0, 'FRA': 82.5, 'CAN': 82.5, 'CHN': 78.0, 'IND': 70.0,
    'BRA': 76.0, 'MEX': 75.0, 'RUS': 73.0, 'ZAF': 65.0, 'SGP': 83.5
};

const getCountryCode = (country: string): string | null => {
    const normalized = country.toLowerCase().trim();

    // Check direct mapping
    if (countryCodeMap[normalized]) {
        return countryCodeMap[normalized];
    }

    // Check if it's already a 3-letter code
    if (/^[A-Za-z]{3}$/.test(country.trim())) {
        return country.trim().toUpperCase();
    }

    // Fuzzy matching - check if any key contains the input or vice versa
    for (const [name, code] of Object.entries(countryCodeMap)) {
        if (name.includes(normalized) || normalized.includes(name)) {
            return code;
        }
    }

    return null;
};

export const fetchLifeExpectancy = async (data: LifeData): Promise<ExpectancyResult> => {
    const countryCode = getCountryCode(data.country) || 'WLD';

    try {
        const response = await fetch(
            `https://api.worldbank.org/v2/country/${countryCode}/indicator/SP.DYN.LE00.IN?format=json&per_page=5`
        );

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const jsonData = await response.json();

        // World Bank API returns [metadata, data] array
        // Find the most recent non-null value
        let expectancy: number | null = null;
        let dataYear: number | null = null;

        if (Array.isArray(jsonData) && jsonData[1]) {
            for (const entry of jsonData[1]) {
                if (entry.value !== null) {
                    expectancy = entry.value;
                    dataYear = entry.date;
                    break;
                }
            }
        }

        if (expectancy === null) {
            // Fallback if no data found
            expectancy = fallbackExpectancy[countryCode] || 73.0;
        }

        // Gender adjustment (World Bank provides overall life expectancy)
        // Women typically live ~2.5 years longer, men ~2.5 years less
        if (data.gender === 'female') expectancy += 2.5;
        if (data.gender === 'male') expectancy -= 2.5;

        const yearsLeft = Math.max(0, expectancy - data.age);

        // Calculate all derived values
        const monthsLeft = yearsLeft * 12;
        const weeksLeft = yearsLeft * 52.177;
        const daysLeft = yearsLeft * 365.242;
        const hoursLeft = daysLeft * 24;

        const summersLeft = Math.floor(yearsLeft);
        const weekendsLeft = Math.floor(weeksLeft);
        const birthdaysLeft = Math.floor(yearsLeft);

        const totalWeeks = expectancy * 52.177;
        const weeksLived = data.age * 52.177;
        const percentLived = (data.age / expectancy) * 100;

        return {
            expectancy,
            yearsLeft,
            monthsLeft,
            weeksLeft,
            daysLeft,
            hoursLeft,
            summersLeft,
            weekendsLeft,
            birthdaysLeft,
            totalWeeks,
            weeksLived,
            percentLived,
            sourceUrls: [{
                uri: "https://data.worldbank.org/indicator/SP.DYN.LE00.IN",
                title: `World Bank Life Expectancy Data${dataYear ? ` (${dataYear})` : ''}`
            }]
        };
    } catch (error) {
        console.error("World Bank API Error:", error);

        // Fallback calculation
        let expectancy = fallbackExpectancy[countryCode] || 73.0;
        if (data.gender === 'female') expectancy += 2.5;
        if (data.gender === 'male') expectancy -= 2.5;

        const yearsLeft = Math.max(0, expectancy - data.age);

        return {
            expectancy,
            yearsLeft,
            monthsLeft: yearsLeft * 12,
            weeksLeft: yearsLeft * 52.177,
            daysLeft: yearsLeft * 365.242,
            hoursLeft: yearsLeft * 365.242 * 24,
            summersLeft: Math.floor(yearsLeft),
            weekendsLeft: Math.floor(yearsLeft * 52.177),
            birthdaysLeft: Math.floor(yearsLeft),
            totalWeeks: expectancy * 52.177,
            weeksLived: data.age * 52.177,
            percentLived: (data.age / expectancy) * 100,
            sourceUrls: [{ uri: "https://data.worldbank.org", title: "World Bank Data (Fallback)" }]
        };
    }
};
