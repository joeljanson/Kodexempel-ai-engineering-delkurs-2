import './style.css'
import { imageTransform } from './image-style-transfer.js'
import { generateImage } from './text-to-image.js'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <header>
      <h1>Style Transfer Web Application</h1>
    </header>
    
    <section class="description">
      <p>This application allows you to transfer an AI-generated style to your image. Upload a content image and provide a text prompt to guide the style generation and transfer process.</p>
    </section>
    
    <section class="input-section">
      <div class="form-group">
        <label for="prompt">Text Prompt for Style Generation:</label>
        <input type="text" id="prompt" placeholder="Enter a descriptive prompt for the style you want (e.g., 'Van Gogh starry night')">
      </div>
      
      <div class="image-uploads">
        <div class="upload-container">
          <label for="content-image">Content Image:</label>
          <input type="file" id="content-image" accept="image/*">
          <div class="preview" id="content-preview"></div>
        </div>
      </div>
      
      <button id="transfer-button" disabled>Generate Style & Transfer</button>
    </section>
    
    <section class="result-section" id="result-section">
      <!-- Results will appear here -->
    </section>
  </div>
`

// Handle file inputs and previews
const contentImageInput = document.querySelector('#content-image');
const promptInput = document.querySelector('#prompt');
const transferButton = document.querySelector('#transfer-button');

// Preview images when selected
contentImageInput.addEventListener('change', (event) => {
  previewImage(event.target, 'content-preview');
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
  const hasPrompt = promptInput.value.trim() !== '';
  
  transferButton.disabled = !(hasContentImage && hasPrompt);
}

// Handle the transfer button click
transferButton.addEventListener('click', async () => {
  try {
    // Show loading state
    const resultSection = document.getElementById('result-section');
    resultSection.innerHTML = `
      <div class="processing-message">
        <h2>Processing...</h2>
        <p>Generating style image from prompt and applying style transfer. This may take a moment.</p>
        <div class="loader"></div>
      </div>
    `;
    
    // Disable the button during processing
    transferButton.disabled = true;
    
    // Get the content image and prompt
    const contentImage = contentImageInput.files[0];
    const prompt = promptInput.value;
    
    // Step 1: Generate the style image from the prompt
    const styleImageBlob = await generateImage(prompt);
    
    // Step 2: Convert the blob to a File object for the style transfer function
    const styleImageFile = new File([styleImageBlob], "generated-style.png", { type: "image/png" });
    
    // Step 3: Perform the style transfer
    const resultImageUrl = await imageTransform(contentImage, styleImageFile, prompt);
    
    // Step 4: Display the results
    displayResults(contentImage, styleImageBlob, resultImageUrl, prompt);
    
  } catch (error) {
    console.error('Error in style transfer process:', error);
    
    // Show error message
    const resultSection = document.getElementById('result-section');
    resultSection.innerHTML = `
      <div class="error-message">
        <h2>Error</h2>
        <p>Something went wrong during the style transfer process. Please try again.</p>
        <p class="error-details">${error.message}</p>
      </div>
    `;
  } finally {
    // Re-enable the button
    checkFormValidity();
  }
});

// Function to display the results
function displayResults(contentImage, styleImageBlob, resultImageUrl, prompt) {
  // Create URLs for the images
  const styleImageUrl = URL.createObjectURL(styleImageBlob);
  
  // Display the results
  const resultSection = document.getElementById('result-section');
  resultSection.innerHTML = `
    <div class="results-container">
      <h2>Style Transfer Results</h2>
      
      <div class="result-details">
        <p><strong>Prompt:</strong> ${prompt}</p>
      </div>
      
      <div class="result-images">
        <div class="result-image-container">
          <h3>Content Image</h3>
          <img src="${URL.createObjectURL(contentImage)}" alt="Content image" />
        </div>
        
        <div class="result-image-container">
          <h3>Generated Style</h3>
          <img src="${styleImageUrl}" alt="Generated style image" />
        </div>
        
        <div class="result-image-container">
          <h3>Result</h3>
          <img src="${resultImageUrl}" alt="Style transfer result" />
        </div>
      </div>
    </div>
  `;
}
