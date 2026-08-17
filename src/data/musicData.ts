import { Track, ClashMatchup, TriviaQuestion, BeatPad, UserBadge, PlayerStats } from '../types';

export const TRACK_CATALOG: Track[] = [
  {
    id: 'track-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    year: 2019,
    genre: 'Synthwave / Pop',
    coverGradient: 'from-amber-500 via-rose-600 to-purple-900',
    accentColor: '#f43f5e',
    bpm: 171,
    key: 'F Minor',
    stats: { vocals: 92, beatDrop: 88, lyrics: 84, hype: 96, catchiness: 99 },
    previewDescription: 'Iconic pulsating 80s analog synth arpeggio driving at 171 BPM with signature soaring falsetto chorus.',
    lyricsSnippet: "I've been on my own for long enough / Maybe you can show me how to love, maybe...",
    funFact: 'Spent an unprecedented 90 weeks on the Billboard Hot 100, becoming the #1 Billboard Hot 100 song of all time.',
    synthRiff: 'synthwave',
    tags: ['Synthwave', 'Billboard #1', 'Night Drive', '80s Retro']
  },
  {
    id: 'track-2',
    title: 'One More Time',
    artist: 'Daft Punk',
    year: 2000,
    genre: 'French House / Dance',
    coverGradient: 'from-blue-600 via-indigo-600 to-purple-800',
    accentColor: '#6366f1',
    bpm: 123,
    key: 'D Major',
    stats: { vocals: 86, beatDrop: 94, lyrics: 78, hype: 98, catchiness: 97 },
    previewDescription: 'Legendary filtered brass horn sample and pitch-shifted vocoder harmonies over an unstoppable four-on-the-floor kick.',
    lyricsSnippet: "One more time, we're gonna celebrate / Oh yeah, alright, don't stop the dancing!",
    funFact: "Romanthony's iconic vocoder vocals were famously uncredited on the original 2000 album tracklist.",
    synthRiff: 'edm',
    tags: ['French House', 'Vocoder', 'Festival Anthem', 'Timeless']
  },
  {
    id: 'track-3',
    title: 'Lose Yourself',
    artist: 'Eminem',
    year: 2002,
    genre: 'Hip-Hop / Rap',
    coverGradient: 'from-slate-700 via-zinc-800 to-amber-700',
    accentColor: '#f59e0b',
    bpm: 86,
    key: 'D Minor',
    stats: { vocals: 97, beatDrop: 89, lyrics: 100, hype: 99, catchiness: 94 },
    previewDescription: 'Grimy distorted piano progression building into an explosive rock-infused drum clash with razor-sharp lyrical delivery.',
    lyricsSnippet: "Look, if you had one shot, or one opportunity / To seize everything you ever wanted in one moment...",
    funFact: 'First hip-hop song ever to win the Academy Award for Best Original Song (8 Mile soundtrack).',
    synthRiff: 'hiphop',
    tags: ['Rap Anthem', 'Oscar Winner', 'Gym Hype', 'Fast Flow']
  },
  {
    id: 'track-4',
    title: 'Empire State of Mind',
    artist: 'JAY-Z feat. Alicia Keys',
    year: 2009,
    genre: 'Hip-Hop / Anthem',
    coverGradient: 'from-amber-600 via-yellow-700 to-zinc-900',
    accentColor: '#eab308',
    bpm: 87,
    key: 'F# Major',
    stats: { vocals: 96, beatDrop: 86, lyrics: 94, hype: 97, catchiness: 96 },
    previewDescription: 'Monumental piano chords and stadium-scale hook capturing the vibrant heart and grit of New York City.',
    lyricsSnippet: "In New York! Concrete jungle where dreams are made of / There's nothin' you can't do...",
    funFact: 'Jay-Z initially recorded the track with a different chorus, but knew instantly Alicia Keys was the only one who could sing it.',
    synthRiff: 'hiphop',
    tags: ['City Anthem', 'Grammy Winner', 'Stadium Rap', 'Iconic Hook']
  },
  {
    id: 'track-5',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    year: 1975,
    genre: 'Progressive Rock',
    coverGradient: 'from-purple-900 via-rose-900 to-zinc-950',
    accentColor: '#e11d48',
    bpm: 72,
    key: 'Bb Major',
    stats: { vocals: 100, beatDrop: 93, lyrics: 98, hype: 96, catchiness: 98 },
    previewDescription: 'Six-minute multi-part masterpiece transitioning from operatic vocal harmony to thunderous heavy metal guitar solo.',
    lyricsSnippet: "Is this the real life? Is this just fantasy? / Caught in a landslide, no escape from reality...",
    funFact: 'Freddie Mercury and Queen overdubbed vocal tracks so many times in 1975 that the magnetic tape became practically transparent.',
    synthRiff: 'rock',
    tags: ['Masterpiece', 'Rock Legend', 'Opera Rock', 'Multi-Part']
  },
  {
    id: 'track-6',
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    year: 1987,
    genre: 'Hard Rock',
    coverGradient: 'from-red-800 via-orange-900 to-zinc-900',
    accentColor: '#f97316',
    bpm: 125,
    key: 'Db Major',
    stats: { vocals: 94, beatDrop: 91, lyrics: 90, hype: 98, catchiness: 99 },
    previewDescription: "Slash's legendary string-skipping guitar intro riff backed by Duff McKagan's galloping bass and Axl Rose's shrieks.",
    lyricsSnippet: "She's got a smile that it seems to me / Reminds me of childhood memories...",
    funFact: "Slash originally came up with the intro guitar pattern purely as a goofy warmup exercise, never intending it to be a real song.",
    synthRiff: 'rock',
    tags: ['Guitar Riff', '80s Rock', 'Stadium Banger', 'Classic']
  },
  {
    id: 'track-7',
    title: 'Bad Romance',
    artist: 'Lady Gaga',
    year: 2009,
    genre: 'Electropop / Dance',
    coverGradient: 'from-fuchsia-600 via-pink-800 to-zinc-900',
    accentColor: '#ec4899',
    bpm: 119,
    key: 'A Minor',
    stats: { vocals: 94, beatDrop: 96, lyrics: 90, hype: 98, catchiness: 100 },
    previewDescription: 'Chugging Euro-rave synth bass and the indelible "Rah-rah-ah-ah-ah" chant that redefined 21st century pop spectacle.',
    lyricsSnippet: "Rah, rah, ah-ah-ah / Roma, roma-ma / Gaga, ooh-la-la / Want your bad romance!",
    funFact: 'The song was written in a tour bus while traveling through Russia and Germany, influenced by German techno clubs.',
    synthRiff: 'pop',
    tags: ['Pop Royalty', 'Euro-Dance', 'Chant Hook', 'Grammy Winner']
  },
  {
    id: 'track-8',
    title: 'Toxic',
    artist: 'Britney Spears',
    year: 2003,
    genre: 'Dance-Pop / Synth',
    coverGradient: 'from-cyan-600 via-teal-800 to-zinc-900',
    accentColor: '#06b6d4',
    bpm: 143,
    key: 'C Minor',
    stats: { vocals: 89, beatDrop: 95, lyrics: 88, hype: 97, catchiness: 99 },
    previewDescription: 'High-pitched Bollywood violin sample ("Tere Mere Beech Mein") layered over aggressive bhangra and surf-guitar licks.',
    lyricsSnippet: "With a taste of your lips, I'm on a ride / You're toxic, I'm slippin' under...",
    funFact: 'The track was originally offered to Kylie Minogue, who turned it down before Britney recorded it.',
    synthRiff: 'pop',
    tags: ['2000s Pop', 'Bollywood Sample', 'Club Classic', 'Grammy Winner']
  },
  {
    id: 'track-9',
    title: 'Levels',
    artist: 'Avicii',
    year: 2011,
    genre: 'Progressive House',
    coverGradient: 'from-emerald-500 via-teal-700 to-slate-900',
    accentColor: '#10b981',
    bpm: 126,
    key: 'C# Minor',
    stats: { vocals: 85, beatDrop: 100, lyrics: 80, hype: 100, catchiness: 99 },
    previewDescription: 'Euphoric synthesizer piano hook and soulful Etta James vocal sample that kickstarted the 2010s EDM explosion.',
    lyricsSnippet: "Oh, sometimes I get a good feeling, yeah / Get a feeling that I never, never, never, never had before...",
    funFact: 'Avicii debuted an unmastered bootleg version at a BBC Radio 1 Essential Mix in late 2010 before it conquered the globe.',
    synthRiff: 'edm',
    tags: ['EDM Anthem', 'Festival Drop', 'Progressive House', 'Etta James']
  },
  {
    id: 'track-10',
    title: 'Summer',
    artist: 'Calvin Harris',
    year: 2014,
    genre: 'Electro House',
    coverGradient: 'from-amber-400 via-orange-600 to-rose-900',
    accentColor: '#f59e0b',
    bpm: 128,
    key: 'E Minor',
    stats: { vocals: 82, beatDrop: 98, lyrics: 79, hype: 99, catchiness: 98 },
    previewDescription: 'Staccato pluck chords building tension into a massive sawtooth festival drop that soundtracked an entire generation.',
    lyricsSnippet: "When I met you in the summer / To my heartbeat's sound / We fell in love, as the leaves turned brown...",
    funFact: 'Calvin Harris provided his own lead vocals on the track, which topped charts in over 15 countries.',
    synthRiff: 'edm',
    tags: ['Summer Hit', 'Festival Drop', 'Electro House', 'Billion Streams']
  },
  {
    id: 'track-11',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    year: 1982,
    genre: 'Post-Disco / Pop',
    coverGradient: 'from-indigo-700 via-blue-900 to-zinc-950',
    accentColor: '#818cf8',
    bpm: 117,
    key: 'F# Minor',
    stats: { vocals: 99, beatDrop: 95, lyrics: 96, hype: 97, catchiness: 100 },
    previewDescription: 'The greatest baseline in pop history, locked in lockstep with a crisp snare slap and rhythmic synthesizer stabs.',
    lyricsSnippet: "Billie Jean is not my lover / She's just a girl who claims that I am the one...",
    funFact: 'Producer Quincy Jones initially wanted to rename the track "Not My Lover" to avoid confusion with tennis star Billie Jean King.',
    synthRiff: 'funk',
    tags: ['Moonwalk', 'Bassline King', 'Thriller Era', 'All-Time Great']
  },
  {
    id: 'track-12',
    title: 'Purple Rain',
    artist: 'Prince and The Revolution',
    year: 1984,
    genre: 'Power Ballad / Rock',
    coverGradient: 'from-purple-600 via-violet-900 to-zinc-950',
    accentColor: '#a855f7',
    bpm: 57,
    key: 'Bb Major',
    stats: { vocals: 98, beatDrop: 92, lyrics: 97, hype: 95, catchiness: 96 },
    previewDescription: 'Emotional acoustic chord voicings culminating in one of the most transcendent electric guitar solos in human history.',
    lyricsSnippet: "I only wanted to see you laughing in the purple rain / Purple rain, purple rain...",
    funFact: 'The recorded version on the album was actually captured live in front of a 1,500-person crowd at First Avenue in Minneapolis.',
    synthRiff: 'rock',
    tags: ['Guitar Solo', 'Live Magic', '80s Royalty', 'Legendary']
  },
  {
    id: 'track-13',
    title: 'HUMBLE.',
    artist: 'Kendrick Lamar',
    year: 2017,
    genre: 'West Coast Hip-Hop',
    coverGradient: 'from-red-700 via-stone-900 to-zinc-950',
    accentColor: '#ef4444',
    bpm: 150,
    key: 'C Minor',
    stats: { vocals: 95, beatDrop: 99, lyrics: 98, hype: 100, catchiness: 97 },
    previewDescription: 'Mike WiLL Made-It pounding piano chords and crushing sub-bass with relentless, unyielding cadence.',
    lyricsSnippet: "Be humble / Sit down, be humble / Hol' up, bitch, sit down...",
    funFact: 'Mike WiLL Made-It originally created the beat for Gucci Mane, but Kendrick took it and turned it into a Grammy-winning single.',
    synthRiff: 'hiphop',
    tags: ['DAMN.', 'Sub-Bass', 'Pulitzer Era', 'Grammy Winner']
  },
  {
    id: 'track-14',
    title: "God's Plan",
    artist: 'Drake',
    year: 2018,
    genre: 'Trap-Pop / Rap',
    coverGradient: 'from-yellow-600 via-stone-800 to-zinc-950',
    accentColor: '#eab308',
    bpm: 77,
    key: 'E Minor',
    stats: { vocals: 91, beatDrop: 92, lyrics: 90, hype: 96, catchiness: 98 },
    previewDescription: 'Atmospheric pitched vocal chops, minimalist 808 percussion and an instantly viral conversational hook.',
    lyricsSnippet: "She say, 'Do you love me?' I tell her, 'Only partly' / I only love my bed and my momma, I'm sorry...",
    funFact: 'Drake gave away the entire $996,631 music video budget directly to Miami families, students, and youth shelters.',
    synthRiff: 'hiphop',
    tags: ['Scorpion', 'Viral Hook', 'Billboard #1', 'Billion Views']
  },
  {
    id: 'track-15',
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    year: 1991,
    genre: 'Grunge / Alt-Rock',
    coverGradient: 'from-teal-700 via-blue-900 to-zinc-950',
    accentColor: '#14b8a6',
    bpm: 117,
    key: 'F Minor',
    stats: { vocals: 95, beatDrop: 97, lyrics: 92, hype: 100, catchiness: 98 },
    previewDescription: 'The explosive four-chord riff that toppled hair metal overnight with quiet verse / deafening chorus dynamics.',
    lyricsSnippet: "With the lights out, it's less dangerous / Here we are now, entertain us...",
    funFact: 'Kurt Cobain took the title from a phrase Kathleen Hanna spray-painted on his wall: "Kurt Smells Like Teen Spirit" (a deodorant brand).',
    synthRiff: 'rock',
    tags: ['Grunge Revolution', '90s Icon', 'Nevermind', 'Explosive']
  },
  {
    id: 'track-16',
    title: 'Mr. Brightside',
    artist: 'The Killers',
    year: 2003,
    genre: 'Indie Rock / Post-Punk',
    coverGradient: 'from-amber-600 via-orange-800 to-zinc-950',
    accentColor: '#f97316',
    bpm: 148,
    key: 'Db Major',
    stats: { vocals: 93, beatDrop: 95, lyrics: 94, hype: 100, catchiness: 100 },
    previewDescription: 'Blistering arpeggiated guitar riff, driving hi-hat propulsion and an impassioned, breathless vocal avalanche.',
    lyricsSnippet: "Jealousy, turning saints into the sea / Swimming through sick lullabies, choking on your alibis...",
    funFact: 'Has spent over 400 non-consecutive weeks on the UK Singles Chart, the longest-charting single in UK history.',
    synthRiff: 'rock',
    tags: ['Singalong King', 'Indie Classic', 'Hot Fuss', 'UK Chart Record']
  }
];

