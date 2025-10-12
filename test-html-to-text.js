#!/usr/bin/env node

/**
 * Test script for HTML to plain text conversion with newlines
 * This script tests the conversion logic that will be used in the social media module
 */

function htmlToPlainTextWithNewlines(html) {
  if (!html) return '';

  let text = html;

  // Step 1: Replace block-level closing tags with newlines
  text = text.replace(/<\/p>/gi, '\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/tr>/gi, '\n');
  text = text.replace(/<\/td>/gi, '\t');
  text = text.replace(/<\/th>/gi, '\t');
  text = text.replace(/<\/blockquote>/gi, '\n');

  // Step 2: Replace self-closing and inline break tags
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<hr\s*\/?>/gi, '\n---\n');

  // Step 3: Remove all remaining HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Step 4: Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&#x27;/g, "'");
  text = text.replace(/&apos;/g, "'");

  // Step 5: Clean up whitespace
  text = text.split('\n').map(line => line.trim()).join('\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}

// Test cases
const testCases = [
  {
    name: 'Simple paragraph with Enter key',
    html: '<p>Line 1</p><p>Line 2</p><p>Line 3</p>',
    expected: 'Line 1\nLine 2\nLine 3'
  },
  {
    name: 'Paragraph with BR tag',
    html: '<p>Line 1<br>Line 2</p>',
    expected: 'Line 1\nLine 2'
  },
  {
    name: 'TipTap default output',
    html: '<p>First line</p><p>Second line</p>',
    expected: 'First line\nSecond line'
  },
  {
    name: 'Multiple paragraphs with spacing',
    html: '<p>Paragraph 1</p><p></p><p>Paragraph 2</p>',
    expected: 'Paragraph 1\n\nParagraph 2'
  },
  {
    name: 'With bold text',
    html: '<p><strong>Bold line</strong></p><p>Normal line</p>',
    expected: 'Bold line\nNormal line'
  },
  {
    name: 'With HTML entities',
    html: '<p>Line 1 &amp; special &lt;chars&gt;</p><p>Line 2</p>',
    expected: 'Line 1 & special <chars>\nLine 2'
  }
];

console.log('='.repeat(80));
console.log('HTML to Plain Text Conversion Test');
console.log('='.repeat(80));
console.log('');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log('-'.repeat(80));
  console.log('Input HTML:', testCase.html);

  const result = htmlToPlainTextWithNewlines(testCase.html);

  console.log('Expected  :', JSON.stringify(testCase.expected));
  console.log('Got       :', JSON.stringify(result));

  const isPass = result === testCase.expected;
  if (isPass) {
    console.log('✅ PASS');
    passed++;
  } else {
    console.log('❌ FAIL');
    failed++;
  }
  console.log('');
});

console.log('='.repeat(80));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(80));

// Exit with error code if any tests failed
process.exit(failed > 0 ? 1 : 0);
