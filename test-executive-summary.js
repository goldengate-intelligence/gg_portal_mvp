#!/usr/bin/env node

// Test script for AI executive summary generation
const apiUrl = 'http://localhost:3001/api/v1/executive-summary';

async function testExecutiveSummary() {
  console.log('🤖 Testing Claude AI Executive Summary Generation\n');

  const testCases = [
    {
      name: 'Defense Manufacturing Contractor',
      data: {
        uei: 'ABCD1234567E',
        contractorName: 'Trio Fabrication LLC',
        naicsCodes: ['332312', '332321'],
        pscCodes: ['5110', '5610', '5620'],
        agencies: ['Department of Defense', 'Army Corps of Engineers'],
        partners: ['Lockheed Martin', 'General Dynamics'],
        contractTypes: ['FFP', 'CPFF']
      }
    },
    {
      name: 'IT Services Contractor',
      data: {
        uei: 'WXYZ9876543F',
        contractorName: 'TechSolutions Inc',
        naicsCodes: ['541511', '541512'],
        pscCodes: ['7030', '7035', '7045'],
        agencies: ['Department of Homeland Security', 'GSA'],
        partners: ['Microsoft', 'Amazon'],
        contractTypes: ['T&M', 'FFP']
      }
    },
    {
      name: 'Construction Contractor',
      data: {
        uei: 'PQRS5555555G',
        contractorName: 'BuildRight Construction',
        naicsCodes: ['236220', '237110'],
        pscCodes: ['5430', '5440', '5450'],
        agencies: ['Army Corps of Engineers', 'Department of Veterans Affairs'],
        partners: ['Bechtel', 'Turner Construction'],
        contractTypes: ['FFP', 'CPFF']
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(`📊 UEI: ${testCase.data.uei} | Company: ${testCase.data.contractorName}`);
    console.log('─'.repeat(80));

    try {
      const startTime = Date.now();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Status: ${response.status} | Duration: ${duration}ms`);
        console.log(`🎯 Source: ${result.summary.source.toUpperCase()}`);

        // Display the generated summary
        console.log('\n📝 Generated Executive Summary:');
        console.log(`🏆 Headline (${result.summary.headline.length}/40 chars): "${result.summary.headline}"`);
        console.log(`📋 Principal Activity (${result.summary.principalActivity.length}/90 chars): "${result.summary.principalActivity}"`);
        console.log('🔹 Bullet Points:');

        result.summary.bulletPoints.forEach((bullet, index) => {
          console.log(`   ${index + 1}. (${bullet.length}/55 chars): "${bullet}"`);
        });

        // Validation checks
        console.log('\n🔍 Validation:');
        const isValid =
          result.summary.headline.length <= 40 &&
          result.summary.principalActivity.length <= 90 &&
          result.summary.bulletPoints.length === 3 &&
          result.summary.bulletPoints.every(bullet => bullet.length <= 55);

        console.log(`   ${isValid ? '✅' : '❌'} Character limits respected`);
        console.log(`   ${result.summary.bulletPoints.length === 3 ? '✅' : '❌'} Exactly 3 bullet points`);

        if (result.summary.source === 'ai') {
          console.log('🤖 SUCCESS: Claude AI generated the summary!');
          console.log('💾 Summary cached for future requests');
        } else {
          console.log('🔄 CACHED: Loaded from previous generation');
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
  console.log('\nTo check cached summaries:');
  console.log('📄 Check: apps/ui/src/data/executive-summaries-cache.json');

  console.log('\n🎯 Expected Behavior:');
  console.log('1. First run: Claude generates new summaries');
  console.log('2. Second run: Summaries loaded from cache');
  console.log('3. All character limits respected');
  console.log('4. Context-aware descriptions based on PSC/NAICS codes');
}

// Run the test
testExecutiveSummary().catch(console.error);