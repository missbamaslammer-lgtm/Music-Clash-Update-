import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // Helper for lazy Gemini client
  function getGeminiClient(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenAI({ apiKey: key });
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // AI Arena Lyricist Generation API
  app.post('/api/generate-lyrics', async (req, res) => {
    try {
      const { topic, genre, mood, tempo, vocalType } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // High quality procedural fallbacks if key not configured
        const proceduralVerses = [
          `[Intro - ${genre?.toUpperCase() || 'TRAP'} / ${tempo || 130} BPM]\n(808 drops in, heavy snare roll)\nYeah, we stepping in the arena, no fear in the spotlight\n\n[Verse 1]\nStarted in the lab with an empty grid\nTurned the sub-bass up, that's what we did\nEvery kick hitting hard like a lightning crack\nGot the whole squad riding on the master track\nThey doubted the rhythm, but we flipped the script\nGot a 16-bar flow with the silver grip\n\n[Chorus - Vocal Hook]\nStacking up the Clash Dollars, crown on my head\nWe making history while they sleep in bed\nFrom the underground cipher to the global stage\nTurn the volume to the max, yeah we turn the page!`,
          `[Verse 1 - Melodic Cadence]\nNeon purple skies over midnight streets\nGot my pulse in sync with these heavy beats\nSilver frequency cutting through the haze\nGot a fire in my chest that'll burn for days\n\n[Hook]\nClash in the lab, beat on repeat\nHuman and the AI, we can't be beat\nLock in the harmony, master the sound\nWe the loudest champions in the town!`
        ];
        const selected = proceduralVerses[Math.floor(Math.random() * proceduralVerses.length)];
        return res.json({
          lyrics: selected,
          source: 'procedural_engine',
          suggestedCadence: '16th note triplets with punchy syncopated landing on beat 4',
          rhymeScheme: 'AABB + Internal Multi-Syllabic',
          moodColor: 'purple-glow'
        });
      }

      const prompt = `You are a legendary Grammy-winning music producer, rapper, and master songwriter in the "Clash Beat Lab" AI Arena.
Write an electrifying, rhythmic, radio-ready verse and hook for a song with the following details:
- Topic/Story: ${topic || 'Rising to the top in the music clash arena, breaking boundaries'}
- Genre: ${genre || 'Hip Hop / Trap / Synthwave'}
- Mood: ${mood || 'Confident, electric, hype, glowing neon'}
- Tempo: ${tempo || 130} BPM
- Vocal Style: ${vocalType || 'Melodic Rap with heavy vocal runs and punchlines'}

Structure:
Include [Intro], [Verse 1] (8-12 bars with high syllable rhythm and internal rhymes), and [Hook/Chorus] (catchy 4-bar anthem).
Make it feel authentic, modern, and inspiring for a human vocalist to record over!`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      return res.json({
        lyrics: response.text || 'Error generating lyrics',
        source: 'gemini_3.7_flash',
        suggestedCadence: 'Double-time flow into half-time anthemic vocal hook',
        rhymeScheme: 'Multi-syllable slant rhyme with punchy cadence',
        moodColor: 'purple-glow'
      });
    } catch (error: any) {
      console.error('Gemini lyrics generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate lyrics' });
    }
  });

  // AI Crew Chat Message API
  app.post('/api/crew-ai-message', async (req, res) => {
    try {
      const { crewName, memberRole, memberName, userMessage, projectContext } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        const fallbacks = [
          `Yo that 808 on bar 8 is hitting crazy hard! Let's drop a 1/32 snare roll right before the chorus.`,
          `That vocal take sounds crisp! I just mastered it with the tape saturation rack — check the warmth.`,
          `I just laid down some silver arpeggios on the key of F minor. It pairs insane with your lyrics!`,
          `Bet! Let's lock this track down and enter it in tonight's 8-Track Championship Cup!`
        ];
        return res.json({
          reply: fallbacks[Math.floor(Math.random() * fallbacks.length)],
          author: memberName || 'DJ Nexus (Crew Producer)',
          role: memberRole || 'Lead Producer'
        });
      }

      const prompt = `You are ${memberName}, a passionate and skilled ${memberRole} in the music crew "${crewName}".
The user (producer/artist) just messaged the crew: "${userMessage}".
Current project context: ${projectContext || 'Working on a new banger in Clash Beat Lab'}.
Respond in 1-2 punchy, supportive, authentic studio producer/lyricist sentences. Use real audio/music producer slang (808s, stems, mix, bars, flow, master, hook).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      return res.json({
        reply: response.text?.trim() || 'Let\'s get this beat mastered and drop it in the Arena!',
        author: memberName,
        role: memberRole
      });
    } catch (error: any) {
      console.error('Crew AI message error:', error);
      res.json({
        reply: 'That beat is pure fire! Let\'s bounce the stems and get the master ready.',
        author: 'Crew Bot',
        role: 'Assistant'
      });
    }
  });

  // Vite Middleware in Development / Static Files in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clash Beat Lab Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
