#!/usr/bin/env node

// Test script for AI classification endpoint
const apiUrl = 'http://localhost:3001/api/v1/ai-classify';

async function testAIClassification() {
  console.log('🤖 Testing Claude AI Classification System\n');

  const testCases = [
    {
      type: 'naics',
      code: '541330',
      description: 'Engineering Services - should use AI for better description'
    },
    {
      type: 'naics',
      code: '999999',
      description: 'Non-existent NAICS code - should trigger AI'
    },
    {
      type: 'psc',
      code: '7030',
      description: 'Information Technology Services - should use AI'
    },
    {
      type: 'psc',
      code: '8888',
      description: 'Non-existent PSC code - should trigger AI'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing ${testCase.type.toUpperCase()} ${testCase.code}: ${testCase.description}`);
    console.log('─'.repeat(80));

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: testCase.type,
          code: testCase.code,
          prompt: `What is the description for ${testCase.type.toUpperCase()} code ${testCase.code}?`
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Status: ${response.status}`);
        console.log(`🎯 Source: ${result.source.toUpperCase()}`);
        console.log(`📝 Description: "${result.description}"`);

        if (result.source === 'ai') {
          console.log('🤖 SUCCESS: Claude AI generated the description!');
        } else {
          console.log('🔄 FALLBACK: Used heuristic/pattern matching');
        }
      } else {
        const error = await response.text();
        console.log(`❌ Error ${response.status}: ${error}`);
      }
    } catch (error) {
      console.log(`💥 Request failed: ${error.message}`);
      console.log('📍 Make sure the API server is running on http://localhost:3001');
    }
  }

  console.log('\n🏁 Test completed!');
  console.log('\nTo check if entries were persisted:');
  console.log('📄 Check: apps/ui/public/psc_naics_list.csv');
  console.log('📄 Check: apps/ui/src/data/naics-psc-mappings.json');
}

// Run the test
testAIClassification().catch(console.error);