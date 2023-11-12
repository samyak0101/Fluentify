import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import * as deepl from 'deepl-node';


const router = express.Router();
const authKey = process.env.DEEPL_API_KEY ?? '';
const translator = new deepl.Translator(authKey);

interface Phonetic {
    text: string;
    audio?: string;
}

interface Definition {
    partOfSpeech: string;
    definitions: {
        definition: string;
        example: string;
        synonyms: string[];
        antonyms: string[];
    }[];
}

interface DictionaryEntry {
    word: string;
    translated: string;
    language: string;
    meanings: any;
}

/*
This API endpoint is used to get the dictionary entry of a word.
Request
POST http://localhost:8080/dictionary
Content-Type: application/json

Body: 
{
    "word": "hello"
    "source_lang": "en",
    "target_lang": "ja"
}
*/

router.post('/', async (req, res) => {
    let { word, source_lang, target_lang } = req.body;



    if (!word || !target_lang) {
        return res.status(400).json({ error: 'Missing parameters in the request body' });
    }
    if (!source_lang) {
        source_lang = 'en-US';
    }

    try {
        const result = await translator.translateText(word, source_lang, target_lang);
        const translatedText = result;
        // Make a request to the Dictionary API
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

        // Extract relevant information from the API response
        const formattedResponse: DictionaryEntry = {
            word: response.data[0].word,
            translated: Array.isArray(translatedText) ? translatedText[0].text : translatedText.text,
            language: target_lang,
            meanings: {
                partOfSpeech: response.data[0].meanings[0].partOfSpeech,
                definitions: [
                    {
                        definition: response.data[0].meanings[0].definitions[0].definition,
                        synonyms: [],
                        antonyms: [],
                    },
                ],
            },
        };

        res.status(200).json(formattedResponse);
    } catch (error: any) {
        console.error('Error fetching data from Dictionary API:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;