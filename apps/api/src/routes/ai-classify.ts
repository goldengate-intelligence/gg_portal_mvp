import { Elysia, t } from "elysia";
import fs from 'fs/promises';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

interface AIClassifyRequest {
  type: 'naics' | 'psc';
  code: string;
  prompt: string;
}

interface AIClassifyResponse {
  description: string | null;
  source: 'ai' | 'heuristic';
}

// Initialize Claude API client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

const aiClassifyRoutes = new Elysia({ prefix: "/ai-classify" })
  .post("/", async ({ body, set }): Promise<AIClassifyResponse> => {
    try {
      const { type, code, prompt } = body as AIClassifyRequest;

      if (!type || !code || !prompt) {
        set.status = 400;
        throw new Error('Missing required fields: type, code, prompt');
      }

      if (!['naics', 'psc'].includes(type)) {
        set.status = 400;
        throw new Error('Invalid type. Must be "naics" or "psc"');
      }

      // Generate AI description
      const description = await generateAIDescription(type, code, prompt);

      if (description) {
        // Persist to files
        await persistToFiles(type, code, description);

        return {
          description,
          source: 'ai' as const
        };
      }

      // Fallback to heuristic
      const heuristicDescription = getHeuristicDescription(type, code);

      return {
        description: heuristicDescription,
        source: 'heuristic' as const
      };

    } catch (error) {
      console.error('AI classify error:', error);
      set.status = 500;
      throw new Error('Internal server error');
    }
  }, {
    body: t.Object({
      type: t.Union([t.Literal('naics'), t.Literal('psc')]),
      code: t.String(),
      prompt: t.String()
    })
  });

/**
 * Generate AI description using Claude Haiku
 */
async function generateAIDescription(
  type: 'naics' | 'psc',
  code: string,
  prompt: string
): Promise<string | null> {
  try {
    // Check if API key is configured
    if (!process.env.CLAUDE_API_KEY) {
      console.warn('CLAUDE_API_KEY not configured, falling back to pattern matching');
      return generatePatternDescription(type, code);
    }

    // Prepare the prompt based on type
    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'naics') {
      systemPrompt = 'You are an expert in NAICS (North American Industry Classification System) codes. Provide concise, accurate industry descriptions.';
      userPrompt = `What is the business activity description for NAICS code ${code}? Provide only the concise industry description without the code number. Maximum 50 words.`;
    } else {
      systemPrompt = 'You are an expert in PSC (Product Service Code) classifications used in government contracting. Provide concise, accurate product/service descriptions.';
      userPrompt = `What type of product or service does PSC (Product Service Code) ${code} represent? Provide only the concise product/service description without the code number. Maximum 50 words.`;
    }

    // Call Claude Haiku API
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    // Extract the description from the response
    const description = response.content[0]?.type === 'text'
      ? response.content[0].text.trim()
      : null;

    if (description && description.length > 10) {
      console.log(`Claude AI generated description for ${type.toUpperCase()} ${code}: ${description}`);
      return description;
    }

    // Fallback to pattern matching if AI response is too short
    return generatePatternDescription(type, code);

  } catch (error) {
    console.warn(`Claude AI generation failed for ${type} ${code}:`, error);
    return generatePatternDescription(type, code);
  }
}

/**
 * Generate description using pattern matching (fallback)
 */
function generatePatternDescription(type: 'naics' | 'psc', code: string): string | null {
  if (type === 'naics') {
    return generateNAICSDescription(code);
  } else {
    return generatePSCDescription(code);
  }
}

/**
 * Generate NAICS description based on code patterns
 */
function generateNAICSDescription(naicsCode: string): string | null {
    const codePatterns: Record<string, string> = {
      // Manufacturing (31-33)
      '332': 'Fabricated Metal Product Manufacturing',
      '33231': 'Plate Work and Fabricated Structural Product Manufacturing',
      '332312': 'Fabricated Structural Metal Manufacturing',
      '332313': 'Plate Work Manufacturing',
      '332314': 'Concrete Reinforcing Bar Manufacturing',
      '332321': 'Metal Window and Door Manufacturing',
      '332322': 'Sheet Metal Work Manufacturing',
      '332323': 'Ornamental and Architectural Metal Work Manufacturing',
      '333': 'Machinery Manufacturing',
      '336': 'Transportation Equipment Manufacturing',
      '337': 'Furniture and Related Product Manufacturing',
      '339': 'Miscellaneous Manufacturing',

      // Construction (23)
      '236': 'Construction of Buildings',
      '237': 'Heavy and Civil Engineering Construction',
      '238': 'Specialty Trade Contractors',

      // Professional Services (54)
      '541': 'Professional, Scientific, and Technical Services',
      '5413': 'Architectural, Engineering, and Related Services',
      '5415': 'Computer Systems Design and Related Services',

      // Information (51)
      '518': 'Data Processing, Hosting, and Related Services',
      '519': 'Other Information Services',
    };

    // Try exact match first
    if (codePatterns[naicsCode]) {
      return codePatterns[naicsCode];
    }

    // Try progressively shorter matches
    for (let len = naicsCode.length - 1; len >= 2; len--) {
      const shortCode = naicsCode.substring(0, len);
      if (codePatterns[shortCode]) {
        // Generate more specific description
        const base = codePatterns[shortCode];
        return `${base} - Specialized Services`;
      }
    }

    return null;
  }

