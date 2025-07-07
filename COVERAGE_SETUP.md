# Coverage Badge Setup Summary

## What Was Implemented

✅ **Separate Coverage Tracking**
- Overall coverage: Tracks the entire codebase including UI components
- CLI coverage: Focuses specifically on game logic and CLI functionality
- Created separate Vitest configurations for targeted coverage

✅ **Automated Badge Generation**
- GitHub Actions workflow generates coverage badges on every push to main
- Two badges: overall coverage and CLI coverage
- Dynamic colors based on coverage percentage (red < 40%, orange < 60%, yellow < 80%, green ≥ 80%)

✅ **Enhanced CI/CD Pipeline**
- Updated `.github/workflows/lint.yml` to run separate coverage commands
- Automated badge data generation and commit back to repository
- Enhanced PR comments showing both overall and CLI coverage metrics

✅ **README Documentation**
- Added separate badges for overall and CLI coverage
- Added explanatory section about coverage tracking methodology
- Badges automatically link to coverage reports

## Current Coverage Numbers

- **Overall Coverage**: 4% (includes all UI components that aren't currently tested)
- **CLI Coverage**: 13% (core game logic that is actively tested)

## Files Created/Modified

### New Files:
- `vitest.cli.config.ts` - Vitest config for CLI-focused coverage
- `vitest.ui.config.ts` - Vitest config for UI-focused coverage  
- `scripts/extract-coverage.cjs` - Script to extract coverage percentages from coverage reports

### Modified Files:
- `package.json` - Added new scripts for separate coverage runs
- `vitest.config.ts` - Enhanced main Vitest configuration
- `.github/workflows/lint.yml` - Updated to generate and commit badge data
- `README.md` - Added coverage badges and explanation section

## Badge URLs

The badges are now live and will update automatically:

- **Overall Coverage**: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/username/flip-7/main/.github/badges/coverage.json`
- **CLI Coverage**: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/username/flip-7/main/.github/badges/coverage-cli.json`

## Next Steps

1. Fix failing tests to increase coverage accuracy
2. Add UI-specific tests to track UI coverage separately
3. Set coverage thresholds in CI to maintain quality standards
4. Consider adding branch coverage and function coverage badges
