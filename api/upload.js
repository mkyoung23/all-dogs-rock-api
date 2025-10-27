// Vercel Edge Function for photo upload
// Stores uploads in-memory and returns public URLs

const uploads = new Map();

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Handle GET /upload - show HTML form
  if (req.method === 'GET' && pathname.endsWith('/upload')) {
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload Pet Photos - All Dogs Rock</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-top: 0;
    }
    input[type="file"] {
      margin: 20px 0;
      padding: 10px;
      border: 2px dashed #ccc;
      border-radius: 5px;
      width: 100%;
      cursor: pointer;
    }
    button {
      background: #0070f3;
      color: white;
      padding: 12px 30px;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover {
      background: #0051cc;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .urls {
      margin-top: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 5px;
      display: none;
    }
    .urls.show {
      display: block;
    }
    .url-item {
      margin: 10px 0;
      padding: 10px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 3px;
    }
    .copy-btn {
      background: #28a745;
      padding: 5px 10px;
      font-size: 14px;
      margin-left: 10px;
    }
    .copy-btn:hover {
      background: #218838;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🐕 Upload Your Pet Photos</h1>
    <p>Upload 1-3 photos of your pet to get started with custom images.</p>
    
    <form id="uploadForm">
      <input 
        type="file" 
        id="fileInput" 
        name="photos" 
        accept="image/*" 
        multiple 
        required
      />
      <button type="submit" id="uploadBtn">Upload Photos</button>
    </form>
    
    <div id="urls" class="urls">
      <h3>✅ Your Photo URLs (Copy these!):</h3>
      <div id="urlList"></div>
    </div>
  </div>

  <script>
    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const urlsDiv = document.getElementById('urls');
    const urlList = document.getElementById('urlList');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const files = fileInput.files;
      if (files.length === 0 || files.length > 3) {
        alert('Please select 1-3 photos');
        return;
      }

      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Uploading...';
      urlList.innerHTML = '';

      try {
        const urls = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();
          
          const base64 = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename: file.name,
              data: base64,
            }),
          });

          if (!response.ok) throw new Error('Upload failed');
          
          const result = await response.json();
          urls.push(result.url);
          
          const urlItem = document.createElement('div');
          urlItem.className = 'url-item';
          urlItem.innerHTML = `
            <strong>Photo ${i + 1}:</strong><br>
            <code>${result.url}</code>
            <button class="copy-btn" onclick="copyUrl('${result.url}')">Copy</button>
          `;
          urlList.appendChild(urlItem);
        }

        urlsDiv.classList.add('show');
        uploadBtn.textContent = 'Upload More Photos';
        uploadBtn.disabled = false;
        fileInput.value = '';
      } catch (error) {
        alert('Upload failed: ' + error.message);
        uploadBtn.textContent = 'Upload Photos';
        uploadBtn.disabled = false;
      }
    });

    function copyUrl(url) {
      navigator.clipboard.writeText(url).then(() => {
        alert('URL copied to clipboard!');
      });
    }
  </script>
</body>
</html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }

  // Handle POST /upload - process file upload
  if (req.method === 'POST' && pathname.endsWith('/upload')) {
    try {
      const body = await req.json();
      const { filename, data } = body;

      if (!filename || !data) {
        return new Response(
          JSON.stringify({ error: 'Missing filename or data' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Generate unique ID
      const id = Date.now() + '-' + Math.random().toString(36).substring(7);
      
      // Store in memory (with filename and base64 data)
      uploads.set(id, {
        filename,
        data,
        timestamp: Date.now(),
      });

      // Return public URL
      const publicUrl = `${url.origin}/api/uploads/${id}`;
      
      return new Response(
        JSON.stringify({ 
          success: true,
          url: publicUrl,
          id 
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Upload failed: ' + error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Handle GET /uploads/{id} - serve uploaded file
  if (req.method === 'GET' && pathname.includes('/uploads/')) {
    const id = pathname.split('/uploads/')[1];
    const upload = uploads.get(id);

    if (!upload) {
      return new Response('Not found', { status: 404 });
    }

    // Extract base64 data
    const base64Data = upload.data.split(',')[1];
    const mimeType = upload.data.split(':')[1].split(';')[0];
    
    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Response(bytes, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
