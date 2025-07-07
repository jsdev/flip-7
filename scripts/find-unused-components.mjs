#!/usr/bin/env node

// Script to find unused components in the React/Preact app

import fs from 'fs';
import path from 'path';

const componentDir = './src/components';
const srcDir = './src';
const testsDir = './tests';

// Get all component files
function getComponentFiles() {
  const files = fs.readdirSync(componentDir);
  return files
    .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
    .filter(file => !file.endsWith('.md'))
    .map(file => ({
      name: file,
      baseName: path.parse(file).name,
      fullPath: path.join(componentDir, file)
    }));
}

// Search for imports/usage of a component
function searchForUsage(componentName, searchDirs) {
  const searchPatterns = [
    new RegExp(`import.*${componentName}.*from`, 'i'),
    new RegExp(`import.*{.*${componentName}.*}.*from`, 'i'),
    new RegExp(`<${componentName}`, 'g'),
    new RegExp(`${componentName}\\(`, 'g')
  ];

  const usages = [];

  function searchInDir(dir) {
    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
          searchInDir(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            for (const pattern of searchPatterns) {
              const matches = content.match(pattern);
              if (matches && matches.length > 0) {
                usages.push({
                  file: filePath,
                  matches: matches.length,
                  type: pattern.source.includes('import') ? 'import' : 'usage'
                });
                break; // Found usage in this file, no need to check other patterns
              }
            }
          } catch (err) {
            // Skip files that can't be read
          }
        }
      }
    } catch (err) {
      // Skip directories that can't be read
    }
  }

  searchDirs.forEach(searchInDir);
  return usages;
}

// Analyze all components
function analyzeComponents() {
  const components = getComponentFiles();
  const results = [];

  console.log('🔍 Analyzing component usage...\n');

  for (const component of components) {
    const usages = searchForUsage(component.baseName, [srcDir, testsDir]);
    
    // Filter out self-references (the component file itself)
    const externalUsages = usages.filter(usage => 
      !usage.file.includes(component.name)
    );

    results.push({
      component: component.baseName,
      file: component.name,
      usages: externalUsages,
      isUnused: externalUsages.length === 0
    });
  }

  return results;
}

// Display results
function displayResults(results) {
  const unused = results.filter(r => r.isUnused);
  const used = results.filter(r => !r.isUnused);

  console.log('🗑️  UNUSED COMPONENTS:');
  console.log('='.repeat(50));
  
  if (unused.length === 0) {
    console.log('✅ No unused components found!');
  } else {
    unused.forEach(comp => {
      console.log(`❌ ${comp.component} (${comp.file})`);
    });
  }

  console.log('\n✅ USED COMPONENTS:');
  console.log('='.repeat(50));
  
  used.forEach(comp => {
    console.log(`✓ ${comp.component} (${comp.usages.length} usage(s))`);
    comp.usages.forEach(usage => {
      const relativePath = path.relative('.', usage.file);
      console.log(`    → ${relativePath} (${usage.type})`);
    });
    console.log('');
  });

  console.log('\n📊 SUMMARY:');
  console.log('='.repeat(50));
  console.log(`Total components: ${results.length}`);
  console.log(`Used: ${used.length}`);
  console.log(`Unused: ${unused.length}`);
  
  if (unused.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('='.repeat(50));
    console.log('Consider removing these unused components:');
    unused.forEach(comp => {
      console.log(`- rm src/components/${comp.file}`);
    });
  }
}

// Run analysis
const results = analyzeComponents();
displayResults(results);