/**
 * Generate PSC description based on code patterns
 */
function generatePSCDescription(pscCode: string): string | null {
    const codePatterns: Record<string, string> = {
      // Construction and Building Materials (54-56)
      '54': 'Prefabricated Structures and Scaffolding',
      '5410': 'Prefabricated and Portable Buildings',
      '5411': 'Rigid Wall Shelters',
      '5420': 'Bridges, Fixed and Floating',
      '5440': 'Scaffolding Equipment and Concrete Forms',
      '5445': 'Prefabricated Tower Structures',
      '56': 'Construction and Building Materials',
      '5610': 'Structural Metal Products',
      '5620': 'Masonry Materials',
      '5630': 'Nonmetallic Building Materials',

      // Hand Tools (51)
      '51': 'Hand Tools',
      '5110': 'Hand Tools, Edged, Non-Powered',
      '5120': 'Hand Tools, Non-Edged, Non-Powered',
      '5130': 'Hand Tools, Powered',

      // Industrial Equipment (34-39)
      '34': 'Metalworking Equipment',
      '35': 'Service and Trade Equipment',
      '36': 'Special Industry Machinery',
      '37': 'Agricultural Machinery and Equipment',
      '38': 'Construction, Mining, Excavating Equipment',
      '39': 'Materials Handling Equipment',
    };

    // Try exact match first
    if (codePatterns[pscCode]) {
      return codePatterns[pscCode];
    }

    // Try progressively shorter matches
    for (let len = pscCode.length - 1; len >= 2; len--) {
      const shortCode = pscCode.substring(0, len);
      if (codePatterns[shortCode]) {
        // Generate more specific description
        const base = codePatterns[shortCode];
        return `${base} - Specialized Products`;
      }
    }

    return null;
  }

/**
 * Persist new entries to JSON and CSV files
 */
async function persistToFiles(type: 'naics' | 'psc', code: string, description: string): Promise<void> {
    try {
      const timestamp = new Date().toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit'
      });

      // Add to CSV file
      const csvPath = path.join(__dirname, '../../../ui/public/psc_naics_list.csv');
      const csvLine = buildCSVLine(type, code, description, timestamp);
      await appendToCSVFile(csvPath, csvLine);

      // Add to JSON file
      const jsonPath = path.join(__dirname, '../../../ui/src/data/naics-psc-mappings.json');
      await appendToJSONFile(jsonPath, type, code, description);

      console.info(`Persisted ${type.toUpperCase()} ${code}: ${description}`);
    } catch (error) {
      console.warn(`Failed to persist ${type} ${code}:`, error);
    }
}

/**
 * Build CSV line for the new entry
 */
function buildCSVLine(type: 'naics' | 'psc', code: string, description: string, timestamp: string): string {
    if (type === 'naics') {
      // Get hierarchy levels
      const naics2 = code.substring(0, 2);
      const naics3 = code.substring(0, 3);
      const naics4 = code.substring(0, 4);
      const naics5 = code.substring(0, 5);

      return [
        naics2,
        getHeuristicDescription('naics', naics2),
        naics3,
        code.length >= 3 ? description : getHeuristicDescription('naics', naics2),
        naics4,
        code.length >= 4 ? description : (code.length >= 3 ? description : getHeuristicDescription('naics', naics2)),
        naics5,
        code.length >= 5 ? description : (code.length >= 4 ? description : (code.length >= 3 ? description : getHeuristicDescription('naics', naics2))),
        code,
        description,
        '56', // Default PSC category
        'Construction and Building Materials',
        '567',
        'Building Materials',
        '5670',
        'Building Materials',
        `"${description.toUpperCase()}, AI Generated"`,
        'ai',
        `${timestamp.replace(/\//g, '/')} 10:00`
      ].join(',');
    } else {
      // PSC entry
      const psc2 = code.substring(0, 2);
      const psc3 = code.substring(0, 3);

      return [
        '33', // Default NAICS
        'Manufacturing',
        '332',
        'Fabricated Metal Product Manufacturing',
        '3323',
        'Architectural and Structural Metals Manufacturing',
        '33231',
        'Plate Work and Fabricated Structural Product Manufacturing',
        '332312',
        'Fabricated Structural Metal Manufacturing',
        psc2,
        getHeuristicDescription('psc', psc2),
        psc3,
        code.length >= 3 ? description : getHeuristicDescription('psc', psc2),
        code,
        description,
        `"${description.toUpperCase()}, AI Generated"`,
        'ai',
        `${timestamp.replace(/\//g, '/')} 10:00`
      ].join(',');
    }
}

