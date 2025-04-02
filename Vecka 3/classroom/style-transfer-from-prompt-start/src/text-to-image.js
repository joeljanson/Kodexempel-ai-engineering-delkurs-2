//Importera Huggingface Inference API från @huggingface/inference

// Skapa en client för att använda HF Inference API med ert Huggingface Token som ska läsas in från .env filen

export async function generateImage(prompt) {

    // Nedan behöver ni använda er av @huggingface/inference för att generera en bild från en prompt.
    // Gå till huggingface, klicka på "models" och gå till fliken "text to image"
    // Klicka på "Other" och klicka i HF Inference API
    // Hitta därefter en model ni vill använda, t.ex. "black-forest-labs/FLUX.1-dev"
    // Använd modeln för att generera en bild från prompten.
    // Returnera bilden som en blob (Det är oftast det vi får tillbaka från huggingface).
	const image = undefined;

	return image;
}
