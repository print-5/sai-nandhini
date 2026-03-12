#!/usr/bin/env node

/**
 * Performance Test Script
 * Tests the optimizations implemented in Phase 3
 */

const { performance } = require('perf_hooks');

async function testAPIPerformance() {
  console.log('🚀 Testing API Performance...\n');
  
  const endpoints = [
    { name: 'Settings API', url: 'http://localhost:3000/api/settings' },
    { name: 'Categories API', url: 'http://localhost:3000/api/categories' },
    { name: 'Products API', url: 'http://localhost:3000/api/products' },
    { name: 'Dashboard Stats', url: 'http://localhost:3000/api/admin/stats' },
  ];

  for (const endpoint of endpoints) {
    try {
      const start = performance.now();
      const response = await fetch(endpoint.url);
      const end = performance.now();
      
      const duration = Math.round(end - start);
      const status = response.ok ? '✅' : '❌';
      const size = response.headers.get('content-length') || 'Unknown';
      
      console.log(`${status} ${endpoint.name}: ${duration}ms (${size} bytes)`);
      
      if (duration > 1000) {
        console.log(`   ⚠️  Slow response (>${duration}ms)`);
      } else if (duration < 100) {
        console.log(`   🚀 Fast response (<100ms)`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
    }
  }
}

async function testCacheEffectiveness() {
  console.log('\n📦 Testing Cache Effectiveness...\n');
  
  const testUrl = 'http://localhost:3000/api/settings';
  
  // First request (cache miss)
  const start1 = performance.now();
  await fetch(testUrl);
  const end1 = performance.now();
  const firstRequest = Math.round(end1 - start1);
  
  // Second request (cache hit)
  const start2 = performance.now();
  await fetch(testUrl);
  const end2 = performance.now();
  const secondRequest = Math.round(end2 - start2);
  
  console.log(`First request (cache miss): ${firstRequest}ms`);
  console.log(`Second request (cache hit): ${secondRequest}ms`);
  
  const improvement = Math.round(((firstRequest - secondRequest) / firstRequest) * 100);
  console.log(`Cache improvement: ${improvement}% faster`);
  
  if (improvement > 50) {
    console.log('✅ Cache is working effectively');
  } else {
    console.log('⚠️  Cache improvement could be better');
  }
}

async function runPerformanceTests() {
  console.log('='.repeat(50));
  console.log('🎯 PHASE 3 PERFORMANCE TEST RESULTS');
  console.log('='.repeat(50));
  
  await testAPIPerformance();
  await testCacheEffectiveness();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 EXPECTED IMPROVEMENTS:');
  console.log('• Settings API: <50ms (cached)');
  console.log('• Dashboard: <2s (parallel queries)');
  console.log('• Page loads: <1s (streaming)');
  console.log('• Lazy components: Load on demand');
  console.log('='.repeat(50));
}

// Run the tests
runPerformanceTests().catch(console.error);