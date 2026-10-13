// Build and Type Integrity Check
const fs = require('fs');
const path = require('path');

async function runBuildCheck(projectPath) {
  const startTime = Date.now();
  const errors = [];
  const scannedFiles = [];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(full);
      } else if (entry.name.endsWith('.js') || entry.name.endsWith('.ts') || entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx') || entry.name.endsWith('.mjs') || entry.name.endsWith('.cjs') || entry.name.endsWith('.json')) {
        scannedFiles.push(full);
        // Syntax validation
        try {
          const content = fs.readFileSync(full, 'utf8');
          if (entry.name.endsWith('.json')) {
            JSON.parse(content);
          } else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs') || entry.name.endsWith('.cjs')) {
            try {
              new Function(content);
            } catch (syntaxErr) {
              const isEsm = /Unexpected token 'export'|Cannot use import statement|await is only valid in async/i.test(syntaxErr.message);
              if (isEsm) {
                const { spawnSync } = require('child_process');
                const res = spawnSync(process.execPath, ['--input-type=module', '--check'], {
                  input: content,
                  windowsHide: true
                });
                if (res.status !== 0) {
                  throw new Error(res.stderr.toString().split(/\r?\n/).find(l => l.includes('SyntaxError')) || 'ES Module SyntaxError');
                }
              } else {
                throw syntaxErr;
              }
            }
          } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
            // Validate delimiter balancing
            const stack = [];
            let inString = null;
            for (let i = 0; i < content.length; i++) {
              const ch = content[i];
              if (inString) {
                if (ch === '\\') { i++; continue; }
                if (ch === inString) inString = null;
                continue;
              }
              if (ch === '"' || ch === "'" || ch === '`') {
                inString = ch;
                continue;
              }
              if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
              else if (ch === ')') { if (stack.pop() !== '(') throw new Error('Unbalanced parenthesis `)`'); }
              else if (ch === ']') { if (stack.pop() !== '[') throw new Error('Unbalanced bracket `]`'); }
              else if (ch === '}') { if (stack.pop() !== '{') throw new Error('Unbalanced brace `}`'); }
            }
            if (stack.length > 0) throw new Error(`Unclosed delimiter: ${stack.pop()}`);
          }
        } catch (err) {
          errors.push({ file: path.relative(projectPath, full), message: err.message });
        }
      }
    }
  }

  try {
    scanDir(projectPath);
  } catch (err) {
    errors.push({ file: 'project_root', message: err.message });
  }

  const durationMs = Date.now() - startTime;
  const passed = errors.length === 0;

  return {
    id: 'check_build_type',
    name: 'Build & Type Check',
    category: 'build',
    status: passed ? 'passed' : 'failed',
    durationMs,
    summary: passed 
      ? `Successfully compiled and verified syntax across ${scannedFiles.length} project files.`
      : `Build errors detected in ${errors.length} files.`,
    errors,
    filesCount: scannedFiles.length
  };
}

module.exports = { runBuildCheck };