export const INITIAL_CLASH_MATCHUPS: ClashMatchup[] = [
  {
    id: 'clash-1',
    title: 'Synth-Pop Royalty Showdown',
    category: 'Electronic / Pop',
    description: 'The definitive retro-futuristic banger face-off: 80s neon synthwave vs 2000s French house mastery.',
    trackA: TRACK_CATALOG[0], // Blinding Lights
    trackB: TRACK_CATALOG[1], // One More Time
    votesA: 1420,
    votesB: 1290,
  },
  {
    id: 'clash-2',
    title: 'The Ultimate Hip-Hop Anthem',
    category: 'Hip-Hop / Rap',
    description: 'Which legendary motivational rap anthem gets the arena crowd roaring harder?',
    trackA: TRACK_CATALOG[2], // Lose Yourself
    trackB: TRACK_CATALOG[3], // Empire State of Mind
    votesA: 2150,
    votesB: 1840,
  },
  {
    id: 'clash-3',
    title: 'Rock Opera vs Stadium Guitar Hero',
    category: 'Classic Rock',
    description: "Queen's operatic magnum opus takes on Slash and Guns N' Roses' greatest guitar riff of all time.",
    trackA: TRACK_CATALOG[4], // Bohemian Rhapsody
    trackB: TRACK_CATALOG[5], // Sweet Child O' Mine
    votesA: 3100,
    votesB: 2890,
  },
  {
    id: 'clash-4',
    title: '2000s Pop Queen Mega-Clash',
    category: 'Dance-Pop',
    description: 'Electropop monster "Bad Romance" squares off with the seductive Bollywood-sampled classic "Toxic".',
    trackA: TRACK_CATALOG[6], // Bad Romance
    trackB: TRACK_CATALOG[7], // Toxic
    votesA: 1780,
    votesB: 1910,
  },
  {
    id: 'clash-5',
    title: 'Festival Mainstage EDM Titans',
    category: 'EDM / Dance',
    description: 'Two unstoppable summer anthems that defined the global electronic dance festival era.',
    trackA: TRACK_CATALOG[8], // Levels
    trackB: TRACK_CATALOG[9], // Summer
    votesA: 2450,
    votesB: 2010,
  },
  {
    id: 'clash-6',
    title: 'The Battle of the 80s Icons',
    category: '80s Royalty',
    description: "Michael Jackson's infectious groove against Prince's transcendent purple guitar power ballad.",
    trackA: TRACK_CATALOG[10], // Billie Jean
    trackB: TRACK_CATALOG[11], // Purple Rain
    votesA: 3410,
    votesB: 3180,
  },
  {
    id: 'clash-7',
    title: 'Modern Rap Heavyweight Bout',
    category: 'Modern Hip-Hop',
    description: "Kendrick's earth-shaking sub-bass and Pulitzer pedigree vs Drake's viral unstoppable hitmaker energy.",
    trackA: TRACK_CATALOG[12], // HUMBLE.
    trackB: TRACK_CATALOG[13], // God's Plan
    votesA: 1930,
    votesB: 1870,
  },
  {
    id: 'clash-8',
    title: 'Alt-Rock Singalong Explosion',
    category: 'Alt / Indie Rock',
    description: 'The grunge anthem that redefined a decade vs the greatest indie club singalong in history.',
    trackA: TRACK_CATALOG[14], // Smells Like Teen Spirit
    trackB: TRACK_CATALOG[15], // Mr. Brightside
    votesA: 2200,
    votesB: 2310,
  }
];

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 'q-1',
    type: 'audio-sample',
    category: 'Synth & Melodies',
    prompt: 'Listen to this synth arpeggio riff. Which record-breaking hit single uses this signature 80s rhythm?',
    audioRiff: 'synthwave',
    options: ['The Weeknd — Blinding Lights', 'Dua Lipa — Physical', 'a-ha — Take On Me', 'Kavinsky — Nightcall'],
    correctIndex: 0,
    explanation: 'Blinding Lights features a fast 171 BPM analog synth arpeggio inspired by 80s synthwave that dominated the charts worldwide.',
    points: 150,
    difficulty: 'easy'
  },
  {
    id: 'q-2',
    type: 'guess-song',
    category: 'Hip-Hop History',
    prompt: 'Which track became the first hip-hop song in history to win an Academy Award (Oscar) for Best Original Song?',
    audioRiff: 'hiphop',
    options: ['Eminem — Lose Yourself', 'Three 6 Mafia — It\'s Hard Out Here for a Pimp', 'Common & John Legend — Glory', 'Eminem — Stan'],
    correctIndex: 0,
    explanation: 'Eminem won the Oscar for "Lose Yourself" from the movie 8 Mile in 2003, but famously slept through the broadcast believing he had no chance of winning.',
    points: 100,
    difficulty: 'easy'
  },
  {
    id: 'q-3',
    type: 'finish-lyrics',
    category: 'Pop Anthems',
    prompt: 'Complete the lyrics from Lady Gaga\'s "Bad Romance": "I want your love, and I want your revenge, I want your love, I don\'t wanna be..."',
    options: ['friends', 'alone', 'broken', 'afraid'],
    correctIndex: 0,
    explanation: '"I want your love, and I want your revenge / I want your love, I don\'t wanna be friends!"',
    points: 100,
    difficulty: 'easy'
  },
  {
    id: 'q-4',
    type: 'guess-artist',
    category: 'Samples & Stems',
    prompt: 'Britney Spears\' iconic hit "Toxic" famously samples a high-pitched violin string section from which country\'s cinema?',
    audioRiff: 'pop',
    options: ['India (Bollywood cinema)', 'Japan (Taiko scores)', 'Egypt (Classic Arabic orchestration)', 'Brazil (Bossa Nova strings)'],
    correctIndex: 0,
    explanation: 'Producers Bloodshy & Avant sampled the 1981 Hindi song "Tere Mere Beech Mein" from the classic Bollywood film Ek Duuje Ke Liye.',
    points: 150,
    difficulty: 'medium'
  },
  {
    id: 'q-5',
    type: 'audio-sample',
    category: 'Rock Legends',
    prompt: 'Identify the genre & vibe playing: Which iconic band created "Sweet Child O\' Mine" around a warmup guitar drill?',
    audioRiff: 'rock',
    options: ['Guns N\' Roses', 'Bon Jovi', 'Aerosmith', 'Def Leppard'],
    correctIndex: 0,
    explanation: 'Slash originally stumbled across the famous string-skipping intro pattern as a warm-up exercise.',
    points: 100,
    difficulty: 'easy'
  },
  {
    id: 'q-6',
    type: 'guess-song',
    category: 'EDM Legends',
    prompt: 'Avicii\'s legendary track "Levels" samples the iconic 1962 vocal "Sometimes I get a good feeling" by which soul legend?',
    audioRiff: 'edm',
    options: ['Etta James', 'Aretha Franklin', 'Nina Simone', 'Ella Fitzgerald'],
    correctIndex: 0,
    explanation: 'Avicii sampled Etta James\' 1962 soul track "Something\'s Got a Hold on Me", which was also famously sampled by Flo Rida.',
    points: 150,
    difficulty: 'medium'
  },
  {
    id: 'q-7',
    type: 'finish-lyrics',
    category: 'Classic Rock',
    prompt: 'In Queen\'s "Bohemian Rhapsody", what name is repeatedly called out in the dramatic operatic section?',
    options: ['Galileo', 'Leonardo', 'Picasso', 'Giotto'],
    correctIndex: 0,
    explanation: '"Galileo, Galileo, Galileo Figaro, Magnifico-o-o-o-o!"',
    points: 100,
    difficulty: 'easy'
  },
  {
    id: 'q-8',
    type: 'year-match',
    category: 'Music Milestones',
    prompt: 'In what year did Nirvana release their generational grunge anthem "Smells Like Teen Spirit" on the album Nevermind?',
    options: ['1991', '1989', '1993', '1995'],
    correctIndex: 0,
    explanation: 'Nevermind was released in September 1991 and knocked Michael Jackson\'s Dangerous off the #1 spot on Billboard in January 1992.',
    points: 150,
    difficulty: 'medium'
  },
  {
    id: 'q-9',
    type: 'guess-artist',
    category: 'Chart Records',
    prompt: 'Which Las Vegas indie rock band set the record for the most weeks ever spent on the UK Singles Top 100 with "Mr. Brightside"?',
    audioRiff: 'rock',
    options: ['The Killers', 'Arctic Monkeys', 'The Strokes', 'Franz Ferdinand'],
    correctIndex: 0,
    explanation: 'The Killers\' debut hit "Mr. Brightside" (2003) spent over 400 weeks on the UK charts and remains an eternal singalong anthem.',
    points: 150,
    difficulty: 'medium'
  },
  {
    id: 'q-10',
    type: 'finish-lyrics',
    category: 'Modern Rap',
    prompt: 'In Drake\'s "God\'s Plan", what two things does he say he truly loves?',
    options: ['My bed and my momma', 'My money and my city', 'My crew and my music', 'My cars and my jewelry'],
    correctIndex: 0,
    explanation: '"I only love my bed and my momma, I\'m sorry!"',
    points: 100,
    difficulty: 'easy'
  },
  {
    id: 'q-11',
    type: 'audio-sample',
    category: 'Funk & Groove',
    prompt: 'Listen to this slap bass groove. Which legendary album produced "Billie Jean", the best-selling album of all time?',
    audioRiff: 'funk',
    options: ['Thriller', 'Bad', 'Off the Wall', 'Dangerous'],
    correctIndex: 0,
    explanation: 'Thriller (1982) produced 7 top-10 singles and has sold over 70 million copies worldwide.',
    points: 100,
    difficulty: 'easy'
  },
  {
    id: 'q-12',
    type: 'guess-song',
    category: 'Songwriting Secrets',
    prompt: 'Which producer originally created the beat for Kendrick Lamar\'s "HUMBLE." intending to give it to Gucci Mane?',
    audioRiff: 'hiphop',
    options: ['Mike WiLL Made-It', 'Metro Boomin', 'Murda Beatz', 'DJ Mustard'],
    correctIndex: 0,
    explanation: 'Mike WiLL Made-It crafted the heavy piano cadence for Gucci Mane, but after playing it for Kendrick, Kendrick immediately claimed it.',
    points: 200,
    difficulty: 'hard'
  }
];

