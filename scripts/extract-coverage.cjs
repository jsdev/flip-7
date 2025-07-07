const fs = require('fs');

function extractCoverageFromCoverageFinal(filePath) {
  try {
    const coverage = JSON.parse(fs.readFileSync(filePath, 'utf8'));
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
    
    summary.lines = summary.statements;
    
    return {
      lines: summary.lines.total > 0 ? Math.round((summary.lines.covered / summary.lines.total) * 100) : 0,
      functions: summary.functions.total > 0 ? Math.round((summary.functions.covered / summary.functions.total) * 100) : 0,
      branches: summary.branches.total > 0 ? Math.round((summary.branches.covered / summary.branches.total) * 100) : 0,
      statements: summary.statements.total > 0 ? Math.round((summary.statements.covered / summary.statements.total) * 100) : 0
    };
  } catch (e) {
    console.error('Error reading', filePath, ':', e.message);
    return { lines: 0, functions: 0, branches: 0, statements: 0 };
  }
}

const overallCoverage = extractCoverageFromCoverageFinal('./coverage/coverage-final.json');
const cliCoverage = extractCoverageFromCoverageFinal('./coverage-cli/coverage-final.json');

const result = {
  overall: overallCoverage,
  cli: cliCoverage,
  ui: { lines: 0, functions: 0, branches: 0, statements: 0 } // Placeholder since UI tests are failing
};

console.log(JSON.stringify(result, null, 2));
