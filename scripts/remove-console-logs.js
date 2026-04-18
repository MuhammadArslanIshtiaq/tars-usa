#!/usr/bin/env node
/**
 * Script to remove console.log statements for production builds
 * Usage: node scripts/remove-console-logs.js
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'src');

function removeConsoleLogsFromFile(filePath) {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove console.log statements (but keep console.error and console.warn)
    const originalContent = content;
    content = content.replace(/console\.log\([^;]*\);?\s*/g, '');
    content = content.replace(/console\.debug\([^;]*\);?\s*/g, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Removed console logs from: ${filePath}`);
      modified = true;
    }
    
    return modified;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

function processDirectory(dirPath) {
  let totalModified = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        totalModified += processDirectory(itemPath);
      } else if (stats.isFile()) {
        if (removeConsoleLogsFromFile(itemPath)) {
          totalModified++;
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error);
  }
  
  return totalModified;
}

console.log('🧹 Removing console.log statements for production...');
const modifiedFiles = processDirectory(sourceDir);
console.log(`✅ Processed and cleaned ${modifiedFiles} files.`);

if (modifiedFiles > 0) {
  console.log('⚠️  Remember to test your app after removing console logs!');
} else {
  console.log('✨ No console.log statements found to remove.');
}

