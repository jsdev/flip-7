#!/bin/bash

# Visual Regression Testing Script for Flip 7 Game
# This script runs visual tests and manages baseline images

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎮 Flip 7 Visual Regression Testing${NC}"
echo "=================================="

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if baseline images exist
BASELINE_DIR="tests/visual.spec.ts-snapshots"
UPDATE_BASELINES=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --update-baselines)
            UPDATE_BASELINES=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --update-baselines    Update baseline screenshots"
            echo "  --help, -h           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                   Run visual regression tests"
            echo "  $0 --update-baselines Update baseline images"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Check if development dependencies are installed
if [ ! -d "node_modules/@playwright/test" ]; then
    print_error "Playwright not found. Installing dependencies..."
    npm install
fi

# Install Playwright browsers if needed
if [ ! -d "node_modules/.playwright" ]; then
    print_warning "Installing Playwright browsers..."
    npx playwright install
fi

# Build the project if needed
if [ ! -d "dist" ] || [ "src" -nt "dist" ]; then
    print_status "Building project..."
    npm run build
fi

# Update baseline images if requested
if [ "$UPDATE_BASELINES" = true ]; then
    print_warning "Updating baseline screenshots..."
    
    # Remove existing baselines
    if [ -d "$BASELINE_DIR" ]; then
        rm -rf "$BASELINE_DIR"
        print_status "Removed existing baseline images"
    fi
    
    # Run tests to generate new baselines
    npx playwright test tests/visual.spec.ts --update-snapshots
    npx playwright test tests/component-isolation.spec.ts --update-snapshots
    
    print_status "Baseline images updated successfully!"
    
    # Show summary of generated images
    if [ -d "$BASELINE_DIR" ]; then
        IMAGE_COUNT=$(find "$BASELINE_DIR" -name "*.png" | wc -l)
        print_status "Generated $IMAGE_COUNT baseline images"
        
        echo ""
        echo "Baseline images created:"
        find "$BASELINE_DIR" -name "*.png" | sort | sed 's/^/  - /'
    fi
    
    exit 0
fi

# Check if baseline images exist
if [ ! -d "$BASELINE_DIR" ]; then
    print_warning "No baseline images found. Creating initial baselines..."
    npx playwright test tests/visual.spec.ts --update-snapshots
    npx playwright test tests/component-isolation.spec.ts --update-snapshots
    print_status "Initial baseline images created!"
    exit 0
fi

# Run visual regression tests
print_status "Running visual regression tests..."

# Create test results directory
mkdir -p test-results

# Run the tests
TEST_FAILED=false

echo ""
echo -e "${BLUE}Running Visual Regression Tests...${NC}"
if ! npx playwright test tests/visual.spec.ts; then
    TEST_FAILED=true
    print_error "Visual regression tests failed"
fi

echo ""
echo -e "${BLUE}Running Component Isolation Tests...${NC}"
if ! npx playwright test tests/component-isolation.spec.ts; then
    TEST_FAILED=true
    print_error "Component isolation tests failed"
fi

# Generate test report
echo ""
echo -e "${BLUE}Generating test report...${NC}"
npx playwright show-report --host 0.0.0.0

# Check for test failures
if [ "$TEST_FAILED" = true ]; then
    echo ""
    print_error "Some visual tests failed!"
    echo ""
    echo "To investigate failures:"
    echo "1. Check the test report: npx playwright show-report"
    echo "2. View failed test screenshots in test-results/"
    echo "3. Update baselines if changes are intentional: $0 --update-baselines"
    echo ""
    exit 1
else
    echo ""
    print_status "All visual tests passed! ✨"
    echo ""
    echo "Test artifacts:"
    echo "  - Baseline images: $BASELINE_DIR"
    echo "  - Test results: test-results/"
    echo "  - HTML report: playwright-report/"
fi
