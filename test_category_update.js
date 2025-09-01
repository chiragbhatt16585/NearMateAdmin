const fetch = require('node-fetch');

async function testCategoryUpdate() {
    try {
        // First, let's get a list of categories to find one to test with
        console.log('🔍 Getting categories...');
        const listResponse = await fetch('http://localhost:4000/api/v1/categories', {
            headers: {
                'Authorization': 'Bearer your-token-here' // You'll need to replace this with a real token
            }
        });
        
        if (!listResponse.ok) {
            console.log('❌ Failed to get categories:', listResponse.status, await listResponse.text());
            return;
        }
        
        const categories = await listResponse.json();
        console.log('📋 Found categories:', categories.length);
        
        if (categories.length === 0) {
            console.log('❌ No categories found to test with');
            return;
        }
        
        const testCategory = categories[0];
        console.log('🎯 Testing with category:', testCategory);
        
        // Test 1: Try to clear the tone field
        console.log('\n🧪 Test 1: Clearing tone field...');
        const clearToneResponse = await fetch(`http://localhost:4000/api/v1/categories/${testCategory.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer your-token-here'
            },
            body: JSON.stringify({
                tone: '' // Empty string to clear
            })
        });
        
        console.log('📤 Request body:', JSON.stringify({ tone: '' }));
        console.log('📥 Response status:', clearToneResponse.status);
        console.log('📥 Response body:', await clearToneResponse.text());
        
        // Test 2: Try to set tone to null explicitly
        console.log('\n🧪 Test 2: Setting tone to null...');
        const nullToneResponse = await fetch(`http://localhost:4000/api/v1/categories/${testCategory.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer your-token-here'
            },
            body: JSON.stringify({
                tone: null // Explicit null
            })
        });
        
        console.log('📤 Request body:', JSON.stringify({ tone: null }));
        console.log('📥 Response status:', nullToneResponse.status);
        console.log('📥 Response body:', await nullToneResponse.text());
        
        // Test 3: Try to set tone to undefined (should be ignored)
        console.log('\n🧪 Test 3: Setting tone to undefined...');
        const undefinedToneResponse = await fetch(`http://localhost:4000/api/v1/categories/${testCategory.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer your-token-here'
            },
            body: JSON.stringify({
                tone: undefined // Should be ignored
            })
        });
        
        console.log('📤 Request body:', JSON.stringify({ tone: undefined }));
        console.log('📥 Response status:', undefinedToneResponse.status);
        console.log('📥 Response body:', await undefinedToneResponse.text());
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testCategoryUpdate();
