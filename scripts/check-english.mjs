// Fails when a tracked file contains Japanese text (hiragana, katakana, CJK ideographs, full-width forms).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const JAPANESE = /[\u3000-\u30FF\u3400-\u9FFF\uFF00-\uFFEF]/u;

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter((file) => file !== '');

const violations = [];
for (const file of files) {
  const buffer = readFileSync(file);
  if (buffer.includes(0)) continue; // binary
  buffer
    .toString('utf8')
    .split('\n')
    .forEach((line, index) => {
      if (JAPANESE.test(line)) violations.push(`${file}:${index + 1}: ${line.trim()}`);
    });
}

if (violations.length > 0) {
  console.error(`Japanese text found (${violations.length} lines):`);
  console.error(violations.join('\n'));
  process.exit(1);
}
console.log(`OK: no Japanese text in ${files.length} tracked files`);