export const BEAT_PADS: BeatPad[] = [
  { id: 'pad-1', name: 'Kick Punch', keyboardKey: '1', soundType: 'kick', color: 'from-purple-600 to-indigo-900' },
  { id: 'pad-2', name: 'Trap Snare', keyboardKey: '2', soundType: 'snare', color: 'from-fuchsia-600 to-purple-800' },
  { id: 'pad-3', name: '16th Hat', keyboardKey: '3', soundType: 'hihat', color: 'from-violet-500 to-purple-600' },
  { id: 'pad-4', name: '808 Sub G1', keyboardKey: '4', soundType: '808', note: 'G1', color: 'from-purple-900 to-zinc-950' },
  { id: 'pad-5', name: 'Studio Clap', keyboardKey: 'Q', soundType: 'clap', color: 'from-purple-500 to-pink-600' },
  { id: 'pad-6', name: 'Vocal "Ayy"', keyboardKey: 'W', soundType: 'vocalChop', note: 'A4', color: 'from-pink-500 to-rose-600' },
  { id: 'pad-7', name: 'Vocal "Yeah"', keyboardKey: 'E', soundType: 'vocalChop', note: 'C5', color: 'from-rose-500 to-purple-600' },
  { id: 'pad-8', name: 'Lead Arp C5', keyboardKey: 'R', soundType: 'synthLead', note: 'C5', color: 'from-cyan-400 to-blue-600' },
  { id: 'pad-9', name: 'Synth Chord Am', keyboardKey: 'A', soundType: 'synthChord', note: 'Am', color: 'from-indigo-500 to-purple-700' },
  { id: 'pad-10', name: 'Synth Chord F', keyboardKey: 'S', soundType: 'synthChord', note: 'F Maj', color: 'from-purple-600 to-violet-800' },
  { id: 'pad-11', name: 'Rimshot Click', keyboardKey: 'D', soundType: 'percussion', color: 'from-zinc-600 to-zinc-800' },
  { id: 'pad-12', name: 'Shaker Perc', keyboardKey: 'F', soundType: 'percussion', color: 'from-purple-400 to-indigo-500' },
  { id: 'pad-13', name: 'Sub Glide D1', keyboardKey: 'Z', soundType: 'synthBass', note: 'D1', color: 'from-purple-950 to-black' },
  { id: 'pad-14', name: 'Lead High G5', keyboardKey: 'X', soundType: 'synthLead', note: 'G5', color: 'from-violet-400 to-cyan-500' },
  { id: 'pad-15', name: 'Laser FX Riser', keyboardKey: 'C', soundType: 'fxLaser', color: 'from-fuchsia-500 to-pink-500' },
  { id: 'pad-16', name: 'Sub Drop 808', keyboardKey: 'V', soundType: '808', note: 'F1', color: 'from-purple-800 to-zinc-900' }
];

