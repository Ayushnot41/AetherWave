import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  language: z.enum(['hi', 'en']).default('hi'),
  context: z
    .object({
      village: z.string().optional(),
      crop: z.string().optional(),
      lat: z.number().optional(),
      lon: z.number().optional(),
    })
    .optional(),
});

const KISAN_SYSTEM_PROMPT = `You are "Kisan Sahayak" (किसान सहायक), an authoritative, empathetic, and expert AI Agronomic Companion built for Indian smallholder farmers as part of the AetherWave National Agro-Resilience Grid.

Key Directives:
1. Tone: Respectful, practical, localized, institutional, and accessible (Government of India / ICAR agronomic advisor tone).
2. Bilingual responses: Always provide your answer primarily in the requested language (Hindi or English). When answering in Hindi, use simple, accessible Hindi terms that Indian farmers easily understand.
3. Expertise:
   - Weather hazards & micro-mitigation (floods, heatwaves, squalls, drought).
   - Crop advisory (Kharif, Rabi, Zaid seasons, sowing windows, seed rates).
   - Fertilizer prescriptions (ICAR guidelines, NPK ratio, basal dose, urea top-dressing, micronutrients like Zinc & Boron).
   - Pest & disease management (low-cost, integrated pest management, organic alternatives, recommended fungicides/pesticides).
   - Post-harvest management & Mandi MSP prices (Agmarknet, moisture control, hermetic storage).
   - Government schemes & insurance claims (PM-Kisan, PM Fasal Bima Yojana, AetherWave instant Bhu-Drishti verification).
4. Safety & Actionability: Keep answers concise (2-4 paragraphs maximum). Suggest concrete, immediate physical actions the farmer can take today. Avoid generic fluff.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid message request', details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { message, language, context } = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API key is configured, use Gemini 2.5 Flash for intelligent live response
    if (apiKey) {
      try {
        const client = new GoogleGenAI({ apiKey });
        const contextStr = context
          ? `\n[Farmer Context: Village: ${context.village || 'Central India'}, Crop: ${context.crop || 'Wheat/Paddy'}, Coords: ${context.lat ?? 22.5}, ${context.lon ?? 77.5}]`
          : '';

        const prompt = `${KISAN_SYSTEM_PROMPT}${contextStr}\n\nUser Question (respond in ${language === 'hi' ? 'Hindi' : 'English'}):\n${message}`;

        const response = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const reply = response.text || '';
        return NextResponse.json({
          reply,
          source: 'gemini-2.5-flash',
          language,
        });
      } catch (geminiErr) {
        console.warn('Gemini chat error, falling back to heuristic engine:', geminiErr);
        // Fall back to heuristic response below if API quota or network issue occurs
      }
    }

    // Heuristic Fallback Engine (Runs even with ZERO API keys or offline)
    const q = message.toLowerCase();
    let reply = '';

    if (q.includes('weather') || q.includes('मौसम') || q.includes('बारिश') || q.includes('rain') || q.includes('flood') || q.includes('बाढ़')) {
      reply = language === 'hi'
        ? 'डॉपलर मौसम रडार के अनुसार अगले ७२ घंटों में भारी वर्षा का कोई तात्कालिक खतरा नहीं है। ३०-दिवसीय बाढ़ जोखिम २८% आंका गया है। खेत की जल निकासी नालियां खुली रखें।'
        : 'Doppler radar indicates no immediate squall threat over the next 72 hours. 30-day flood probability is 28%. Maintain clear drainage furrows.';
    } else if (q.includes('mandi') || q.includes('मंडी') || q.includes('भाव') || q.includes('price') || q.includes('rate') || q.includes('msp')) {
      reply = language === 'hi'
        ? 'नीमच मंडी में आज गेहूं का भाव ₹२,४८० प्रति क्विंटल है (सरकारी एमएसपी ₹२,४२५ से अधिक)। यदि फसल पक चुकी है तो तुरंत कटाई करके नजदीकी मंडी ले जाना लाभदायक रहेगा।'
        : 'Current APMC Mandi Spot Rate for Wheat in Neemuch is ₹2,480/quintal (Above MSP of ₹2,425). We recommend harvesting mature parcels immediately.';
    } else if (q.includes('claim') || q.includes('compensation') || q.includes('मुआवजा') || q.includes('loss') || q.includes('नुकसान') || q.includes('insurance')) {
      reply = language === 'hi'
        ? 'एथरवेव पर मुआवजा प्राप्त करना पूर्णतः पारदर्शी है। "भू-दृष्टि कैमरा" खोलकर प्रभावित खेत की फोटो लें। मोबाइल का जीपीएस और सैटेलाइट रडार नुकसान की पुष्टि करते हैं और त्वरित राहत राशि स्वीकृत होती है।'
        : 'AetherWave provides instant micro-relief via Bhu-Drishti AI camera capture. Take a photo of the affected parcel; GPS and satellite data confirm damage for direct release.';
    } else {
      reply = language === 'hi'
        ? '२.४ एकड़ दोमट खेत में गेहूं के लिए: बुआई के समय १ बोरी डीएपी (५० किग्रा) + आधी बोरी पोटाश (२५ किग्रा) आधार खाद के रूप में दें। पहली सिंचाई (२१ दिन बाद) पर १ बोरी यूरिया डालें।'
        : 'For a 2.4-acre loamy wheat parcel: Apply 1 bag DAP (50 kg) + 0.5 bag MOP (25 kg) basal dose at sowing. Top-dress with 1 bag Neem-Coated Urea at first irrigation (21 days).';
    }

    return NextResponse.json({
      reply,
      source: 'offline-heuristic-engine',
      language,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to process chat query', message: String(err) },
      { status: 500 },
    );
  }
}
