# Quasar App (reader)

A Quasar Project

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```


### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).


# 📚 Language Learning Reader - Detailed Description

## What is it?

This is a mobile web reader specifically designed for learning foreign languages. The application allows you to read books in English with various translation options, helping language learners better understand text and expand their vocabulary.

## Why is it needed?

When learning a foreign language, reading original texts is one of the best ways to improve skills. But difficulties often arise:

- 🔍 **Unknown words** - constant need to look up in dictionary
- 📖 **Complex sentences** - hard to understand overall meaning
- 🔄 **Context switching** - getting distracted from reading when searching for translations
- 📱 **Inconvenience** - need to juggle between book and translator

This reader solves all these problems by providing multiple ways to get translations right while reading.

## Main Features

### 📁 Book Loading and Management

- **Format support**: FB2 and TXT files
- **Local storage**: books are saved in browser
- **Smart pagination**: automatic text splitting into pages considering screen size
- **Caching**: fast loading of already processed pages
- **Progress saving**: remembers where you stopped

### 🎨 Reading Settings

- **Font size**: adjustable from 12px to 28px
- **Themes**:
  - 🌕 **Light** - classic white background
  - 🌑 **Dark** - for reading in darkness
  - 📜 **Sepia** - vintage style, easy on the eyes
- **Adaptivity**: automatic page recalculation when settings change

### 🔄 Navigation

- **Swipes**: page turning with left/right gestures
- **Buttons**: navigation using interface elements
- **Indicator**: shows current page and total count
- **Fullscreen mode**: for maximum reading immersion

## Translation System - Main Feature

The application offers **three different ways to get translations**, each with its own advantages:

### 1. 🔍 Individual Word Translation (Offline)

**How it works:**
- Every word in text becomes clickable
- Clicking on a word shows a popup notification with translation
- Uses built-in English-Russian dictionary

**Features:**
- ✅ Works without internet
- ✅ Instant response
- ✅ Doesn't distract from reading
- ❌ Only basic EN→RU translations
- ❌ Low quality for complex words
- ❌ Doesn't consider context

**Technical details:**
- Dictionary based on WordHunt data
- Support for word forms (plural, endings)
- Compact storage in JSON format

### 2. 🌐 Automatic Page Translation (Online)

**How it works:**
- Uses browser's built-in "Translate page" function
- Activated by button in bottom left corner
- Automatically translates entire page when turning pages

**Features:**
- ✅ High quality translation (Google Translate)
- ✅ Considers sentence context
- ✅ Translates automatically when changing pages
- ✅ Preserves text formatting
- ❌ Requires internet
- ❌ Need to manually enable "Translate page" in browser
- ❌ May modify original text

**Indicator states:**
- 🔴 **Red**: no internet (low-quality translation)
- 🟡 **Yellow**: internet available but "Translate page" not enabled
- 🟢 **Green**: online translation active

### 3. 📄 Line-by-line Translation in Dialog (Hybrid)

**How it works:**
- Opens fullscreen dialog from "translate" button in top right
- Shows original text and translation line by line
- Words in original text remain clickable
- Can turn pages directly in dialog

**Features:**
- ✅ Compare original and translation
- ✅ Combines both translation methods
- ✅ Convenient for deep study
- ✅ Can copy text
- ❌ Takes full screen
- ❌ Quality depends on internet

**Smart logic:**
- If internet available and "Translate page" enabled → uses browser translation
- If internet available but "Translate page" disabled → warns user
- If no internet → uses offline dictionary

## Technical Architecture

### Frontend
- **Vue 3** with Composition API
- **Quasar Framework** for UI components
- **TypeScript** for typing
- **SCSS** for styling

### Key Components

#### `ReaderPage.vue` - Main reading page
- Current page and navigation management
- Swipe and touch handling
- Integration of all translation methods
- Adaptive pagination

#### `OnlineTranslateDialog.vue` - Line-by-line translation dialog
- Text splitting into sentences
- Original and translation display
- Internet status indication
- Navigation between pages

#### `useTranslate.ts` - Translation system
```javascript
// Individual word translation
wordListTranslates(word: string): string[]

// Phrase translation
translatePhrase(text: string): string

// Wrapping words into clickable elements
wrapContentToWords(content: string): string
```

#### `useIsOnline.ts` - Online status detection
```javascript
// Internet status
isOnline: Ref<boolean>

// Is browser translation active
isBrowserTranslateActive: Ref<boolean>
```

### Data Storage
- **LocalStorage** for books and settings
- **Separate storage**: book metadata and content
- **Page caching** for fast loading
- **Position saving** for each book

### Performance
- **Smart pagination**: splitting only as needed
- **Virtualization**: loading only visible content
- **Caching**: saving processed pages
- **Lazy loading**: components loaded on demand

## Dictionary Algorithm

### Dictionary Preparation
1. **Source**: parsing dictionaries from WordHunt
2. **Transformation**: processing and cleaning translations
3. **Optimization**: compression and indexing
4. **Format**: JSON with word keys and translation arrays

### Translation Search
1. **Exact match**: search word in original form
2. **Form processing**: removing endings (-s, -es, -ies)
3. **Fallback**: return original word if translation not found
4. **Caching**: saving search results

## Adaptivity and UX

### Mobile Optimization
- **Touch-first approach**: all interactions through touches
- **Viewport adaptation**: proper work with on-screen keyboard
- **Swipe navigation**: intuitive page turning
- **Fullscreen mode**: maximum screen utilization

### Accessibility
- **Font scaling**: from 12px to 28px
- **Contrast themes**: light, dark, sepia
- **Semantic markup**: proper HTML structure
- **Keyboard navigation**: standard key support

### Performance
- **Progressive loading**: pages processed gradually
- **Progress indicators**: user sees process
- **Rendering optimization**: minimizing redraws
- **Smart caching**: balance between speed and memory


### Technical Improvements
- **PWA**: full mobile application
- **Offline-first**: work without internet
- **Import/export**: library sharing
- **Plugins**: extensible architecture

## Conclusion

This reader is not just a reading application, but a comprehensive tool for language learning. It solves real problems for English language learners by providing flexible ways to get translations without interrupting the reading process.

Thanks to thoughtful architecture and user experience, the application makes language learning through reading as comfortable and effective as possible.