export const DEFAULT_MASTERING_SETTINGS = {
  enabled: true,
  preset: 'punchy-rap' as const,
  warmth: 65,
  limiting: 75,
  stereoWidth: 80,
  subBassBoost: 70,
  airClarity: 85,
  spatialReverb: 40
};

export const INITIAL_BEAT_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Midnight 808 Syndicate',
    bpm: 140,
    key: 'F Minor',
    genre: 'Trap / Dark Drill',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    lyrics: `[Intro]\n(Heavy 808 slide, atmospheric reverb)\nYeah, straight from the clash lab, we don't ever fold\n\n[Verse 1]\nDiamond in the rough, turning silver into gold\nEvery kick hitting hard, tell the story untold\nGot the crew on the line, we about to take the crown\nLoudest frequencies shaking up the town!`,
    playbackEnabled: true,
    masteringSettings: {
      enabled: true,
      preset: 'punchy-rap' as const,
      warmth: 75,
      limiting: 80,
      stereoWidth: 70,
      subBassBoost: 85,
      airClarity: 80,
      spatialReverb: 35
    },
    tracks: [
      {
        id: 't-1',
        name: 'Kick Drum (Punch)',
        soundType: 'kick' as const,
        color: 'bg-purple-600',
        steps: [true, false, false, false, false, false, false, false, true, false, true, false, false, false, false, false],
        volume: 0.9,
        isMuted: false,
        isSolo: false
      },
      {
        id: 't-2',
        name: 'Trap Snare / Clap',
        soundType: 'snare' as const,
        color: 'bg-fuchsia-500',
        steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        volume: 0.85,
        isMuted: false,
        isSolo: false
      },
      {
        id: 't-3',
        name: 'Hi-Hat (16th Rolls)',
        soundType: 'hihat' as const,
        color: 'bg-violet-400',
        steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
        volume: 0.7,
        isMuted: false,
        isSolo: false
      },
      {
        id: 't-4',
        name: '808 Heavy Sub',
        soundType: '808' as const,
        color: 'bg-purple-900',
        steps: [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false],
        volume: 1.0,
        isMuted: false,
        isSolo: false
      },
      {
        id: 't-5',
        name: 'Vocal Chop "Ayy"',
        soundType: 'vocalChop' as const,
        color: 'bg-pink-500',
        steps: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, true, false],
        volume: 0.75,
        isMuted: false,
        isSolo: false
      },
      {
        id: 't-6',
        name: 'Synth Lead Arp',
        soundType: 'synthLead' as const,
        color: 'bg-cyan-400',
        steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
        volume: 0.65,
        isMuted: false,
        isSolo: false
      }
    ],
    createdAt: '2026-08-16',
    updatedAt: 'Just now'
  },
  {
    id: 'proj-2',
    title: 'Neon Cyber Synthwave',
    bpm: 124,
    key: 'A Minor',
    genre: 'Synthwave / Retro',
    coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    lyrics: `[Chorus]\nDriving down the neon highway, glowing in the night\nAnalog synthesizers burning bright\nSilver reflections on the dashboard screen\nLiving inside of a cyber dream!`,
    playbackEnabled: true,
    masteringSettings: {
      enabled: true,
      preset: 'edm-maximizer' as const,
      warmth: 60,
      limiting: 85,
      stereoWidth: 90,
      subBassBoost: 65,
      airClarity: 90,
      spatialReverb: 55
    },
    tracks: [
      {
        id: 't-1',
        name: 'Kick Drum (4-on-Floor)',
        soundType: 'kick' as const,
        color: 'bg-purple-600',
        steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
        volume: 0.9,
        isMuted: false,
        isSolo: false
      },
      {
        id: 't-2',
        name: 'Snare Gated Reverb',
        soundType: 'snare' as const,
        color: 'bg-fuchsia-500',
        steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        volume: 0.8,
        isMuted: false,
        isSolo: false
      },
      {
        id: 't-3',
        name: 'Hi-Hat Groove',
        soundType: 'hihat' as const,
        color: 'bg-violet-400',
        steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
        volume: 0.65,
        isMuted: false,
        isSolo: false
      },
      {
        id: 't-4',
        name: 'Synth Bass 16th',
        soundType: 'synthBass' as const,
        color: 'bg-purple-900',
        steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
        volume: 0.85,
        isMuted: false,
        isSolo: false
      }
    ],
    createdAt: '2026-08-15',
    updatedAt: 'Yesterday'
  }
];

