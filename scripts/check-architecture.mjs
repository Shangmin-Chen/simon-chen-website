import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const stylesDir = path.join(rootDir, 'src', 'styles');

// Allowed non-color keyword values for color-related CSS properties
const ALLOWED_KEYWORDS = [
  'transparent',
  'none',
  'inherit',
  'initial',
  'unset',
  'currentcolor',
  '0',
  '0px',
  'auto'
];

// Color-related CSS properties to check in interactive components (buttons, cards, forms)
const COLOR_PROPERTIES = [
  'color',
  'background',
  'background-color',
  'border',
  'border-color',
  'border-top',
  'border-top-color',
  'border-bottom',
  'border-bottom-color',
  'border-left',
  'border-left-color',
  'border-right',
  'border-right-color',
  'outline',
  'outline-color',
  'box-shadow'
];

// Target component files for interactive elements
const INTERACTIVE_COMPONENT_FILES = [
  'button.css',
  'card.css',
  'form.css'
];

/**
 * Recursively find all CSS files in a directory
 */
function getCssFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getCssFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.css')) {
      files.push(fullPath);
    }
  }
  return files;
}

function checkArchitecture() {
  const violations = [];
  const cssFiles = getCssFiles(stylesDir);

  if (cssFiles.length === 0) {
    console.error('❌ Error: No CSS files found in', stylesDir);
    process.exit(1);
  }

  let inComment = false;

  for (const filePath of cssFiles) {
    const relativePath = path.relative(rootDir, filePath);
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const rawLines = content.split('\n');

    inComment = false;

    for (let i = 0; i < rawLines.length; i++) {
      const originalLine = rawLines[i];
      const lineNumber = i + 1;

      // Comment stripping logic per line while maintaining multiline state
      let cleanLine = '';
      let idx = 0;
      while (idx < originalLine.length) {
        if (inComment) {
          const endComment = originalLine.indexOf('*/', idx);
          if (endComment !== -1) {
            inComment = false;
            idx = endComment + 2;
          } else {
            break;
          }
        } else {
          const startComment = originalLine.indexOf('/*', idx);
          if (startComment !== -1) {
            cleanLine += originalLine.substring(idx, startComment);
            inComment = true;
            idx = startComment + 2;
          } else {
            cleanLine += originalLine.substring(idx);
            break;
          }
        }
      }

      cleanLine = cleanLine.trim();
      if (!cleanLine) continue;

      const isVariablesFile = fileName === 'variables.css';
      const isPrimitiveDefinition = isVariablesFile && cleanLine.includes('--color-') && cleanLine.includes('-hsl:');
      const isVariablesTokenDef = isVariablesFile && cleanLine.startsWith('--');

      // Skip primitive definitions and token definitions in variables.css
      if (isPrimitiveDefinition || isVariablesTokenDef) {
        continue;
      }

      // 1. Check for hardcoded HEX colors (#fff, #ffffff, #12345678, etc.)
      const hexMatch = cleanLine.match(/#([0-9a-fA-F]{3,8})\b/);
      if (hexMatch) {
        violations.push({
          file: relativePath,
          line: lineNumber,
          type: 'HARDCODED_HEX',
          message: `Hardcoded HEX color "${hexMatch[0]}" found on line ${lineNumber}. Use 3-layer design tokens var(--*) instead.`
        });
      }

      // 2. Check for hardcoded RGB / RGBA colors (rgb(r, g, b), rgba(r, g, b, a))
      const rgbMatch = cleanLine.match(/\brgba?\([^)]+\)/i);
      if (rgbMatch) {
        violations.push({
          file: relativePath,
          line: lineNumber,
          type: 'HARDCODED_RGB',
          message: `Hardcoded RGB/RGBA color "${rgbMatch[0]}" found on line ${lineNumber}. Use 3-layer design tokens var(--*) instead.`
        });
      }

      // 3. Verify interactive buttons, cards, and forms conform to tokenized custom properties
      const isInteractiveComponent = INTERACTIVE_COMPONENT_FILES.includes(fileName);
      if (isInteractiveComponent && cleanLine.includes(':')) {
        const declarations = cleanLine.split(';').map(d => d.trim()).filter(Boolean);
        for (const decl of declarations) {
          if (!decl.includes(':')) continue;
          const colonIdx = decl.indexOf(':');
          const prop = decl.substring(0, colonIdx).trim().toLowerCase();
          const val = decl.substring(colonIdx + 1).trim().toLowerCase();

          if (COLOR_PROPERTIES.includes(prop)) {
            const usesToken = val.includes('var(--');
            const isAllowedKeyword = ALLOWED_KEYWORDS.some(k => val === k || val.startsWith(k + ' ') || val.endsWith(' ' + k));

            if (!usesToken && !isAllowedKeyword) {
              violations.push({
                file: relativePath,
                line: lineNumber,
                type: 'NON_TOKENIZED_PROPERTY',
                message: `Interactive component property "${prop}: ${val}" does not use tokenized custom property var(--*).`
              });
            }
          }
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error('\n❌ Architecture Check Failed! Token violations found:\n');
    violations.forEach(v => {
      console.error(`  [${v.type}] ${v.file}:${v.line} -> ${v.message}`);
    });
    console.error(`\nTotal violations: ${violations.length}\n`);
    process.exit(1);
  } else {
    console.log('✅ Architecture Check Passed! All CSS files conform to 3-layer design tokens.');
    process.exit(0);
  }
}

checkArchitecture();
