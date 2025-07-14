// Custom filename sanitizer for Decap CMS
// This script will automatically replace spaces with hyphens in uploaded image filenames

(function() {
  'use strict';

  // Wait for CMS to be available
  function waitForCMS(callback) {
    if (typeof CMS !== 'undefined') {
      callback();
    } else {
      setTimeout(() => waitForCMS(callback), 100);
    }
  }

  // Sanitize filename function
  function sanitizeFilename(filename) {
    console.log('Original filename:', filename);
    
    const parts = filename.split('.');
    const extension = parts.pop();
    const name = parts.join('.');
    
    const sanitizedName = name
      .trim()
      .replace(/\s+/g, '-')  // Replace spaces with hyphens
      .replace(/[^\w\-가-힣]/g, '')  // Keep only word characters, hyphens, and Korean characters
      .replace(/-+/g, '-')  // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '')  // Remove leading/trailing hyphens
      .toLowerCase();
    
    const result = sanitizedName + '.' + extension.toLowerCase();
    console.log('Sanitized filename:', result);
    return result;
  }

  // Override File constructor to sanitize names
  const OriginalFile = window.File;
  
  function SanitizedFile(fileBits, fileName, options) {
    const sanitizedFileName = sanitizeFilename(fileName);
    return new OriginalFile(fileBits, sanitizedFileName, options);
  }

  // Copy File properties and methods
  Object.setPrototypeOf(SanitizedFile.prototype, OriginalFile.prototype);
  Object.setPrototypeOf(SanitizedFile, OriginalFile);

  waitForCMS(() => {
    console.log('Initializing filename sanitizer for Decap CMS...');

    // Register event listener for media uploads
    CMS.registerEventListener({
      name: 'prePublish',
      handler: ({ entry, collection }) => {
        console.log('Pre-publish: Processing entry for media filename sanitization');
        
        // Function to recursively process values
        function processValues(obj) {
          if (typeof obj === 'string') {
            // Check if it's a media URL that needs sanitization
            if (obj.includes('/img/') && (obj.includes(' ') || /[^\w\-가-힣./]/.test(obj))) {
              const urlParts = obj.split('/');
              const filename = urlParts[urlParts.length - 1];
              const sanitizedFilename = sanitizeFilename(filename);
              
              if (filename !== sanitizedFilename) {
                urlParts[urlParts.length - 1] = sanitizedFilename;
                const newUrl = urlParts.join('/');
                console.log(`Updated media URL: ${obj} -> ${newUrl}`);
                return newUrl;
              }
            }
            return obj;
          } else if (Array.isArray(obj)) {
            return obj.map(processValues);
          } else if (obj && typeof obj === 'object') {
            const processed = {};
            for (const [key, value] of Object.entries(obj)) {
              processed[key] = processValues(value);
            }
            return processed;
          }
          return obj;
        }

        // Process the entry data
        entry.data = processValues(entry.data);
        return entry;
      }
    });

    // Try to intercept file uploads at the browser level
    const originalFormData = window.FormData;
    window.FormData = function() {
      const formData = new originalFormData();
      const originalAppend = formData.append.bind(formData);
      
      formData.append = function(name, value, filename) {
        if (value instanceof File && filename) {
          // If a filename is provided, sanitize it
          const sanitizedFilename = sanitizeFilename(filename);
          return originalAppend(name, value, sanitizedFilename);
        } else if (value instanceof File) {
          // If it's a file but no explicit filename, sanitize the file's name
          const sanitizedFile = new OriginalFile([value], sanitizeFilename(value.name), {
            type: value.type,
            lastModified: value.lastModified
          });
          return originalAppend(name, sanitizedFile);
        }
        return originalAppend(name, value, filename);
      };
      
      return formData;
    };

    // Override input file change events
    document.addEventListener('change', function(event) {
      if (event.target.type === 'file' && event.target.files) {
        const files = Array.from(event.target.files);
        const sanitizedFiles = files.map(file => {
          const sanitizedName = sanitizeFilename(file.name);
          if (sanitizedName !== file.name) {
            console.log(`File upload: ${file.name} -> ${sanitizedName}`);
            return new OriginalFile([file], sanitizedName, {
              type: file.type,
              lastModified: file.lastModified
            });
          }
          return file;
        });

        // Replace the files in the input
        try {
          const dt = new DataTransfer();
          sanitizedFiles.forEach(file => dt.items.add(file));
          event.target.files = dt.files;
        } catch (e) {
          console.warn('Could not override file input files:', e);
        }
      }
    }, true);

    console.log('Filename sanitizer initialized successfully');
  });
})();