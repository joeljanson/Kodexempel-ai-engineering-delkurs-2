import './style.css'
import { imageTransform } from './image-style-transfer.js'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <header>
      <h1>Style Transfer Web Application</h1>
    </header>
    
    <section class="description">
      <p>This application allows you to transfer the style from one image to another using AI. Upload two images and provide a text prompt to guide the style transfer process.</p>
    </section>
    
    <section class="input-section">
      <div class="form-group">
        <label for="prompt">Text Prompt:</label>
        <input type="text" id="prompt" placeholder="Enter a descriptive prompt...">
      </div>
      
      <div class="image-uploads">
        <div class="upload-container">
          <label for="content-image">Content Image:</label>
          <input type="file" id="content-image" accept="image/*">
          <div class="preview" id="content-preview"></div>
        </div>
        
        <div class="upload-container">
          <label for="style-image">Style Image:</label>
          <input type="file" id="style-image" accept="image/*">
          <div class="preview" id="style-preview"></div>
        </div>
      </div>
      
      <button id="transfer-button" disabled>Transfer Style</button>
    </section>
    
    <section class="result-section" id="result-section">
      <!-- Results will appear here -->
    </section>
  </div>
`

// Handle file inputs and previews
const contentImageInput = document.querySelector('#content-image');
const styleImageInput = document.querySelector('#style-image');
const promptInput = document.querySelector('#prompt');
const transferButton = document.querySelector('#transfer-button');

// Preview images when selected
contentImageInput.addEventListener('change', (event) => {
  previewImage(event.target, 'content-preview');
  checkFormValidity();
});

styleImageInput.addEventListener('change', (event) => {
  previewImage(event.target, 'style-preview');
  checkFormValidity();
});

promptInput.addEventListener('input', checkFormValidity);

// Function to preview uploaded images
function previewImage(input, previewId) {
  const preview = document.getElementById(previewId);
  preview.innerHTML = '';
  
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      preview.appendChild(img);
    };
    
    reader.readAsDataURL(input.files[0]);
  }
}

// Check if all inputs are valid
function checkFormValidity() {
  const hasContentImage = contentImageInput.files && contentImageInput.files[0];
  const hasStyleImage = styleImageInput.files && styleImageInput.files[0];
  const hasPrompt = promptInput.value.trim() !== '';
  
  transferButton.disabled = !(hasContentImage && hasStyleImage && hasPrompt);
}

// Handle the transfer button click
transferButton.addEventListener('click', () => {
  // This function will be implemented later to connect to the Hugging Face Gradio client
  performStyleTransfer(
    contentImageInput.files[0],
    styleImageInput.files[0],
    promptInput.value
  );
});

// Placeholder function for style transfer (to be implemented later)
async function performStyleTransfer(contentImage, styleImage, prompt) {
  console.log('Style transfer requested with:');
  console.log('Content image:', contentImage);
  console.log('Style image:', styleImage);
  console.log('Prompt:', prompt);
  
  const fileUrl = await imageTransform(contentImage, styleImage, prompt);
  console.log('File URL:', fileUrl);

  const resultSection = document.getElementById('result-section');
  resultSection.innerHTML = `
    <div class="processing-message">
      <h2>Style Transfer Results</h2>
      <div class="result-details">
        <p>Content Image: ${contentImage.name}</p>
        <p>Style Image: ${styleImage.name}</p>
        <p>Prompt: ${prompt}</p>
      </div>
      <div class="result-image">
        <img src="${fileUrl}" alt="Style transfer result" />
      </div>
    </div>
  `;
}
