// Test script for Netlify Functions
// Run with: node test-netlify-functions.js

const BASE_URL = 'https://your-site.netlify.app'; // Replace with your actual Netlify URL

async function testNetlifyFunction(endpoint, payload) {
  const url = `${BASE_URL}/api/${endpoint}`;
  
  try {
    console.log(`🧪 Testing ${endpoint}...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ ${endpoint} test successful:`, result);
    return result;
  } catch (error) {
    console.error(`❌ ${endpoint} test failed:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Testing Netlify Functions...\n');

  // Test topic analysis
  await testNetlifyFunction('analyze-topic', {
    topic: 'leadership'
  });

  console.log(''); // Add spacing

  // Test chapter analysis
  await testNetlifyFunction('analyze-chapter', {
    chapter: {
      id: 1,
      chapter_title: 'The Art of Leadership',
      chapter_text: 'Leadership is about inspiring others to achieve great things. It requires vision, communication, and the ability to motivate teams towards common goals.'
    },
    query: 'leadership strategies'
  });

  console.log(''); // Add spacing

  // Test embeddings
  await testNetlifyFunction('generate-embeddings', {
    query: 'leadership development'
  });

  console.log('\n🎉 Netlify Functions testing complete!');
  console.log('\nIf all tests passed, your Netlify Functions are working.');
  console.log('If tests failed, make sure you:');
  console.log('1. Set OPENAI_API_KEY in Netlify environment variables');
  console.log('2. Deployed the functions to Netlify');
  console.log('3. Have sufficient OpenAI credits');
  console.log('4. Updated BASE_URL in this script to your actual Netlify URL');
}

// Run the tests
runTests().catch(console.error);
