# Minimal Notes Demo

Denna exempel app är tänkt som en övning för att implementera både att generera embeddings, skicka in dem i en databas och sedan söka i databasen.

För att komma igång behöver ni göra följande steg:

1. Utgå från env.example och lägg till era egna nycklar till
    - Supabase
    - HuggingFace
2. Öppna terminalen och kör npm install
3. Bekanta er sedan med koden - kör npm run dev för att se applikationen
4. De filer ni behöver implementera saker i är:
    - utils/generateEmbeddings.js
    - utils/supabaseUtils.js
    - utils/llm.js
    - Vidare instruktioner finns i respektive fil.

5. Det finns fem stycken fejkade inlägg i fakeJournal.md om ni behöver testdata.