/**
 * Append line to CSV file
 */
async function appendToCSVFile(filePath: string, csvLine: string): Promise<void> {
    try {
      await fs.appendFile(filePath, `\n${csvLine}`, 'utf8');
    } catch (error) {
      console.warn('Failed to append to CSV:', error);
    }
}

/**
 * Append entry to JSON file
 */
async function appendToJSONFile(filePath: string, type: 'naics' | 'psc', code: string, description: string): Promise<void> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContent);

      if (type === 'naics') {
        if (!data.naicsMappings) data.naicsMappings = {};

        data.naicsMappings[code] = {
          naics_2_char: code.substring(0, 2),
          naics_2_description: getHeuristicDescription('naics', code.substring(0, 2)),
          naics_3_char: code.length >= 3 ? code.substring(0, 3) : code.substring(0, 2),
          naics_3_description: code.length >= 3 ? description : getHeuristicDescription('naics', code.substring(0, 2)),
          naics_4_char: code.length >= 4 ? code.substring(0, 4) : (code.length >= 3 ? code.substring(0, 3) : code.substring(0, 2)),
          naics_4_description: code.length >= 4 ? description : (code.length >= 3 ? description : getHeuristicDescription('naics', code.substring(0, 2))),
          naics_5_char: code.length >= 5 ? code.substring(0, 5) : (code.length >= 4 ? code.substring(0, 4) : (code.length >= 3 ? code.substring(0, 3) : code.substring(0, 2))),
          naics_5_description: code.length >= 5 ? description : (code.length >= 4 ? description : (code.length >= 3 ? description : getHeuristicDescription('naics', code.substring(0, 2)))),
          naics_6_char: code,
          naics_6_description: description,
          keywords: [description.toUpperCase(), 'AI Generated'],
          pscMappings: []
        };
      }

      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('Failed to append to JSON:', error);
    }
}

/**
 * Get heuristic description fallback
 */
function getHeuristicDescription(type: 'naics' | 'psc', code: string): string {
    if (type === 'naics') {
      const codePrefix = code.substring(0, 2);
      const industryMap: Record<string, string> = {
        '11': 'Agriculture, Forestry, Fishing and Hunting',
        '21': 'Mining, Quarrying, and Oil and Gas Extraction',
        '22': 'Utilities',
        '23': 'Construction',
        '31': 'Manufacturing',
        '32': 'Manufacturing',
        '33': 'Manufacturing',
        '42': 'Wholesale Trade',
        '44': 'Retail Trade',
        '45': 'Retail Trade',
        '48': 'Transportation and Warehousing',
        '49': 'Transportation and Warehousing',
        '51': 'Information',
        '52': 'Finance and Insurance',
        '53': 'Real Estate and Rental and Leasing',
        '54': 'Professional, Scientific, and Technical Services',
        '55': 'Management of Companies and Enterprises',
        '56': 'Administrative and Support and Waste Management',
        '61': 'Educational Services',
        '62': 'Health Care and Social Assistance',
        '71': 'Arts, Entertainment, and Recreation',
        '72': 'Accommodation and Food Services',
        '81': 'Other Services (except Public Administration)',
        '92': 'Public Administration'
      };
      return industryMap[codePrefix] || `Industry Classification ${code}`;
    } else {
      const codePrefix = code.substring(0, 2);
      const categoryMap: Record<string, string> = {
        '10': 'Weapons', '11': 'Nuclear Ordnance', '12': 'Fire Control Equipment',
        '13': 'Ammunition and Explosives', '14': 'Guided Missiles',
        '15': 'Aircraft and Airframe Structural Components', '16': 'Aircraft Components and Accessories',
        '51': 'Hand Tools', '52': 'Measuring Tools', '53': 'Hardware and Abrasives',
        '54': 'Prefabricated Structures and Scaffolding', '56': 'Construction and Building Materials',
        '58': 'Communication, Detection, and Coherent Radiation Equipment'
      };
      return categoryMap[codePrefix] || `Product/Service Code ${code}`;
    }
}

export default aiClassifyRoutes;