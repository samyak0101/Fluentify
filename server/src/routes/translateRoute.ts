
import 'dotenv/config';
import express from 'express';
import * as deepl from 'deepl-node';


const router = express.Router();
const authKey = process.env.DEEPL_API_KEY ?? '';
const translator = new deepl.Translator(authKey);

/* 
This API endpoint is used to translate text from one language to another.
Request
POST http://localhost:8080/translate
Content-Type: application/json

Body: 
{
    "words": ["", ""],
    "source_lang": "en-US",
    "target_lang": "ja" 
}
types of target_lang mapping:
    "ja" -> Japanese
    "zh" -> Chinese
    "de" -> German
    "fr" -> French
    "es" -> Spanish
    "ko" -> Korean
    "en-US" -> English (American)
*/
router.post('/', async (req, res) => {
    const { words, source_lang, target_lang } = req.body;
    console.log('Request Body:', req.body);
    if (!words || !target_lang || !source_lang) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const result = await translator.translateText(words, source_lang, target_lang);
        const translatedText = result;
        console.log('DeepL API Response:', result);
        res.status(200).json({ translation: translatedText });
    } catch (error: any) {
        console.error('DeepL API Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;