export const INITIAL_FREE_BEATS = [
  {
    id: 'free-beat-1',
    title: 'Purple Twilight Trap',
    producer: 'DJ 808 Venom',
    bpm: 142,
    key: 'C# Minor',
    genre: 'Trap / Hip-Hop',
    synthRiff: 'hiphop' as const,
    coverArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dj-mixing-music-in-a-nightclub-43362-large.mp4',
    isFree: true,
    downloads: 1420,
    likes: 830,
    description: 'Dark, menacing 808 glide beat with bouncy hi-hat triplet rolls and haunting choral synth pad.',
    tags: ['808 Slide', 'Hard Trap', 'Free For Profit', 'Gunna Style']
  },
  {
    id: 'free-beat-2',
    title: 'Silver Chrome Synth Anthem',
    producer: 'Nova Waves',
    bpm: 126,
    key: 'F Major',
    genre: 'Synthwave / EDM',
    synthRiff: 'synthwave' as const,
    coverArt: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
    isFree: true,
    downloads: 980,
    likes: 640,
    description: 'Electrifying retro synth chords with punchy sidechained bass and soaring vocal chops.',
    tags: ['Retro Wave', 'Club Anthem', 'Melodic', '126 BPM']
  },
  {
    id: 'free-beat-3',
    title: 'Midnight Soul & Lofi Chill',
    producer: 'Lofi Alchemist',
    bpm: 88,
    key: 'Eb Major',
    genre: 'Lofi / Soul',
    synthRiff: 'soul' as const,
    coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    isFree: true,
    downloads: 2150,
    likes: 1390,
    description: 'Warm vinyl crackle, lush Rhodes electric piano chords and lazy swinging boom bap drums.',
    tags: ['Lofi Beats', 'Study & Chill', 'Vinyl Crackle', 'Free Stems']
  },
  {
    id: 'free-beat-4',
    title: 'Latin Dembow Heatwave',
    producer: 'Fuego Beats',
    bpm: 104,
    key: 'G Minor',
    genre: 'Reggaeton / Latin',
    synthRiff: 'latin' as const,
    coverArt: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
    isFree: true,
    downloads: 1670,
    likes: 910,
    description: 'Irresistible dembow snare rhythm with tropical plucks and deep sub-bass pulse.',
    tags: ['Dembow', 'Reggaeton', 'Bad Bunny Type', 'Summer Hype']
  }
];

