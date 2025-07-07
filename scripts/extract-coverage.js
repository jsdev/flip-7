#!/usr/bin/env node

import fs from 'fs';

function extractCoverageFromJson(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.coverage) {
      // This is a coverage-final.json format
      return extractFromCoverageFinal(data.coverage);
    } else if (data.summary) {
      // This is a coverage summary format
      return {
        lines: Math.round(data.summary.lines?.pct || 0),
        functions: Math.round(data.summary.functions?.pct || 0),
        branches: Math.round(data.summary.branches?.pct || 0),
        statements: Math.round(data.summary.statements?.pct || 0)
      };
    } else if (data.testResults) {
      // This is a vitest test results format - extract coverage from it
      return extractFromVitestResults(data);
    }
    return { lines: 0, functions: 0, branches: 0, statements: 0 };
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
    return { lines: 0, functions: 0, branches: 0, statements: 0 };
  }
}

function extractFromCoverageFinal(coverage) {
  const summary = {
    lines: { total: 0, covered: 0 },
    functions: { total: 0, covered: 0 },
    statements: { total: 0, covered: 0 },
    branches: { total: 0, covered: 0 }
  };
  
  Object.keys(coverage).forEach(file => {
    const fileCoverage = coverage[file];
    if (fileCoverage.s) {
      summary.statements.total += Object.keys(fileCoverage.s).length;
      summary.statements.covered += Object.values(fileCoverage.s).filter(hits => hits > 0).length;
    }
    if (fileCoverage.f) {
      summary.functions.total += Object.keys(fileCoverage.f).length;
      summary.functions.covered += Object.values(fileCoverage.f).filter(hits => hits > 0).length;
    }
    if (fileCoverage.b) {
      const branches = Object.values(fileCoverage.b);
      branches.forEach(branch => {
        if (Array.isArray(branch)) {
          summary.branches.total += branch.length;
          summary.branches.covered += branch.filter(hits => hits > 0).length;
        }
      });
    }
  });
  
  // Lines are typically same as statements in V8
  summary.lines = summary.statements;
  
  return {
    lines: summary.lines.total > 0 ? Math.round((summary.lines.covered / summary.lines.total) * 100) : 0,
    functions: summary.functions.total > 0 ? Math.round((summary.functions.covered / summary.functions.total) * 100) : 0,
    branches: summary.branches.total > 0 ? Math.round((summary.branches.covered / summary.branches.total) * 100) : 0,
    statements: summary.statements.total > 0 ? Math.round((summary.statements.covered / summary.statements.total) * 100) : 0
  };
}

function extractFromVitestResults(data) {
  // For vitest results, we need to look for coverage in a different place
  // This is a fallback for when coverage isn't in the expected format
  return { lines: 0, functions: 0, branches: 0, statements: 0 };
}

// Extract overall coverage
const overallCoverage = extractCoverageFromJson('./coverage/coverage-final.json');

// Extract CLI coverage
const cliCoverage = extractCoverageFromJson('./coverage-cli/coverage-final.json');

// Extract UI coverage
const uiCoverage = extractCoverageFromJson('./coverage-ui/coverage-final.json');

console.log('Overall Coverage:', overallCoverage.lines + '%');
console.log('CLI Coverage:', cliCoverage.lines + '%');
console.log('UI Coverage:', uiCoverage.lines + '%');

// Output JSON format for GitHub Actions
const result = {
  overall: overallCoverage,
  cli: cliCoverage,
  ui: uiCoverage
};

console.log(JSON.stringify(result, null, 2));
