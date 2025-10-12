# Social Media Module - Newline Fix Summary

## Problem
When users pressed Enter in the Rich Text Editor (RTE) to create line breaks, the backend was receiving the content without proper `\n` newline characters.

## Root Causes Identified

1. **HTML Output**: The TipTap RTE outputs HTML (e.g., `<p>Line 1</p><p>Line 2</p>`)
2. **Improper Conversion**: Previous HTML-to-text conversion was not properly converting HTML tags to `\n`
3. **`.trim()` Issue**: Standard JavaScript `.trim()` removes ALL whitespace including newlines

## Solutions Implemented

### 1. Enhanced HTML-to-Text Conversion Function
**File**: `components/social/social-media-module.tsx`

Created `htmlToPlainTextWithNewlines()` that:
- Converts `</p>`, `</div>`, `</h1-6>`, `</li>`, etc. → `\n`
- Converts `<br>` tags → `\n`
- Removes all remaining HTML tags
- Decodes HTML entities (`&nbsp;`, `&amp;`, etc.)
- Cleans up excessive newlines (max 2 consecutive)
- Preserves all `\n` characters throughout

### 2. Custom Trim Function
**File**: `components/social/social-media-module.tsx`

Created `trimPreserveNewlines()` that:
- Only removes leading/trailing spaces and tabs
- **Preserves all `\n` newline characters**
- Used in `handleCreate()` instead of `.trim()`

### 3. Debugging Console Logs Added
For troubleshooting, console logs were added to:
- `htmlToPlainTextWithNewlines()` - Shows HTML input and text output
- `handleChange()` - Shows when RTE content changes
- `handleCreate()` - Shows final payload content
- `buildSocialPostRequestBody()` in `lib/xano/api.ts` - Shows what's sent to backend

## Test Script
**File**: `test-html-to-text.js`

Created a standalone test script to verify conversion logic:
- Tests 6 different scenarios
- All tests passing ✅
- Can be run with: `node test-html-to-text.js`

## How It Works Now

### User Flow:
1. User types in RTE: "Line 1" → presses Enter → "Line 2"
2. TipTap generates: `<p>Line 1</p><p>Line 2</p>`
3. `onChange` triggered → calls `handleChange('rich_content_html', html)`
4. `htmlToPlainTextWithNewlines()` converts to: `"Line 1\nLine 2"`
5. Sets `formState.content` and `formState.rich_content_text`
6. On submit, `trimPreserveNewlines()` cleans without removing `\n`
7. Backend receives: `"Line 1\nLine 2"` ✅

### Data Flow Diagram:
```
RTE Input
    ↓
TipTap HTML (<p>Text</p>)
    ↓
htmlToPlainTextWithNewlines()
    ↓
Plain Text with \n
    ↓
trimPreserveNewlines()
    ↓
Backend API (post_content: "Line 1\nLine 2")
```

## Files Modified

1. **components/social/social-media-module.tsx**
   - Added `htmlToPlainTextWithNewlines()`
   - Added `trimPreserveNewlines()`
   - Updated `handleCreate()` to use new trim function
   - Added debug logging

2. **lib/xano/api.ts**
   - Added debug logging to `buildSocialPostRequestBody()`

3. **test-html-to-text.js** (NEW)
   - Standalone test script for conversion logic

## Testing

### Manual Testing Steps:
1. Open social media module
2. Click "Add Post"
3. Choose "Post Now" or "Schedule Post"
4. In the RTE, type:
   ```
   Line 1
   Line 2
   Line 3
   ```
5. Open browser console (F12)
6. Click "Create"
7. Check console logs for:
   - `HTML->Text conversion:` shows the conversion
   - `Creating post with payload:` shows `"Line 1\nLine 2\nLine 3"`
   - `buildSocialPostRequestBody` shows final payload with `\n`

### Expected Console Output:
```javascript
HTML->Text conversion:
Input HTML: <p>Line 1</p><p>Line 2</p><p>Line 3</p>
Output text (JSON): "Line 1\nLine 2\nLine 3"

Creating post with payload:
content: "Line 1\nLine 2\nLine 3"

buildSocialPostRequestBody - Final payload:
post_content: "Line 1\nLine 2\nLine 3"
```

## Next Steps (Optional)

### To Remove Debug Logging:
Once confirmed working, remove console.log statements from:
1. `htmlToPlainTextWithNewlines()` (lines 410-413)
2. `handleChange()` (lines 420-422)
3. `handleCreate()` (lines 518-520)
4. `buildSocialPostRequestBody()` (lines 490-492)

### To Keep Test Script:
The `test-html-to-text.js` can be kept for regression testing or moved to a tests directory.

## Verification Checklist

- [x] TypeScript compiles without errors
- [x] Build succeeds
- [x] Test script passes all 6 tests
- [ ] Manual browser test confirms `\n` in console logs
- [ ] Backend confirms receiving proper newlines
- [ ] Social media posts display with proper line breaks

## Technical Notes

### Why JSON.stringify Preserves Newlines:
```javascript
const text = "Line 1\nLine 2";
JSON.stringify(text); // Returns: "Line 1\nLine 2"
// The \n is preserved in the JSON string
```

### Regex Explanation:
```javascript
// trimPreserveNewlines regex:
/^[ \t]+|[ \t]+$/gm
// ^ = start of line
// [ \t]+ = one or more spaces or tabs
// | = OR
// [ \t]+$ = spaces/tabs at end of line
// g = global (all occurrences)
// m = multiline (^ and $ match line boundaries)
```

## Support

If newlines are still not working:
1. Check browser console for the debug logs
2. Verify the JSON output shows `\n` characters
3. Check network tab to see what's actually sent to backend
4. Verify backend is not stripping newlines on receipt