export const INITIAL_CREW = {
  id: 'crew-808-syndicate',
  name: '808 Syndicate',
  tag: '808SYN',
  bio: 'Elite underground producer & lyricist collective dominating the Clash Beat Lab arena.',
  avatarUrl: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=600&auto=format&fit=crop&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
  genreFocus: 'Trap / Drill / Cinematic Hip-Hop',
  totalBeatsMade: 28,
  crewClashDollars: 14500,
  createdDate: '2026-08-01',
  members: [
    {
      id: 'm-1',
      name: 'DJ Sonic Nova (You)',
      role: 'Lead Producer' as const,
      avatarEmoji: '🎧',
      isAi: false,
      isOnline: true
    },
    {
      id: 'm-2',
      name: 'AI Lyricist Ghost',
      role: 'Lyricist' as const,
      avatarEmoji: '⚡',
      isAi: true,
      isOnline: true
    },
    {
      id: 'm-3',
      name: 'Mastering Maestro',
      role: 'Mastering Engineer' as const,
      avatarEmoji: '🎛️',
      isAi: true,
      isOnline: true
    },
    {
      id: 'm-4',
      name: 'Vocal Queen Val',
      role: 'Vocalist' as const,
      avatarEmoji: '🎤',
      isAi: true,
      isOnline: false
    }
  ]
};

