/*


ÖVNING:

Implementera följande:
En text-to-speech modell med transformers.js
https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX

En speech-to-text modell ex. openai/whisper-large-v3
https://huggingface.co/openai/whisper-large-v3

En chatbot modell ex. mistralai/Mistral-7B-Instruct-v0.3
https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3


GLÖM INTE ATT LÄGGA TILL EN ACCESS TOKEN I EN .ENV 


*/

import { InferenceClient } from "@huggingface/inference";
import { KokoroTTS } from "kokoro-js";

const client = new InferenceClient(import.meta.env.VITE_HF_TOKEN);
const recordButton = document.getElementById("recordButton");
const loadTTSButton = document.getElementById("loadTTSButton");
const statusDiv = document.getElementById("status");

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let ttsModel = null;



async function transcribeAudio(audioBlob) {
	/*
     Här ska ni anropa whisper eller liknande för att transcribera ljudet (audioBlob).
    */
}

// Load TTS model
async function loadTTSModel() {
	try {
		loadTTSButton.disabled = true;
		statusDiv.textContent = "Loading Text to Speech model...";

		/*
        Här ska ni ladda text-to-speech modellen (Kokoro-82M-v1.0-ONNX) och spara den i variabeln ttsModel.
        Denna variable anropar vi i ett senare skede för att generera en ljudfil (se funktionen processAudio).
        */

		statusDiv.textContent = "Text to Speech model loaded successfully!";
		recordButton.style.display = "inline-block";
		loadTTSButton.style.display = "none";
	} catch (error) {
		console.error("Error loading TTS model:", error);
		statusDiv.textContent =
			"Error loading Text to Speech model. Please try again.";
		loadTTSButton.disabled = false;
	}
}

// Process the recorded audio
async function processAudio(audioBlob) {
	try {
		statusDiv.textContent = "Transcribing audio...";

		// Convert audio to base64
		const reader = new FileReader();
		reader.readAsDataURL(audioBlob);

		reader.onloadend = async () => {
			statusDiv.textContent = "Processing response...";
			// Send to Whisper model for transcription
			const transcription = await transcribeAudio(audioBlob);
			statusDiv.textContent =
				"Transcription complete: " + transcription + ", generating response...";

			// Här ska ni implementera en chatCompletions modell med valfri modell från huggingface.
			// Denna modell ska användas för att generera en respons till användaren baserat på det ljud som har transcriberats.

			statusDiv.textContent = "Generating speech for text: " + response;

			// Generera ljudet (audioBlob) med hjälp av ttsModel.
			//const audio = ???

			statusDiv.textContent = "Audio generated, playing...";

			// Convert the audio to a playable format and play it
			const generatedAudioBlob = await audio.toBlob();
			const audioUrl = URL.createObjectURL(generatedAudioBlob);
			const audioElement = new Audio(audioUrl);

			audioElement.onended = () => {
				URL.revokeObjectURL(audioUrl);
				recordButton.disabled = false;
				statusDiv.textContent = "Ready to record again";
			};

			audioElement.play();
		};
	} catch (error) {
		console.error("Error processing audio:", error);
		statusDiv.textContent = "Error processing audio. Please try again.";
		recordButton.disabled = false;
	}
}


/*

ÖVRIG KOD FÖR GRÄNSSNITT ETC

*/

// Initialize audio recording
async function setupAudioRecording() {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		mediaRecorder = new MediaRecorder(stream);

		mediaRecorder.ondataavailable = (event) => {
			audioChunks.push(event.data);
		};

		mediaRecorder.onstop = async () => {
			const audioBlob = new Blob(audioChunks, { type: "audio/flac" });
			audioChunks = [];
			await processAudio(audioBlob);
		};
	} catch (error) {
		console.error("Error accessing microphone:", error);
		statusDiv.textContent =
			"Error accessing microphone. Please ensure you have granted microphone permissions.";
	}
}

// Handle button clicks
loadTTSButton.addEventListener("click", loadTTSModel);

recordButton.addEventListener("click", () => {
	if (!isRecording) {
		// Start recording
		audioChunks = [];
		mediaRecorder.start();
		isRecording = true;
		recordButton.textContent = "Stop Recording";
		recordButton.style.backgroundColor = "#ff4444";
		statusDiv.textContent = "Recording...";
	} else {
		// Stop recording
		mediaRecorder.stop();
		isRecording = false;
		recordButton.textContent = "Press to Record";
		recordButton.style.backgroundColor = "#4CAF50";
		recordButton.disabled = true;
	}
});

// Initialize the application
setupAudioRecording();