export const INITIAL_CREW_MESSAGES = [
  {
    id: 'msg-1',
    crewId: 'crew-808-syndicate',
    senderName: 'Mastering Maestro',
    senderRole: 'Mastering Engineer',
    avatarEmoji: '🎛️',
    isAi: true,
    message: 'Yo squad! The new Tube Warmth rack is loaded. Mastered tracks are hitting -9 LUFS with zero distortion!',
    timestamp: '10:42 AM',
    reactions: ['🔥', '⚡']
  },
  {
    id: 'msg-2',
    crewId: 'crew-808-syndicate',
    senderName: 'AI Lyricist Ghost',
    senderRole: 'Lyricist',
    avatarEmoji: '⚡',
    isAi: true,
    message: 'Just cooked 16 bars for the AI Arena co-write session. Anyone who records a vocal take gets the $299 Clash Dollars instant split!',
    timestamp: '11:15 AM',
    attachedBeatName: 'Midnight 808 Syndicate',
    reactions: ['💰', '🎤']
  },
  {
    id: 'msg-3',
    crewId: 'crew-808-syndicate',
    senderName: 'Vocal Queen Val',
    senderRole: 'Vocalist',
    avatarEmoji: '🎤',
    isAi: true,
    message: 'Love that F minor chord progression. Dropping the high harmony run on bar 8 right now!',
    timestamp: '11:30 AM',
    reactions: ['👑']
  }
];

export const INITIAL_BADGES: UserBadge[] = [
  {
    id: 'badge-first-vote',
    title: 'First Blood',
    description: 'Cast your first vote in a Head-to-Head Clash matchup.',
    icon: 'Flame',
    unlocked: true,
    unlockedAt: 'Just now'
  },
  {
    id: 'badge-ai-collab',
    title: 'AI Arena Co-Writer',
    description: 'Pair an AI lyricist with human voice and earn $299 Music Clash Dollars.',
    icon: 'Sparkles',
    unlocked: false,
    progress: { current: 0, max: 1 }
  },
  {
    id: 'badge-beatmaker',
    title: 'Master Beatmaker',
    description: 'Create and master a multi-track project in Beat Lab.',
    icon: 'Music',
    unlocked: true
  },
  {
    id: 'badge-tournament-champ',
    title: 'Clash Champion',
    description: 'Crown a winning track in a full 8-song Tournament Bracket.',
    icon: 'Trophy',
    unlocked: false
  },
  {
    id: 'badge-crew-boss',
    title: 'Crew Commander',
    description: 'Found your own music producer crew and host private studio sessions.',
    icon: 'Award',
    unlocked: true
  }
];

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  djName: 'DJ Sonic Nova',
  djTitle: 'Beat Lab Maestro',
  avatarSeed: 'music-clash-dj',
  level: 1,
  xp: 180,
  xpToNextLevel: 500,
  coins: 450,
  clashDollars: 850, // $MCD Music Clash Dollars
  clashesVoted: 1,
  correctTriviaAnswers: 0,
  triviaHighScore: 0,
  tournamentsCompleted: 0,
  tournamentsWon: 0,
  streakCount: 1,
  beatsCreated: 2,
  aiCollaborationsAccepted: 0,
  activeCrewId: 'crew-808-syndicate',
  matchHistory: [
    {
      id: 'hist-1',
      date: 'Today',
      type: 'duel',
      title: 'Synth-Pop Royalty Showdown',
      result: 'Voted: Blinding Lights',
      xpGained: 50,
      coinsGained: 100,
      clashDollarsGained: 50
    }
  ],
  badges: INITIAL_BADGES
};
