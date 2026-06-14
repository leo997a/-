/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Download, Copy, Check, Upload, Sparkles, X, Activity, Image as ImageIcon, Settings, Save, Key, RefreshCw, Star, Palette } from 'lucide-react';

interface Frame {
  id: string;
  title: string;
  detail: string;
  prompt?: string;
  imageUrl?: string;
  selectedFilter?: string;
}

const initialFrames: Frame[] = [
  // Session 1: High Emotion
  { id: '01', title: 'Shock (صدمة)', detail: 'Waist-Up, hands grabbing face in shock, looking directly at camera, Studio lighting' },
  { id: '02', title: 'News (عاجل)', detail: 'Medium Shot, aggressively pointing finger at camera, intense stare, Dark dramatic lighting' },
  { id: '03', title: 'Anger (غضب)', detail: 'Waist-Up, clenched fists raised, furious expression, looking directly at camera, Casual setting' },
  { id: '04', title: 'Laugh (ضحك)', detail: 'Waist-Up, holding stomach laughing hysterically, looking at camera, Casual t-shirt' },
  { id: '05', title: 'Logic (تحليل)', detail: 'Waist-Up, hands gesturing to explain a concept, focused look at camera, Tech hoodie' },
  { id: '06', title: 'Victory (فوز)', detail: 'Waist-Up, both arms raised in celebration, massive smile looking at camera, Sportswear' },
  { id: '07', title: 'Challenge (تحدي)', detail: 'Waist-Up, arms crossed looking aggressively at camera, Gym setting' },
  { id: '08', title: 'Doubt (شك)', detail: 'Waist-Up, one hand stroking chin, narrowed eyes looking at camera, Neon lighting' },
  { id: '09', title: 'Warning (تحذير)', detail: 'Waist-Up, palm pushed forward in a "stop" gesture, serious face looking at camera, Dark Room' },
  { id: '10', title: 'Trend (ترند)', detail: 'Waist-Up, making a heart shape with hands, smiling at camera, RGB lighting' },
  
  // Session 2: Podcast & Talk
  { id: '11', title: 'Live (مباشر)', detail: 'Waist-Up, one hand holding professional podcast microphone, looking at camera, Studio' },
  { id: '12', title: 'Focus (تركيز)', detail: 'Medium Shot, leaning forward with hands on desk, intense focus on camera, Office desk' },
  { id: '13', title: 'Surprise (استغراب)', detail: 'Waist-Up, hands thrown up in disbelief, eyebrows raised looking at camera, Bright lighting' },
  { id: '14', title: 'Motiv. (تحفيز)', detail: 'Waist-Up, open welcoming hands, warm encouraging smile looking at camera, Morning sunlight' },
  { id: '15', title: 'Strong (رأي قوي)', detail: 'Waist-Up, chopping hand gesture emphasizing a point, firm look at camera, Podcast setup' },
  { id: '16', title: 'Sarcasm (سخرية)', detail: 'Waist-Up, doing air quotes with fingers, smirk looking at camera, Side lighting' },
  { id: '17', title: 'Fail (خيبة)', detail: 'Waist-Up, facepalm with one hand, looking disappointed at camera, Shadows' },
  { id: '18', title: 'Explain (شرح)', detail: 'Waist-Up, both hands open presenting something, looking directly at camera, White Background' },
  { id: '19', title: 'Discuss (نقاش)', detail: 'Waist-Up, casual conversational hand gestures, relaxed look at camera, Casual setting' },
  { id: '20', title: 'Pure Joy (فرح نقي)', detail: 'Waist-Up, hands clapping together, huge genuine smile looking at camera, Warm lighting' },
  
  // Session 3: Action & Reactions
  { id: '21', title: 'Confusion (حيرة)', detail: 'Waist-Up, hands up in a "I don\'t know" gesture, confused look at camera, Blue lighting' },
  { id: '22', title: 'Wait (ترقب)', detail: 'Waist-Up, hands gripping each other tightly in anticipation, looking at camera, Cinematic lighting' },
  { id: '23', title: 'Neutral (حياد)', detail: 'Waist-Up, arms relaxed at sides, calm neutral expression looking at camera, Flat lighting' },
  { id: '24', title: 'Trust (ثقة)', detail: 'Waist-Up, one hand placed over heart, sincere look directly at camera, Outdoor lighting' },
  { id: '25', title: 'Scream (صراخ)', detail: 'Waist-Up, hands pulling hair/head, mouth wide open screaming at camera, High Contrast' },
  { id: '26', title: 'Facepalm (إحباط)', detail: 'Waist-Up, hand slapping forehead in frustration, looking at camera, Dim lighting' },
  { id: '27', title: 'Disgust (اشمئزاز)', detail: 'Waist-Up, hand pushing away in disgust, sneering look at camera, Sharp lighting' },
  { id: '28', title: 'Mind Blown (مذهول)', detail: 'Waist-Up, hands making an explosion gesture originating from head, looking amazed at camera, Action lighting' },
  { id: '29', title: 'Thinking (تفكير عميق)', detail: 'Waist-Up, index fingers touching temples, deep thought looking at camera, Dark lighting' },
  { id: '30', title: 'Secret (همس/سر)', detail: 'Waist-Up, index finger holding over lips (shh gesture), looking at camera, Shadowy lighting' },

  // Session 4: Gestures & Setup
  { id: '31', title: 'Pointing (تأشير)', detail: 'Waist-Up, pointing index finger strongly directly into the camera lens, Studio lighting' },
  { id: '32', title: 'Stop (قف/تحذير)', detail: 'Waist-Up, both palms facing camera in a "stop right there" gesture, Red accent lighting' },
  { id: '33', title: 'Salute (تحية)', detail: 'Waist-Up, military or sports salute gesture with right hand, looking proud at camera' },
  { id: '34', title: 'Shrug (لا أعلم)', detail: 'Waist-Up, exaggerating a shoulder shrug with empty hands open, looking at camera' },
  { id: '35', title: 'Nodding (موافقة)', detail: 'Waist-Up, giving two strong thumbs up, nodding head looking at camera, Bright lighting' },
  { id: '36', title: 'Clapping (تصفيق)', detail: 'Waist-Up, hands visibly clapping in front of chest, looking at camera, Stage lighting' },
  { id: '37', title: 'Tired (إرهاق)', detail: 'Waist-Up, wiping sweat from forehead with back of hand, exhausted look at camera' },
  { id: '38', title: 'Cold (برودة)', detail: 'Waist-Up, arms crossed rubbing shoulders looking freezing at camera, Winter Jacket, Blue tint' },
  { id: '39', title: 'Hot (حرارة)', detail: 'Waist-Up, fanning face with one hand looking overheated at camera, Warm sunny lighting' },
  { id: '40', title: 'Review (يقيّم شاشة)', detail: 'Waist-Up, holding an invisible object/phone, looking analytical at camera, Screen glow lighting' },

  // Session 5: Cinematic & Abstract
  { id: '41', title: 'Gamer (لعب/توتر)', detail: 'Waist-Up, passionately holding a gaming controller, intense look at camera, RGB lighting' },
  { id: '42', title: 'Silhouette (ظل)', detail: 'Waist-Up, strong dramatic pose facing camera, face visible but heavily backlit, Rim lighting' },
  { id: '43', title: 'Point Up (تنبيه أعلى)', detail: 'Waist-Up, pointing index finger straight up to text space above, looking at camera' },
  { id: '44', title: 'Looking Up (أمل)', detail: 'Waist-Up, face slightly tilted up looking at a light source, hopeful expression, Light Beam' },
  { id: '45', title: 'Looking Down (حزن)', detail: 'Waist-Up, head slightly bowed but eyes looking up at camera, sorrowful expression, Top Down lighting' },
  { id: '46', title: 'Hero (بطل)', detail: 'Waist-Up, heroic hands-on-hips stance, confident look at camera, Low Angle shot' },
  { id: '47', title: 'Villian (شرير/تحدي)', detail: 'Waist-Up, hands steepled/fingers together plotting, sly look at camera, Under lighting' },
  { id: '48', title: 'Handshake (اتفاق)', detail: 'Waist-Up, reaching right hand out to the camera for a handshake, smiling, Cool Tone' },
  { id: '49', title: 'Drink (رشفة ماء/قهوة)', detail: 'Waist-Up, holding a coffee cup to mouth, relaxed look at camera, Morning Vibe' },
  { id: '50', title: 'Crying/Emotional (تأثر)', detail: 'Waist-Up, visibly wiping a tear from eye, overly dramatic emotional look at camera' },

  // Session 6: Extreme Reactions & YouTube Hooks
  { id: '51', title: 'Eyes Wide (جحوظ العينين)', detail: 'Waist-Up, eyes bugging out in absolute disbelief, covering mouth, Red and Blue contrasting lights' },
  { id: '52', title: 'Fainting (إغماء)', detail: 'Waist-Up, falling backward with hand on forehead, exhausted dramatic reaction, Studio spotlight' },
  { id: '53', title: 'Shhh! (صمت تام)', detail: 'Waist-Up, pressing finger aggressively against lips, wide eyes looking at camera, Dark silhouette' },
  { id: '54', title: 'Calculations (حسابات)', detail: 'Waist-Up, pointing dynamically at invisible floating math equations, intense squint, Futuristic lighting' },
  { id: '55', title: 'Sweating (تعرق وورطة)', detail: 'Waist-Up, wiping sweat frantically with a towel, terrified look at camera, Harsh high-contrast lighting' },
  { id: '56', title: 'Holding Sign (لافتة غامضة)', detail: 'Waist-Up, holding a blank cardboard sign in front of chest, smug smile, Studio Background' },
  { id: '57', title: 'No Way! (مستحيل)', detail: 'Waist-Up, shaking head vigorously with hands pulling cheeks, looking at camera, Neon Pink lighting' },
  { id: '58', title: 'Praying (توسل)', detail: 'Waist-Up, hands pressed together in a begging motion, pleading eyes at camera, Warm golden hour' },
  { id: '59', title: 'Hiding (اختباء)', detail: 'Waist-Up, peeking from behind hands covering the face, fearful look, Cinematic shadows' },
  { id: '60', title: 'Binoculars (تجسس/بحث)', detail: 'Waist-Up, making binocular shapes with hands over eyes, searching look at camera, Greenish tint' },

  // Session 7: Objects & Interactions
  { id: '61', title: 'Money Rain (ثرَاء/مكسب)', detail: 'Waist-Up, throwing invisible cash in the air, arrogant joyful face, Gold/Green lighting' },
  { id: '62', title: 'Timer (الوقت ينفد)', detail: 'Waist-Up, pointing urgently at an imaginary watch on the wrist, stressed look, Red warning light' },
  { id: '63', title: 'Camera Snap (مصور)', detail: 'Waist-Up, framing a shot using both hands in a rectangle shape, winking at camera, Flash photography style' },
  { id: '64', title: 'Glasses Adjust (ذكاء خارق)', detail: 'Waist-Up, adjusting imaginary glasses on nose bridge, confident anime-style stare, Cyan backlighting' },
  { id: '65', title: 'Headphones (استماع محبط)', detail: 'Waist-Up, taking off imaginary headphones in disgust, annoyed look at camera, Purple studio lighting' },
  { id: '66', title: 'Tearing Paper (عقد مرفوض)', detail: 'Waist-Up, aggressively tearing an imaginary document in half, angry look at camera, Office setting' },
  { id: '67', title: 'Magnifying (فحص دقيق)', detail: 'Waist-Up, holding a magnifying glass towards the camera, curious wide eye, Detective lighting' },
  { id: '68', title: 'Broken Heart (انكسار)', detail: 'Waist-Up, clenching chest over heart, tearing up looking at camera, Desaturated moody tones' },
  { id: '69', title: 'Boxing (استعداد للمواجهة)', detail: 'Waist-Up, both fists raised in a boxing guard, aggressive challenging look, Boxing ring lighting' },
  { id: '70', title: 'Magic (سحر/إبداع)', detail: 'Waist-Up, hands open revealing glowing light, awestruck face looking at camera, Magical blue glow' },

  // Session 8: Advanced Emotions
  { id: '71', title: 'Boredom (ملل شديد)', detail: 'Waist-Up, resting head heavily on hand, eyes half closed looking unimpressed, Gray flat lighting' },
  { id: '72', title: 'Apology (اعتذار عميق)', detail: 'Waist-Up, bowing head slightly with hand on chest, remorseful sad look at camera, Soft diffused lighting' },
  { id: '73', title: 'Gossip (نميمة)', detail: 'Waist-Up, leaning forward whispering behind one hand, mischievous look at camera, Warm intimate lighting' },
  { id: '74', title: 'Eww! (قرف/رائحة سيئة)', detail: 'Waist-Up, pinching nose with fingers, extreme face of disgust, Green sickly light' },
  { id: '75', title: 'Panic Attack (ذعر مميت)', detail: 'Waist-Up, hands gripping head, eyes wide with pure terror, Shaky chaotic lighting effect' },
  { id: '76', title: 'Hypnotized (تنويم مغناطيسي)', detail: 'Waist-Up, blank stare, arms drooping, relaxed but eerie look at camera, Spiral psychedelic lighting' },
  { id: '77', title: 'Smirk (غرور/تفاخر)', detail: 'Waist-Up, leaning back with arms crossed, half-smile superior look at camera, Crisp commercial lighting' },
  { id: '78', title: 'Awkward (إحراج)', detail: 'Waist-Up, rubbing back of neck, forced awkward smile at camera, Harsh fluorescent lighting' },
  { id: '79', title: 'Dizzy (دوار/صدمة قوية)', detail: 'Waist-Up, hand on forehead swaying, eyes searching, disoriented look at camera, Blurry background light' },
  { id: '80', title: 'Rage Quit (استسلام بغضب)', detail: 'Waist-Up, throwing hands up in the air in defeat, screaming upwards, Red and Black shadows' },

  // Session 9: Thumbnails & Storytelling
  { id: '81', title: 'Secret Revealed (انكشاف سر)', detail: 'Waist-Up, holding hands up defensively, shocked "busted" expression, Spotlight from above' },
  { id: '82', title: 'Idea! (فكرة عبقرية)', detail: 'Waist-Up, pointing index finger up with mouth open in sudden realization, Bright yellow bulb lighting' },
  { id: '83', title: 'Disbelief (غير معقول)', detail: 'Waist-Up, rubbing eyes with knuckles, looking back at camera in absolute disbelief, Morning light' },
  { id: '84', title: 'Tasting (تذوق مذهل)', detail: 'Waist-Up, kissing fingers (chef kiss) gesture, delighted face looking at camera, Warm kitchen lighting' },
  { id: '85', title: 'Freezing (رعب متجمد)', detail: 'Waist-Up, eyes locked in terror, no movement, pale face, Cold blue moonlight' },
  { id: '86', title: 'Losing Mind (جنون)', detail: 'Waist-Up, wild hair shaking, crazy wide smile, highly unhinged look at camera, Colorful neon flashes' },
  { id: '87', title: 'Yawning (نعاس)', detail: 'Waist-Up, huge yawn covering mouth, extremely tired eyes looking at camera, Dim bedroom lighting' },
  { id: '88', title: 'Starstruck (انبهار بالنجم)', detail: 'Waist-Up, hands clasped under chin, sparkly enamored eyes looking at camera, Dreamy soft focus' },
  { id: '89', title: 'Vomiting (غثيان مجازي)', detail: 'Waist-Up, puffing cheeks holding breath, extremely nauseous look at camera, Sickly greenish tint' },
  { id: '90', title: 'Zen (سلام داخلي)', detail: 'Waist-Up, hands in praying mudra, eyes closed, extremely peaceful serene expression, Pure white lighting' },

  // Session 10: High-Value Formats
  { id: '91', title: 'Who Me? (من أنا؟)', detail: 'Waist-Up, pointing at own chest with thumbs, surprised "did I do that?" look, Studio lighting' },
  { id: '92', title: 'Heartbroken (حزن عميق)', detail: 'Waist-Up, tears streaming down face, looking hopelessly into camera, Dark moody lighting' },
  { id: '93', title: 'Mind Control (مسيطر عليه)', detail: 'Waist-Up, glowing eyes, stiff robotic posture, emotionless stare at camera, Purple Sci-Fi lighting' },
  { id: '94', title: 'Sneaking (تسلل وازعاج)', detail: 'Waist-Up, tiptoeing posture, finger on lips, sneaky comical look at camera, Shadowy lighting' },
  { id: '95', title: 'Gasp! (شهقة عميقة)', detail: 'Waist-Up, inhaling sharply, hands clutching throat in shock, High contrast black and white styling' },
  { id: '96', title: 'It\'s Over (النهاية المحتومة)', detail: 'Waist-Up, drawing a finger across the throat in a "cut" gesture, serious dark look, Red background' },
  { id: '97', title: 'Roaring (زئير/انتصار ضخم)', detail: 'Waist-Up, head tilted back roaring/screaming in pure victory, intense flexed muscles, Stadium lighting' },
  { id: '98', title: 'Shy / Bashful (خجل)', detail: 'Waist-Up, looking slightly downwards through eyelashes, gentle shy smile at camera, Soft pink lighting' },
  { id: '99', title: 'Begging (لا أرجوك)', detail: 'Waist-Up, both hands reaching out desperately to the camera, terrified fearful look, Action movie lighting' },
  { id: '100', title: 'The Matrix (توقف الزمن)', detail: 'Waist-Up, dodging backwards dramatically, intense focused stare, Green code neon lighting' },

  // Session 11: Professions & Action
  { id: '101', title: 'Hacker (اختراق)', detail: 'Waist-Up, furiously typing on a glowing keyboard, green matrix code reflection on face, Dark room' },
  { id: '102', title: 'Gamer Rage (غضب الألعاب)', detail: 'Waist-Up, throwing a game controller, screaming at screen, intense red RGB lighting' },
  { id: '103', title: 'Rich CEO (مدير غني)', detail: 'Waist-Up, straightening a luxurious tie, arrogant confident smile, Penthouse city view background' },
  { id: '104', title: 'Mad Scientist (عالم مجنون)', detail: 'Waist-Up, holding a glowing chemical flask, laughing maniacally, Chaotic lab setting' },
  { id: '105', title: 'Detective (مفتش)', detail: 'Waist-Up, looking closely at a glowing clue, sharp trench coat vibe, Noir dramatic lighting' },
  { id: '106', title: 'Ninja (تخفي)', detail: 'Waist-Up, holding two fingers near mouth in a jutsu pose, stealthy look, Dark blue moonlight' },
  { id: '107', title: 'Astronaut (تائه بالفضاء)', detail: 'Waist-Up, wearing space suit, reaching out weightlessly, Cosmic starry lighting' },
  { id: '108', title: 'Superhero Landing (هبوط خارق)', detail: 'Waist-Up, looking up fiercely, debris flying around, Epic cinematic backlighting' },
  { id: '109', title: 'Gladiator (مقاتل)', detail: 'Waist-Up, holding a shield, battle-worn dirty face, Colosseum sand warm lighting' },
  { id: '110', title: 'Zombie Survivor (رعب)', detail: 'Waist-Up, looking over shoulder in fear, holding a baseball bat, Greenish post-apocalyptic light' },

  // Session 12: Comedy & Mishaps
  { id: '111', title: 'Cooking Disaster (مطبخ فوضوي)', detail: 'Waist-Up, face covered in flour, holding a burnt pan, shocked expression, Kitchen lighting' },
  { id: '112', title: 'Caught in Rain (مبلل)', detail: 'Waist-Up, shivering holding a broken umbrella, annoyed sad face, Moody blue rain lighting' },
  { id: '113', title: 'Tired Worker (إرهاق العمل)', detail: 'Waist-Up, face planted on desk or surrounded by papers, gray depressed lighting' },
  { id: '114', title: 'Brain Freeze (تجميد الدماغ)', detail: 'Waist-Up, clutching head after drinking something cold, exaggerated painful freeze expresson, Bright lighting' },
  { id: '115', title: 'Lost Directions (توهان)', detail: 'Waist-Up, holding a huge map upside down, extremely confused look, Sunny outdoor lighting' },
  { id: '116', title: 'Sneezing (عطسة مدمرة)', detail: 'Waist-Up, captured mid-sneeze, highly comical flying spittle, Flash photography style' },
  { id: '117', title: 'Spilled Coffee (سكب القهوة)', detail: 'Waist-Up, jumping back as coffee spills from a cup, horrified look, Morning office light' },
  { id: '118', title: 'Too Hot! (حار جداً)', detail: 'Waist-Up, violently fanning mouth with hand, sweating, Red warm lighting' },
  { id: '119', title: 'Tangled (متشابك)', detail: 'Waist-Up, hopelessly tangled in glowing holiday lights, deadpan stare at camera, Colorful neon dots' },
  { id: '120', title: 'Wind Blown (عاصفة)', detail: 'Waist-Up, face distorted by extreme wind, holding onto a pole, Stormy grayish lighting' },

  // Session 13: Fantasy & Sci-Fi
  { id: '121', title: 'Vampire (مصاص دماء)', detail: 'Waist-Up, wiping a drop of blood from lip, baring fangs maliciously, Gothic red and black lighting' },
  { id: '122', title: 'Jedi Knight (مقاتل ليزر)', detail: 'Waist-Up, holding a glowing lightsaber, intense focus, Neon blue and red clash lighting' },
  { id: '123', title: 'Time Traveler (مسافر)', detail: 'Waist-Up, stepping out of a glowing portal, confused look at modern surroundings, Vaporwave lighting' },
  { id: '124', title: 'Wizard (ساحر)', detail: 'Waist-Up, casting a spell with a glowing staff, wind blowing, Magical purple particles' },
  { id: '125', title: 'Cyborg (نصف آلي)', detail: 'Waist-Up, revealing a glowing robotic eye, emotionless stare, High-tech synthwave lighting' },
  { id: '126', title: 'Alien Contact (تواصل)', detail: 'Waist-Up, looking up at a blinding UFO light, awestruck expression, Cyan beam from above' },
  { id: '127', title: 'Ghost Hunter (صائد أشباح)', detail: 'Waist-Up, holding an EMF meter, terrified wide eyes, Green night-vision styling' },
  { id: '128', title: 'Dragon Tamer (تنين)', detail: 'Waist-Up, looking at a small glowing dragon on shoulder, warm fiery orange lighting' },
  { id: '129', title: 'Post-Apocalypse (نهاية العالم)', detail: 'Waist-Up, wearing a gas mask (half off), dusty environment, Orange toxic haze' },
  { id: '130', title: 'VR Player (واقع افتراضي)', detail: 'Waist-Up, lifting a VR headset halfway, mind-blown expression, Digital grid reflection' },

  // Session 14: Elements & Power
  { id: '131', title: 'Firebender (سيد النار)', detail: 'Waist-Up, holding a fireball in hand, aggressive confident smirk, Intense fiery illumination' },
  { id: '132', title: 'Waterbender (سيد الماء)', detail: 'Waist-Up, gracefully controlling a floating sphere of water, calm expression, Cool aqua lighting' },
  { id: '133', title: 'Earthquake (زلزال)', detail: 'Waist-Up, trying to balance as the ground shakes violently, motion blur, Gritty brown tones' },
  { id: '134', title: 'Ice King (جليد)', detail: 'Waist-Up, exhaling frosty breath, cold piercing stare, Freezing blue lighting with snowflakes' },
  { id: '135', title: 'Lightning Speed (سرعة برق)', detail: 'Waist-Up, surrounded by yellow static electricity, dynamic action pose, Flashy strobe lighting' },
  { id: '136', title: 'Levitation (طيران)', detail: 'Waist-Up, floating inches off the ground, relaxed meditating pose, Divine golden halo lighting' },
  { id: '137', title: 'Invisibility (اختفاء)', detail: 'Waist-Up, looking at transparent glowing hands in shock, Sci-Fi containment light' },
  { id: '138', title: 'Mind Reader (تخاطر)', detail: 'Waist-Up, pressing fingers to temples, intensely focused and pained expression, Psychic pink waves' },
  { id: '139', title: 'Nature Aura (قوة الطبيعة)', detail: 'Waist-Up, glowing vines growing around arms, peaceful smile, Majestic green forest lighting' },
  { id: '140', title: 'Shadow Master (سيد الظل)', detail: 'Waist-Up, melting into pure darkness, glowing sinister white eyes, Pitch black contrast' },

  // Session 15: Vintage & Influencer
  { id: '141', title: '1920s Mafia (مافيا كلاسيك)', detail: 'Waist-Up, smoking a cigar (if appropriate) or fixing suspenders, fedora style, Sepia vintage tone' },
  { id: '142', title: '80s Disco (ديسكو ريترو)', detail: 'Waist-Up, pointing finger up in a dance move, huge sunglasses, Retro neon pink/teal lighting' },
  { id: '143', title: 'Vlogger (مدون فيديو)', detail: 'Waist-Up, holding a camera on a stick, overly energetic fake smile, Ring light reflection in eyes' },
  { id: '144', title: 'Unboxing (فتح صندوق)', detail: 'Waist-Up, peering into a glowing open box, jaw dropping, Golden glow illuminating face' },
  { id: '145', title: 'Eating Someting Gross (أكل سيء)', detail: 'Waist-Up, examining a weird bug on a fork, extremely grossed out, Harsh stark lighting' },
  { id: '146', title: 'Winner Check (شيك ضخم)', detail: 'Waist-Up, holding a massively oversized check, crying tears of joy, Confetti falling' },
  { id: '147', title: 'Silent Treatment (تجاهل)', detail: 'Waist-Up, looking away with arms crossed, stubbornly ignoring the camera, Cold blue lighting' },
  { id: '148', title: 'Gym Flex (استعراض عضلات)', detail: 'Waist-Up, kissing bicep or flexing hard, vain expression, Hard overhead gym lighting' },
  { id: '149', title: 'Lost Ticket (تذكرة ضائعة)', detail: 'Waist-Up, violently patting all pockets searching for something, panicked look, Train station lighting' },
  { id: '150', title: 'The Masterpiece (جنون العظمة)', detail: 'Waist-Up, kissing fingers in chef-kiss, looking at an invisible painting, Louvre museum lighting' },

  // Session 16: Creator & Gaming
  { id: '151', title: 'Gaming Rage (غضب الألعاب)', detail: 'Waist-Up, screaming mid-match, crushing a gaming controller, aggressive pose, Red gaming setup glow' },
  { id: '152', title: 'Whisper Secret (سر وهمس)', detail: 'Waist-Up, hand cupped over mouth whispering sideways, conspiratorial smile, Dim ambient bedroom' },
  { id: '153', title: 'Streamer Hype (حماس البث)', detail: 'Waist-Up, wearing sleek gaming headset, pointing excitedly at viewer, Neon magenta RGB background' },
  { id: '154', title: 'Giveaway Victory (هدية فائزة)', detail: 'Waist-Up, holding a handful of shiny gift cards, huge toothy smile, Bright lime-green lighting' },
  { id: '155', title: 'Tech Review (مراجعة تقنية)', detail: 'Waist-Up, analyzing a glowing transparent device in palm, focused eyes, High-tech testing lab atmosphere' },
  { id: '156', title: 'Genius Equation (معادلة مستحيلة)', detail: 'Waist-Up, virtual neon math equations floating in air, finger tracing formula, self-confident smirk, Cyber cyan light' },
  { id: '157', title: 'Goal Overload (تحقيق الهدف)', detail: 'Waist-Up, digital sparkles and confetti falling on face, arms wide in triumph, festive RGB gaming grid' },
  { id: '158', title: 'Quiet ASMR (همس هادئ)', detail: 'Waist-Up, wearing headphones, leaning close to a dual-capsule microphone, tranquil serene smile, Soft candle lit mood' },
  { id: '159', title: 'Troll Wink (غمزة ساخرة)', detail: 'Waist-Up, winking with dynamic tongue-out and double peace signs, playful high-contrast colorful backlighting' },
  { id: '160', title: 'Mechanical Overdrive (سرعة خارقة)', detail: 'Waist-Up, hands hovering blurs over a glowing RGB custom keyboard, highly intense focus stare, monitor blue glaze' },

  // Session 17: Mystery & Intrigue
  { id: '161', title: 'Detective Eye (عين المحقق)', detail: 'Waist-Up, peering directly through a large wooden magnifying glass, one highly detailed large eye, warm library lamps' },
  { id: '162', title: 'System Intruder (مخترق الأنظمة)', detail: 'Waist-Up, dark hoodie, glowing lines of green code scrolling down face and eyes, menacing cyber smile, terminal shadow style' },
  { id: '163', title: 'Illuminati Meme (عين المؤامرة)', detail: 'Waist-Up, forming a triangle gesture with fingers over one eye, mysterious smirk, dark ambient temple gold light' },
  { id: '164', title: 'Covert Earpiece (عميل سري)', detail: 'Waist-Up, hand adjusting covert earpiece, looking over shoulder alertly, neon-colored rain-soaked street backlighting' },
  { id: '165', title: 'Buried Treasure (كنز قديم)', detail: 'Waist-Up, blowing dust off an ancient gold medallion, eyes wide reflecting gold glow, cave torch flickering' },
  { id: '166', title: 'Shady Exchange (اتفاق غامض)', detail: 'Waist-Up, offering a mysterious black envelope with a suspicious gaze, high-contrast black-whilte film noir shadow slats' },
  { id: '167', title: 'Cipher Solved (حل التشفير)', detail: 'Waist-Up, scrolling glowing futuristic virtual hologram symbols around, eureka expression, cyberpunk blue glow' },
  { id: '168', title: 'Behind the Mask (خلف القناع)', detail: 'Waist-Up, dropping a beautiful gold carnival masquerade mask, showing a confident rogue smile, opera theater velvet glow' },
  { id: '169', title: 'Hypnotist (منوم مغناطيسي)', detail: 'Waist-Up, waving fingers forward in swirl waves, wide intense staring eyes, glowing violet spiral light' },
  { id: '170', title: 'Interrogation (كشف الكذب)', detail: 'Waist-Up, pointing suspicious fingers at own eyes then at camera, glaring look, cold white clinical office light' },

  // Session 18: Extreme & Survival
  { id: '171', title: 'Desert Oasis (حر الصحراء)', detail: 'Waist-Up, pulling drenched shirt neck, sweating, dry cracked lips, bright midday sahara sun flare' },
  { id: '172', title: 'Glacial Chill (صقيع الثلج)', detail: 'Waist-Up, thick winter fur hood, real frozen frost on eyelashes, shivering pale skin, blinding snow reflection' },
  { id: '173', title: 'Deep Abyss (أعماق البحار)', detail: 'Waist-Up, wearing scubadiving mask, looking at magical bioluminescent aquatic sparkles, dark underwater cyan depth' },
  { id: '174', title: 'Jungle Path (مستكشف الغابة)', detail: 'Waist-Up, parting large tropical green leaves, weary yet curious look, golden sun beams cutting trees' },
  { id: '175', title: 'Volcano Core (نواة الثوران)', detail: 'Waist-Up, turning head in panic as glowing fire ashes fly, dramatic intense rear orange magma illumination' },
  { id: '176', title: 'Extreme Peak (قمة إفرست)', detail: 'Waist-Up, raising small ice-axe high, triumphant smile despite harsh wind, beautiful high mountain sunset sky' },
  { id: '177', title: 'Zero Gravity (دون جاذبية)', detail: 'Waist-Up, body suspended neutrally, hair slightly floating, looking in pure majesty, metallic space station window viewpoint' },
  { id: '178', title: 'Survival Bat (صائد النجاة)', detail: 'Waist-Up, clutching a rusty bat tightly, dirt and mud on cheeks, hyper-alert defensive gaze, twilight fog' },
  { id: '179', title: 'Nuclear Warning (إنذار نووي)', detail: 'Waist-Up, holding a clicking yellow Geiger counter near face, alarmed eye expression, radioactive neon green smog background' },
  { id: '180', title: 'Dust Storm (عاصفة ترابية)', detail: 'Waist-Up, neck wrapped in desert shemagh scarf, squinting hard through wind, highly detailed flying sand particles, dry gold light' },

  // Session 19: Artistic & Performing
  { id: '181', title: 'Spray Artist (رسام الشارع)', detail: 'Waist-Up, holding a paint spray can, colorful paint splatters on face/hands, proud creative grin, gritty brick alley' },
  { id: '182', title: 'The Perfect Dish (طاهٍ محترف)', detail: 'Waist-Up, wearing white chef hat, making a precise chef kiss gesture with eyes closed in bliss, modern warm kitchen background' },
  { id: '183', title: 'Heavy Metal (عزف صاخب)', detail: 'Waist-Up, screaming mid-performance with hands throwing high rock horns, intense purple concert spotlights' },
  { id: '184', title: 'Card Trick (ملك البطاقات)', detail: 'Waist-Up, hands fanning custom pattern playing cards, enigmatic confident smile, warm stage spotlight' },
  { id: '185', title: 'DJ Drop (منسق الحفل)', detail: 'Waist-Up, hands over large studio headphones, energetic screaming party expression, glowing club laser matrix' },
  { id: '186', title: 'Sculpting Clay (صنع التماثيل)', detail: 'Waist-Up, hands shaping clay statue, focused eyes with clay dust, soft golden studio morning light' },
  { id: '187', title: 'Drama Tragedy (دراما كلاسيكية)', detail: 'Waist-Up, holding a white tragedy theater skull, intense emotional display, dramatic stark key light focus' },
  { id: '188', title: 'Busking Voice (صوت الشارع)', detail: 'Waist-Up, tilting head back singing passionately eyes closed, holding acoustic guitar strap, gas lamp evening cobblestones' },
  { id: '189', title: 'Painter Muse (إلهام الألوان)', detail: 'Waist-Up, holding paint palette and brush, examining canvas with a warm visionary smile, bright art gallery' },
  { id: '190', title: 'Comedy Mic (ستاند آب كوميدي)', detail: 'Waist-Up, holding a grey wireless microphone laughing and pointing forward at audience, warm dark wood comedy bar' },

  // Session 20: Mythical & Overpowered
  { id: '191', title: 'Pharaoh Pharaoh (الفرعون الذهبي)', detail: 'Waist-Up, wearing beautiful golden ancient Egyptian Nemes headpiece, proud majestic posture, deep gold tomb amber lamps' },
  { id: '192', title: 'Zeus Storm (برق الرعد)', detail: 'Waist-Up, hand holding a crackling white lightning bolt, screaming in total godlike power, dramatic dark thunderclouds' },
  { id: '193', title: 'Dark Necromancer (المستحضر الأسود)', detail: 'Waist-Up, hands cradling a glowing green crystal skull, sinister grin, dark shadows with emerald vapor trails' },
  { id: '194', title: 'Solar Rebirth (انبعاث الشمس)', detail: 'Waist-Up, surrounded by epic golden solar flame wings, serene transcendent facial posture, holy blinding light' },
  { id: '195', title: 'Freezing Golem (عملاق صقيعي)', detail: 'Waist-Up, shoulders/arms forming spikes of neon blue ice, glowing snow-white eyes, freezing winter blizzard aura' },
  { id: '196', title: 'Grid Overlord (ملك الشبكة)', detail: 'Waist-Up, glowing white-blue cybernetic lines on jaw and cheeks, eyes fully blank blue, virtual scrolling data matrix' },
  { id: '197', title: 'Golden Touch (لمسة ميداس)', detail: 'Waist-Up, staring down in absolute marvel at own hands turning into sparkling solid gold, bright golden refraction rays' },
  { id: '198', title: 'Chrono Weaver (حائك الوقت)', detail: 'Waist-Up, holding a glowing old pocket watch, background frozen completely monochrome, main subject fully vibrant' },
  { id: '199', title: 'Cosmic Ascending (صعود كوني)', detail: 'Waist-Up, head/hair surrounded by colorful swirling galaxy dust and shooting stars, eyes closed meditating, deep dark space' },
  { id: '200', title: 'God Aura (الهالة المطلقة)', detail: 'Waist-Up, glowing concentric red and blue energy rings radiating from palms, triumphant victory smile, spectacular divine glow' },

  // Session 21: Glory & Victory Awards (البطولات والجوائز الذهبية)
  { id: '201', title: 'Championship Kiss (تقبيل الكأس الأسطورية)', detail: 'Waist-Up authentic sports photograph, kissing a highly-detailed heavy silver champions club trophy, eyes shut in deep emotion, colorful team ribbons attached, bright falling confetti, spectacular night stadium floodlights spotlight.' },
  { id: '202', title: 'Gold Winner Medal (الميدالية الذهبية بابتسامة)', detail: 'Waist-Up commercial sports portrait, holding a gleaming heavy gold winner\'s medal on a ribbon in hands, looking at it with a proud satisfied smile, realistic sweat droplets on skin, professional soccer pitch backdrop.' },
  { id: '203', title: 'Ballon d\'Or Prestige (الكرة الذهبية الفاخرة)', detail: 'Waist-Up prestigious award photo, holding a sparkling high-fidelity gold soccer ball trophy (Ballon d\'Or), wearing a modern styled black-tie tuxedo with satin lapels, emotional shining eyes, elegant gala stage background.' },
  { id: '204', title: 'Champions Ring (خاتم البطولة الفخم)', detail: 'Waist-Up photo, holding hand close to camera showing a large diamond-encrusted championship ring, confident facial expression, glowing stadium lights blurred beautifully in background.' },
  { id: '205', title: 'Golden Boot Pride (جائزة الحذاء الذهبي)', detail: 'Waist-Up realistic award portrait, lifting a detailed gold football boot trophy (Golden Boot) proudly, smiling with absolute self-confidence, glossy sports press-wall with sponsor logos.' },
  { id: '206', title: 'Best Player Award (أفضل لاعب في المباراة)', detail: 'Waist-Up studio portrait, holding a glass and gold "Man of the Match" trophy, subtle wink and smile, looking confident, wearing a professional athletic sports jersey.' },
  { id: '207', title: 'Trophy Over Head (رفع الكأس عالياً)', detail: 'Waist-Up dynamic perspective, raising a silver cup trophy high above head with both hands, shouting in triumph, sports jersey, premium sports photography, stadium lights.' },
  { id: '208', title: 'Medal Bite (عض الميدالية بثقة)', detail: 'Waist-Up candid sports portrait, biting the edge of a shiny gold medal draped around neck, confident gaze, sweat glinting on face, damp hair, dramatic soccer field lighting.' },
  { id: '209', title: 'The Champion\'s Tear (دموع الفوز الأغلى)', detail: 'Waist-Up emotional sports portrait, crying tears of joy while clutching a winner\'s medal close to chest, eyes closed, intense mood, misty football field landscape.' },
  { id: '210', title: 'Cup Hug (احتضان الكأس بنوم)', detail: 'Waist-Up cozy locker-room style candid photo, hugging the massive silver trophy close like a baby, warm happy closed-eyes smile, professional club bench background.' },

  // Session 22: Match-day Fire & Intensity (حماس ونيران الملعب)
  { id: '211', title: 'Focused Gladiator (تركيز الوحش قبل الصافرة)', detail: 'Waist-Up dramatic sports photograph, breathing heavily with chest expanded, eyes locked intensely forward with supreme focus, sweat dripping off skin, misty evening stadium, dynamic floodlights.' },
  { id: '212', title: 'The Winner Scream (صرخة الهدف القاتل)', detail: 'Waist-Up dynamic photo, face tensed in an epic scream of pure passion, vocal veins visible on neck, hands gripping the collar of a high-tech athletic shirt, green pitch field blurred in sports bokeh.' },
  { id: '213', title: 'VAR Prayer (ترقب ودعاء ركلة الجزاء)', detail: 'Waist-Up emotional soccer portrait, hands pressed together under chin in desperate prayer, eyes squeezed shut tight in extreme anxiety, misty background of stadium spotlights.' },
  { id: '214', title: 'Disbelief Agony (صدمة ضياع الهجمة)', detail: 'Waist-Up candid, both hands clutching cheeks and hair, jaw wide open in utter disbelief and shock, staring forward, damp skin, high shutter speed action shot.' },
  { id: '215', title: 'Fist Pump Rush (اندفاع الانتصار)', detail: 'Waist-Up action capture, screaming with a powerful clenched fist pumped in front of chest, flexed arm muscles, intense warrior expression, stadium night lights.' },
  { id: '216', title: 'Slide Celebration (زحلقة ركبتين كلاسيكية)', detail: 'Waist-Up portrait, upper body slightly leaning back with arms wide open in triumph, realistic green grass and turf particles flying in the air, evening match floodlights.' },
  { id: '217', title: 'Injured Battle (الإصرار رغم الألم)', detail: 'Waist-Up gritty sports photo, looking down with closed eyes showing endurance and strength, water droplets on neck, wearing an athletic jersey with subtle grass stains.' },
  { id: '218', title: 'Referee Argument (احتجاج شرس)', detail: 'Waist-Up realistic action shot, protesting aggressively with wide eyes and an open hand gesture, pointing down at the pitch, dynamic facial lines with sweat, intense game mood.' },
  { id: '219', title: 'The Goalie Save (قفازات الحارس الحاسم)', detail: 'Waist-Up professional soccer portrait, wearing high-density neon goalkeeper gloves, punching fists together with extreme focus, goal net grid outlined behind under sharp cold floodlights.' },
  { id: '220', title: 'Pre-match Tunnel (ممر دخول اللاعبين الغامض)', detail: 'Waist-Up cinematic frame, standing in a dark, high-contrast concrete player stadium tunnel, looking forward with a serious, cold, razor-focused warrior gaze, tunnel ceiling lights.' },

  // Session 23: Iconic Celebrations (طرق احتفالية وبصمات شهيرة)
  { id: '221', title: 'The Calm Down (هدوء كالما كراما)', detail: 'Waist-Up sports portrait, pushing palms downward in the iconic "Calm Down" gesture, wearing a smug self-assured expression, soccer pitch turf with blurred hostile crowds.' },
  { id: '222', title: 'Minds Focus (تركيز راشفورد العقلي)', detail: 'Waist-Up action photo, pointing one index finger directly to temple, eyes closed in complete zen-like concentration, tranquil focused face, deep shadow sports lighting.' },
  { id: '223', title: 'Crown Wear (تتويج الملك الذاتي)', detail: 'Waist-Up creative sports pose, gesturing with hands above head to place an invisible, imaginary crown, happy self-satisfied smile, warm stadium glow.' },
  { id: '224', title: 'Arms Folded Swag (ثقة مبابي العصرية)', detail: 'Waist-Up modern sports photo, arms folded firmly across chest with thumbs tucked in armpits, chin tilted up with a super confident smug grin, professional league lighting.' },
  { id: '225', title: 'Kiss the Emblem (تقبيل الشعار والولاء)', detail: 'Waist-Up portrait, gripping and kissing the team crest/emblem badge on chest, eyes closed with passionate loyalty, cinematic night stadium glow.' },
  { id: '226', title: 'Phone Mocking (رنين الهاتف الساخر)', detail: 'Waist-Up candid, mimicking a phone call with hand by ear, shouting joyfully with a mocking playful expression, high-contrast matchday spotlight.' },
  { id: '227', title: 'Ice in Veins (برود الدماء والشرايين)', detail: 'Waist-Up photo, pointing index finger directly to the veins of opposite wrist, cold stoic indifferent facial expression, icy blue stadium lighting backdrop.' },
  { id: '228', title: 'Heart Fingers (قلب الحب للجماهير)', detail: 'Waist-Up warm photo, forming a heart shape with fingers near eyes, smiling warmly, stadium lights reflecting in eyes, highly comforting atmosphere.' },
  { id: '229', title: 'Yoga Pose Zen (هدوء هالاند الإلهي)', detail: 'Waist-Up serene portrait, fingers in classic gyan mudra meditation posture, eyes closed with a peaceful zen-like smile, green matchday pitch background.' },
  { id: '230', title: 'Savage Tongue (التحليق والاحتفال الجنوني)', detail: 'Waist-Up dynamic photo, running with arms outstretched like wings, tongue sticking out playfully with a wide chaotic grin, energetic sports capture.' },

  // Session 24: Transfer Market Leaks & Reveals (سوق الانتقالات والإعلانات)
  { id: '231', title: 'Fabrizio\'s "Here We Go" (هنا نذهب الأيقونية)', detail: 'Waist-Up official transfer portrait, pointing both index fingers directly at camera with a trademark confident smirk, colorful news studio backdrop with digital soccer transfer graphics.' },
  { id: '232', title: 'Club Jersey Present (تقديم قميص النادي الجديد)', detail: 'Waist-Up official PR reveal photo, holding a brand-new vibrant club jersey stretched proudly between hands, posing against a clean media press-conference backdrop with cameras flashing.' },
  { id: '233', title: 'Medical Passed (اجتياز الفحص الطبي)', detail: 'Waist-Up candid, giving a reassuring thumbs-up with a happy smile while a professional doctor stethoscope is on chest, clean modern private clinic setting.' },
  { id: '234', title: 'Signing the Contract (توقيع عقد الانتقال)', detail: 'Waist-Up professional PR shot, holding a high-end luxury pen signing an official multi-million dollar contract document on a premium mahogany table, elegant club boardroom background.' },
  { id: '235', title: 'Leaked Secret Lunch (تسريبات ومطاردة الكاميرات)', detail: 'Waist-Up candid paparazzi raw style photograph, whispering secrets behind hand at a high-end private restaurant table, low-contrast subtle vintage grain, mystery lunch leak vibes.' },
  { id: '236', title: 'Agent Midnight Call (مكالمة وكيل الأعمال الطارئة)', detail: 'Waist-Up dramatic office photo, phone pressed to ear with a shocked wide-open mouth, looking intensely at a laptop screen showing sports transfer contracts, illuminated modern penthouse office.' },
  { id: '237', title: 'Turned Down Offer (عرض مرفوض)', detail: 'Waist-Up business-sports photo, pushing away a thick contract dossier document folder with a proud, self-satisfied smug smile, luxury executive lounge.' },
  { id: '238', title: 'Private Jet Travel (طائرة النادي الخاصة)', detail: 'Waist-Up glamorous photo, wearing premium dark sunglasses and a sport cap inside a luxurious private jet private flight cabin, looking out the hatch window, gold sunset lighting.' },
  { id: '239', title: 'Signing the Jersey (التوقيع للجماهير)', detail: 'Waist-Up candid, signing a fan\'s black marker on a sports jersey, warm smile, surrounded by soft dynamic stadium fan crowds.' },
  { id: '240', title: 'Deal Collapsed (فشل المفاوضات في اللحظة الأخيرة)', detail: 'Waist-Up heavy mood portrait, head resting on both hands over a messy pile of legal papers on a dark desk, looking completely exhausted and burnt out under single desk lamp illumination.' },

  // Session 25: Matchday Tactical Drama (تكتيكات ودقة خطط اللعب)
  { id: '241', title: 'Tactical Board Vision (العبقري وحجر المغناطيس)', detail: 'Waist-Up creative portrait, pointing a black dry-erase marker at a tactical soccer magnetic layout whiteboard, intense focused expression, sharp coach look.' },
  { id: '242', title: 'Mastermind Tap (ذكاء وقراءة الخصم)', detail: 'Waist-Up smart portrait, tapping side of temple with index finger, narrow analytical smiling eyes, classic chalkboard filled with advanced tactical formulas.' },
  { id: '243', title: 'Sideline Yell (توجيهات خط التماس الشتوية)', detail: 'Waist-Up dynamic action photo, cupping hands around mouth shouting tactical advice, wearing an elegant dark designer puff jacket, heavy rain droplets glinting under touchline floodlights.' },
  { id: '244', title: 'Logbook Scribble (تدوين الملاحظات السرية)', detail: 'Waist-Up focused portrait, writing intensely in a small black leather notebook, sharp intellectual eyeglasses, blurry soccer pitch background under night floodlights.' },
  { id: '245', title: 'Baffled Coach (ذهول وغضب تكتيكي)', detail: 'Waist-Up dramatic candid, hands clutching cheeks with an open mouth displaying shock and disappointment at a crucial match mistake, dark sports bench backdrop.' },
  { id: '246', title: 'Elegant Suit Smile (المدرب الأنيق الهادئ)', detail: 'Waist-Up premium PR photo, adjusting cuff-links of a precise custom tailored black Italian suit, sophisticated subtle smile, modern professional club tunnel.' },
  { id: '247', title: 'Tactical Earpiece (سماعة تواصل المساعدين)', detail: 'Waist-Up sports portrait, touching a wireless ear communication earpiece while looking intensely at the pitch, serious analytical face, cold stadium evening light.' },
  { id: '248', title: 'Water Bottle Slam (الغضب والاندفاع الكروي)', detail: 'Waist-Up action photo, throwing a water bottle down in frustration, realistic water droplets spraying, face contorted in passion and drive.' },
  { id: '249', title: 'Quiet Command (الهدوء المطبق الحاسم)', detail: 'Waist-Up stoic portrait, holding index finger against lips for a "Silence" gesture, dressed in a luxury executive club trench coat, rain-draped match stadium lights.' },
  { id: '250', title: 'Winning Applause (تصفيق النصر والعبقرية)', detail: 'Waist-Up elegant portrait, slow clapping with a highly proud and respectful self-assured smile, classic stadium dugout atmosphere.' },

  // Session 26: VAR & Referee Crucial Calls (قرارات تحكيمية حاسمة)
  { id: '251', title: 'VAR Screen Hand (إشارة مراجعة الـ VAR)', detail: 'Waist-Up sports action shot, outlining a large virtual TV monitor screen in the air using index fingers, looking highly demanding and absolute, stadium green grass background.' },
  { id: '252', title: 'Red Card Disaster (صدمة الكارت الأحمر المتسرع)', detail: 'Waist-Up dramatic photo, begging with both hands joined together in desperation, look of pleading innocence while card reflection shines on sweat-drenched skin, dark night stadium.' },
  { id: '253', title: 'Heated Confrontation (مواجهة الحكم وجهاً لوجه)', detail: 'Waist-Up high-tension close up, arguing passionately with eyes wide open and pointing a finger firmly down, heavy perspiration on neck and face, high contrast sports bokeh.' },
  { id: '254', title: 'Offside Cancelled (حسرة إلغاء الهدف)', detail: 'Waist-Up tragic sports photo, staring blankly with hands on hips, looking up in complete disbelief at the stadium scoreboard after VAR offside cancellation, misty wet pitch.' },
  { id: '255', title: 'Claiming Handball (المطالبة بلمسة يد)', detail: 'Waist-Up action shot, shouting with wide desperate eyes while pointing frantically at forearm to claim a handball, dramatic cold matchday illumination.' },
  { id: '256', title: 'Wall Block Fear (القلق خلف الجدار البشري)', detail: 'Waist-Up sports capture, hands defensively joined in a classic free-kick human wall stance, squinting nervous eyes, night sports arena floodlights.' },
  { id: '257', title: 'Stop Watch Check (التدقيق في الوقت الضائع)', detail: 'Waist-Up candid, pointing aggressively to wrist stopwatch while arguing with fourth official, intense demanding face, rainy dugout environment.' },
  { id: '258', title: 'Yellow Warning (تحذير كارت أصفر ساخر)', detail: 'Waist-Up sports photograph, wearing a mocking sarcastic grin while accepting a yellow card warning, hands on hips, stadium crowd blurred in background.' },
  { id: '259', title: 'Foul Defense (الدفاع ببلائة وبراءة)', detail: 'Waist-Up portrait, holding hands wide open in complete shock as if saying "I did not touch him!", extremely authentic sweat, sports jersey.' },
  { id: '260', title: 'Goal Line Technology (ترقب خط المرمى الحاسم)', detail: 'Waist-Up tense reaction shot, staring with a frozen anxious face down down at wrist smartwatch waiting for signal, dramatic goalposts under night lights.' },

  // Session 27: Fans & Ultras Passion (جنون الأولتراس والمدرجات)
  { id: '261', title: 'Smoke Flare Pride (لهب الأولتراس المشتعل)', detail: 'Waist-Up highly atmospheric candid photograph, holding a burning crimson red marine flare high in one hand, glowing red fumes casting deep shadows on face, intense fanatical expression, packed stadium tiers.' },
  { id: '262', title: 'Megaphone Leader (قائد رابطة التشجيع)', detail: 'Waist-Up passionate photo, screaming chants into a metal megaphone with veins showing on neck, leading the stadium fans, colorful club banners draped behind.' },
  { id: '263', title: 'Scarf Raised High (رفع الشال فخراً وشغفاً)', detail: 'Waist-Up epic fan portrait, holding a knitted vintage team scarf fully stretched above head with both hands, shouting with wide open eyes of ultimate passion, sports floodlights reflection.' },
  { id: '264', title: 'Tearing Bet Ticket (حسرة كوبون التوقعات الخاسر)', detail: 'Waist-Up dramatic sports bar candid, tearing an official match betting slip paper in half, screaming at a mobile phone screen in complete rage and agony, retro sports bar background.' },
  { id: '265', title: 'Crest Tattoo Pride (ولاء الوشم للأبد)', detail: 'Waist-Up realistic close-up portrait, pulling jersey shoulder back proudly to reveal a detailed sports club logo tattoo on skin, deep loyal confident gaze.' },
  { id: '266', title: 'Retro Kit Nostalgia (قميص الزمن الجميل العتيق)', detail: 'Waist-Up warm vintage portrait, hugging a classic 90s legendary soccer jersey close with closed eyes, soft nostalgic emotional smile, vintage stadium lens style.' },
  { id: '267', title: 'Match Day Anxiety (عض الشال بقمة التوتر)', detail: 'Waist-Up nervous portrait, biting down on edge of team scarf, wide anxious eyes watching a tense penalty shootout, misty cold stadium atmosphere.' },
  { id: '268', title: 'Screaming Fanatic (صرخة حب مجنونة بالقميص)', detail: 'Waist-Up explosive raw photo, screaming in high emotional joy while pulling jersey collar forward, face paint stripes on cheeks, glowing evening stadium background.' },
  { id: '269', title: 'Relegation Heartbreak (دموع هبوط الفريق القاسية)', detail: 'Waist-Up raw teary-eyed portrait, tears rolling down cheeks, hands clutching head in absolute grief and heartbreak of sports defeat, dimly lit rainy stadium bleachers.' },
  { id: '270', title: 'Flags Parade (وسط الأعلام المرفوعة)', detail: 'Waist-Up warm sunlit photo, smiling broadly while massive satin team flags wave behind in a brilliant color blur, golden hour lighting.' },

  // Session 28: Backstage & Locker Rooms (كواليس وغرف ملابس النجوم)
  { id: '271', title: 'Locker Bench Silence (صمت ما قبل الملحمة)', detail: 'Waist-Up introspective portrait, sitting on an elegant wooden locker room bench, hands clasped between knees, looking down with absolute razor-focused silent expression, personalized jersey hung behind.' },
  { id: '272', title: 'Ice Bath Prep (شحن الطاقة في مسبح الثلج)', detail: 'Waist-Up realistic photo, shoulders shivering slightly in a professional metal ice bath tub, focused relaxed facial expression, scientific sports recovery training center.' },
  { id: '273', title: 'Physio Massage (جلسة التأهيل السريعة)', detail: 'Waist-Up candid, resting chin on hands on a massage table getting physical therapy, relaxed tranquil face, modern team medical room with jersey frames.' },
  { id: '274', title: 'Tactical Screen Brief (شرح فيديو حاسم بالآيباد)', detail: 'Waist-Up smart photo, studying video match plays on a glowing digital tablet held in hands, blue light reflecting on focused analytical face, high-tech club lecture room.' },
  { id: '275', title: 'Jersey Name Show (كشف الاسم والقميص الجديد)', detail: 'Waist-Up sports PR photo, turning back to camera looking over shoulder with a smug confident grin, showing custom name and huge classic "10" print on the back of premium jersey.' },
  { id: '276', title: 'Hydration Pause (شرب الماء واستراحة المحارب)', detail: 'Waist-Up close up sports photograph, drinking water from a black plastic sports squeeze bottle with droplets splashing on face and neck, high contrast night game lights.' },
  { id: '277', title: 'Peel Tape Off (نزع لاصق الحماية)', detail: 'Waist-Up candid, looking down peeling off compression athletic tape from wrist, tired but fully satisfied expression, professional locker room backdrop.' },
  { id: '278', title: 'Locker Champ Celebration (فوضى الاحتفال في غرف الملابس)', detail: 'Waist-Up crazy fun photo, covered in champagne foam spraying everywhere, roaring with laughter with a trophy nearby, teammates shadows jumping in background.' },
  { id: '279', title: 'Boot Lace Tie (ربط الحذاء والتحضير للنزول)', detail: 'Waist-Up portrait, looking at camera while tying the laces of a clean modern football boot, confident calm smirk, sleek dressing room bench setup.' },
  { id: '280', title: 'Player of the Century (تكريم أسطورة النادي التاريخي)', detail: 'Waist-Up premium award display, dressed in high-end tuxedo holding a custom framed retro jersey, proud emotional gaze, luxury grand hotel ball-room.' },

  // Session 29: Press, Interviews & Media Wars (المؤتمرات ومواجهة الصحافة)
  { id: '281', title: 'Mic Swarm Defensive (حصار ميكروفونات الصحفيين)', detail: 'Waist-Up intense media capture, standing behind a desk packed with sports microphones, holding palms up defensively, serious focused expression, bright white camera flashes.' },
  { id: '282', title: 'No Comments Stoic (صمت مطبق وتحدي)', detail: 'Waist-Up defiant press photo, arms locked across chest, lips tightly sealed with a cold silent gaze, official league sponsor backdrop wall.' },
  { id: '283', title: 'Sarcastic Press Laugh (ضحكة ساخرة ورأس مائل)', detail: 'Waist-Up candid media photo, laughing heartily pointing a finger at a sports reporter\'s ridiculous question, head tilted back, press conference desk mic.' },
  { id: '284', title: 'Sharp Media Retort (رد ناري مفاجئ)', detail: 'Waist-Up media photo, leaning close to a microphone on table, pointing finger with a sharp confident mock smirk, eyes locked directly, media backdrop.' },
  { id: '285', title: 'Tearing Fake News (تمزيق الصحيفة لتكذيب الإشاعات)', detail: 'Waist-Up dramatic gesture, tearing a sports tabloid newspaper in half, supreme confident smirk, professional media room spotlight.' },
  { id: '286', title: 'Carefree Shrug (اللامبالاة بالمؤتمر والأسئلة)', detail: 'Waist-Up press room photo, shrugging shoulders with open palms and a relaxed smug smile, camera highlights reflecting, sponsor logo pattern wall.' },
  { id: '287', title: 'Whispering Secrets (همس وكواليس المؤتمر الصحي)', detail: 'Waist-Up suspicious media photo, covering mouth with a leather press dossier clipboard, whispering secrets to team official next, sharp shifting gaze.' },
  { id: '288', title: 'Bored Eye Roll (الملل من تكرار الأسئلة)', detail: 'Waist-Up candid, rolling eyes in deep frustration and tilting head back, sitting behind microphone on desk during standard press run.' },
  { id: '289', title: 'Double Thumb Sarcasm (تصفيق لايكات متهكم)', detail: 'Waist-Up sarcastic pose, holding up two thumbs with a cold blank smile, sponsor branding background panels.' },
  { id: '290', title: 'Water Sip Silence (صمت كوب الماء البارد)', detail: 'Waist-Up slow motion close-up, taking a slow sip from a glass of water while staring extremely coldly at a sports reporter, powerful dramatic press pause.' },

  // Session 30: Legacy, Legends & Farewell (الأساطير والاعتزال التاريخي)
  { id: '291', title: 'Golden Ball Presentation (استعراض الجائزة الذهبية للمدرجات)', detail: 'Waist-Up legendary historic photo, holding a sparkling Ballon d\'Or trophy high with both hands towards raining stadium crowd, crying with joy under cold match lighting.' },
  { id: '292', title: 'Unveiling the Legacy (كشف الستار عن التمثال/الكأس)', detail: 'Waist-Up dramatic presentation, pulling a premium black velvet cloth to reveal a glowing shiny first-ever club cup trophy, royal gold reflections on proud face.' },
  { id: '293', title: 'Farewell Wave (تلويحة الاعتزال التاريخية)', detail: 'Waist-Up highly emotional farewell photo, single hand raised waving goodbye to a completely filled stadium at night, tears glistening in eyes, deep blue stadium lights.' },
  { id: '294', title: 'Hall of Fame Legend (قاعة المشاهير الأسطورية)', detail: 'Waist-Up ultra-premium portrait, holding a legendary gold plaque insignia, proud chin up, classic museum background displaying vintage jerseys in illuminated glass cases.' },
  { id: '295', title: 'Shirt Exchange Honor (تبادل القميص التاريخي)', detail: 'Waist-Up genuine sportsmanship photo, holding up a classic historic opponent jersey next to chest with a respectful content smile, pitch floodlights blur.' },
  { id: '296', title: 'The Legend Crowned (تاج الإمبراطور الأعظم)', detail: 'Waist-Up luxury art piece, holding an authentic heavy golden crown designed like soccer nets in palms, serene majestic look of the absolute GOAT, deep cinematic gradients.' },
  { id: '297', title: 'Golden Gloves Hero (قفازات الذهب الأسطورية)', detail: 'Waist-Up hero shot, holding sparkling solid gold goalkeeper gloves high with a triumphant roar, stadium goalposts outlined nicely.' },
  { id: '298', title: 'Record-Breaker Jersey (قميص كسر الرقم القياسي العالمي)', detail: 'Waist-Up proud portrait, holding a framed custom jersey displaying "1000 GOALS", beaming smile of absolute satisfaction, club VIP boardroom.' },
  { id: '299', title: 'Honoring the Rival (ممر شرفي تاريخي)', detail: 'Waist-Up epic sports capture, walking with proud smile through a guard of honor formed by clapping rival team players, bright warm sunshine flare.' },
  { id: '300', title: 'Glory\'s Peak (نهاية القصة الأسطورية)', detail: 'Waist-Up premium final portrait, looking back over shoulder towards an empty glowing pristine stadium field at night, holding matchball under arm, absolute calm fulfillment expression.' },

  // Session 31: Exclusive Mercato & Transfer Reactions (حصريات وانتقالات الميركاتو)
  { id: '301', title: 'Here We Go! (تمت الصفقة رسمياً)', detail: 'Waist-Up dramatic celebratory transfer photo, holding a pristine new blank team jersey with a massive screaming happy face, vibrant club stadium office lighting, celebratory dynamic bokeh effect.' },
  { id: '302', title: 'Signing the Ink (توقيع العقد الكلاسيكي)', detail: 'Waist-Up professional soccer transfer photo, hand holding a luxury golden pen over a clean contract document on a mahogany desk, looking at camera with a confident victorious smile, glowing club VIP media backdrop.' },
  { id: '303', title: 'Exclusive Leak (انفراد حصري)', detail: 'Waist-Up mysterious portrait, holding an official leather document under arm tightly, looking at the camera with a subtle confident wink, sharp studio backdrop with glowing neon orange EXCLUSIVE indicator line.' },
  { id: '304', title: 'Medical Check (الفحص الطبي المعتمد)', detail: 'Waist-Up athletic sports capture, wearing modern chest sensor straps and medical tape, smiling with high energy and double thumbs up, bright sterile ultra-professional football clinic background.' },
  { id: '305', title: 'Landing in the City (هبوط طائرة اللاعب)', detail: 'Waist-Up majestic candid shot, stepping down from an executive private charter jet metal ramp, wearing a cozy designer travel hoodie holding a custom club wool scarf, waving a friendly happy hand, warm evening airport runway spotlights.' },
  { id: '306', title: 'The Boardroom Handshake (مصافحة الرئيس المنتظرة)', detail: 'Waist-Up proud sports photography, shaking hands with an official team representative, both looking at the camera with proud broad smiles, modern luxury club executive lounge displaying a giant lit club emblem on the wall.' },
  { id: '307', title: 'Negotiations Smoke (مفاوضات سرية غامضة)', detail: 'Waist-Up deep-focus candid portrait, sitting in a dark luxury hotel lobby lounge, staring at a lit smartphone screen resting on a polished dark table with narrowed intrigued eyes and a knowing smile, dramatic amber backlighting.' },
  { id: '308', title: 'Rumors Radar (رادار الإشاعات الساخنة)', detail: 'Waist-Up playful media portrait, cupping a hand over ear and leaning forward into the camera with a smug knowing smirk, abstract high-tech soccer grid lines and glowing electronic data wave background.' },
  { id: '309', title: 'Agreement Shattered (انهيار الصفقة الصادم)', detail: 'Waist-Up high-emotion dramatic photo, clutching head with both hands in pure stress and jaw-dropping shock, looking at a buzzing phone on table, stark dark studio room with dramatic crimson red alert spotlighting.' },
  { id: '310', title: 'Agent Whisper (اجتماع وكيل الأعمال السري)', detail: 'Waist-Up spy-thriller candid, whispering urgently into a glowing mobile phone while sliding a confidential folder across a glass table, sleek dark suit, city skyline skyscrapers through rainy high-rise window at night.' },
  { id: '311', title: 'Player Mutiny (الضغط من أجل الرحيل)', detail: 'Waist-Up rebellious portrait, standing with rigid crossed arms, refusing to look at training club gear with a cold defiant expression, misty dramatic stadium pitch background at dusk.' },
  { id: '312', title: 'Breaking Transfer Alert (إنذار عاجل ميركاتو)', detail: 'Waist-Up super high-energy media host shot, pointing intensely and aggressively at the camera with wide excited eyes, background displaying flashing bright red newsroom monitor arrays and digital transfer graphics.' },
  { id: '313', title: 'Loyalty Badge Kiss (تجديد الولاء والعهد)', detail: 'Waist-Up emotional football photo, kissing the club crest on a modern team jersey with closed eyes and a proud tear of devotion, giant stadium filled with thousands of glowing fan torches and blurred flags.' },
  { id: '314', title: 'Behind Boardroom Doors (خلف الأبواب المغلقة)', detail: 'Waist-Up sneaky suspenseful photo, peeking curiously through a slightly cracked heavy solid mahogany conference door, eyes alert and wide with anticipation, soft sliver of executive light illuminating the face.' },
  { id: '315', title: 'New Shirt Unveiled (الكشف عن رقم القميص الجديد)', detail: 'Waist-Up proud back-facing portrait, turning head back over shoulder to smile confidently, showing the back of a pristine team jersey emblazoned with the iconic number "10", professional press studio flash photography.' }
];

const clothingColors = [
  { id: 'none', label: 'تلقائي', value: '', class: 'bg-slate-750 border border-slate-600' },
  { id: 'red', label: 'أحمر', value: 'vibrant red jersey', class: 'bg-red-600' },
  { id: 'blue', label: 'أزرق', value: 'deep clean royal blue jersey', class: 'bg-blue-600' },
  { id: 'black', label: 'أسود', value: 'sleek matte black jersey', class: 'bg-neutral-900 border border-slate-700' },
  { id: 'white', label: 'أبيض', value: 'pure white jersey', class: 'bg-white text-slate-900' },
  { id: 'yellow', label: 'أصفر', value: 'bright yellow jersey', class: 'bg-yellow-500' },
  { id: 'green', label: 'أخضر', value: 'rich grass green jersey', class: 'bg-green-600' },
  { id: 'orange', label: 'برتقالي', value: 'electric orange jersey', class: 'bg-orange-500' },
  { id: 'purple', label: 'بنفسجي', value: 'luxurious deep purple jersey', class: 'bg-purple-600' }
];

interface ThumbnailFilter {
  id: string;
  name: string;
  nameAr: string;
  filterCss: string;
  description: string;
  tag: string;
}

const thumbnailFilters: ThumbnailFilter[] = [
  { id: 'none', name: 'Original', nameAr: 'بدون فلتر', filterCss: 'none', description: 'الصورة السينمائية بتوزيع ألوانها الطبيعي.', tag: 'الوضع الأصلي 📷' },
  { id: 'ctr_boost', name: 'Saturation Boost', nameAr: '🔥 سوبر تشبع (لجذب النقرات)', filterCss: 'saturate(1.6) contrast(1.15) brightness(1.05)', description: 'ألوان ساطعة وفائقة الوضوح تبرز على تيشيرتات اللاعبين وتجذب عين المشاهد في يوتيوب.', tag: 'عالي الجاذبية 📈' },
  { id: 'hdr_sports', name: 'HDR Sports', nameAr: '⚡ تباين رياضي HDR (قوي)', filterCss: 'contrast(1.35) saturate(1.25) brightness(0.98)', description: 'إضاءة تباينية دراماتيكية قوية تبرز ملامح الوجه وتفاصيل الرياكشن بشكل حاد ومحترف.', tag: 'تفاصيل حادة 🏆' },
  { id: 'neon_amber', name: 'Neon Amber', nameAr: '🌟 توهج ميركاتو ذهبي', filterCss: 'contrast(1.1) saturate(1.2) sepia(0.18) hue-rotate(-8deg) brightness(1.02)', description: 'تدرج دافئ يعطي أخبار الميركاتو الحصرية طابع العناوين الصحفية العاجلة والذهبية.', tag: 'حصري ميركاتو ✈️' },
  { id: 'cool_ice', name: 'Cool Ice', nameAr: '❄️ البرودة الدراماتيكية', filterCss: 'hue-rotate(12deg) contrast(1.18) saturate(1.2) brightness(0.96)', description: 'لون أزرق جليدي غامض يتناسب مع الأخبار المتوترة أو الصادمة ومفاوضات منتصف الليل.', tag: 'غموض وتوتر 🥶' },
];

const getFilterCss = (filterId?: string): string => {
  if (!filterId) return 'none';
  const f = thumbnailFilters.find(x => x.id === filterId);
  return f ? f.filterCss : 'none';
};

// IndexedDB configuration to store large generated base64 images and prevent localStorage QuotaExceededError
const DB_NAME = 'IdentityLockDB';
const STORE_NAME = 'GeneratedImages';
const DB_VERSION = 1;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

function saveImageToDB(id: string, base64Data: string): Promise<void> {
  return getDB().then(db => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(base64Data, id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }).catch(err => {
    console.error('Error saving image to IndexedDB', err);
  });
}

function loadImageFromDB(id: string): Promise<string | null> {
  return getDB().then(db => {
    return new Promise<string | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }).catch(err => {
    console.error('Error loading image from IndexedDB', err);
    return null;
  });
}

function deleteImageFromDB(id: string): Promise<void> {
  return getDB().then(db => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }).catch(err => {
    console.error('Error deleting image from IndexedDB', err);
  });
}


export default function App() {
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  
  // Load initial frames with metadata from localStorage (ignoring huge base64 strings)
  const [frames, setFrames] = useState<Frame[]>(() => {
    try {
      // Clear the legacy key to immediately free up space if the user previously got QuotaExceededError
      localStorage.removeItem('identityLockGeneratedFrames_v2');
    } catch {}

    try {
      const saved = localStorage.getItem('identityLockGeneratedFrames_v3_meta');
      if (saved) {
        const parsed = JSON.parse(saved);
        return initialFrames.map(f => {
          const match = parsed.find((x: any) => x.id === f.id);
          return match ? { ...f, prompt: match.prompt, selectedFilter: match.selectedFilter } : f;
        });
      }
    } catch (e) {
      console.warn('Could not load saved frames metadata', e);
    }
    return initialFrames;
  });

  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsKeys, setSettingsKeys] = useState<string>(() => localStorage.getItem('identityLockApiKeys') || '');
  const [errorModal, setErrorModal] = useState<{ title: string, message: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>(() => localStorage.getItem('identityLockModel') || 'gemini-3.1-flash-image-preview');
  const [backgroundStyle, setBackgroundStyle] = useState<string>(() => localStorage.getItem('identityLockBgStyle') || 'bokeh');
  const [clothingColor, setClothingColor] = useState<string>(() => localStorage.getItem('identityLockClothingColor') || 'none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Studio & Interactive Thumbnail Assistant States
  const [activeStudioItem, setActiveStudioItem] = useState<Frame | null>(null);
  const [headlinePlayer, setHeadlinePlayer] = useState('');
  const [headlineStage, setHeadlineStage] = useState('here_we_go');
  const [generatedHeadlines, setGeneratedHeadlines] = useState<string[]>([]);
  const [colorMatchingAdvise, setColorMatchingAdvise] = useState<string>('');
  const [isGeneratingHeadlines, setIsGeneratingHeadlines] = useState(false);
  const [copiedHeadlineIndex, setCopiedHeadlineIndex] = useState<number | null>(null);

  // Async load image data of generated frames from IndexedDB on component mount
  React.useEffect(() => {
    let active = true;
    const loadAllImages = async () => {
      try {
        const saved = localStorage.getItem('identityLockGeneratedFrames_v3_meta');
        if (saved) {
          const parsed = JSON.parse(saved);
          const imagePromises = parsed
            .filter((x: any) => x.hasImage)
            .map(async (x: any) => {
              const imgData = await loadImageFromDB(x.id);
              return { id: x.id, imgData };
            });

          const results = await Promise.all(imagePromises);
          if (!active) return;

          setFrames(prev => prev.map(f => {
            const foundData = results.find(r => r.id === f.id);
            if (foundData && foundData.imgData) {
              return { ...f, imageUrl: foundData.imgData };
            }
            return f;
          }));
        }
      } catch (err) {
        console.error('Failed to restore images from IndexedDB', err);
      }
    };
    loadAllImages();
    return () => {
      active = false;
    };
  }, []);

  // Sync frames metadata (excluding the base64 images) to localStorage
  React.useEffect(() => {
    try {
      const metadataToSave = frames.map(f => ({
        id: f.id,
        prompt: f.prompt,
        selectedFilter: f.selectedFilter,
        hasImage: !!f.imageUrl
      }));
      localStorage.setItem('identityLockGeneratedFrames_v3_meta', JSON.stringify(metadataToSave));
    } catch (e) {
      console.error('Failed to save frames metadata to localStorage', e);
    }
  }, [frames]);

  // Load and manage favorites list from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('identityLockFavorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id];
      localStorage.setItem('identityLockFavorites', JSON.stringify(updated));
      return updated;
    });
  };

  const categories = [
    { id: 'all', label: 'الكل (All)', range: [1, 315], color: 'bg-slate-800 text-slate-300' },
    { id: 'favorites', label: '⭐ المفضلة (Favorites)', range: [0, 0], color: 'bg-amber-950/40 text-amber-300 border-amber-800' },
    { id: 'mercato', label: '🔥 حصريات الميركاتو (Mercato Exclusives)', range: [301, 315], color: 'bg-orange-950/40 text-orange-300 border-orange-850' },
    { id: 'emotions', label: 'العواطف وردود الفعل (Emotions)', range: [1, 40], color: 'bg-rose-900/40 text-rose-300 border-rose-800' },
    { id: 'cinematic', label: 'Cinematic (سينمائي احترافي)', range: [41, 100], color: 'bg-purple-900/40 text-purple-300 border-purple-800' },
    { id: 'professions', label: 'Professions (وظائف ومھن)', range: [101, 110], color: 'bg-cyan-900/40 text-cyan-300 border-cyan-800' },
    { id: 'comedy', label: 'Comedy (كوميدي وفوضى)', range: [111, 120], color: 'bg-amber-900/40 text-amber-300 border-amber-800' },
    { id: 'scifi', label: 'Sci-Fi & Magic (خيال علمي وسحر)', range: [121, 140], color: 'bg-fuchsia-900/40 text-fuchsia-300 border-fuchsia-800' },
    { id: 'vintage', label: 'Vintage/Vibe (ريترو ومزاج)', range: [141, 150], color: 'bg-pink-900/40 text-pink-300 border-pink-800' },
    { id: 'creators', label: 'Creator & Gaming (بث وألعاب ومحتوى)', range: [151, 160], color: 'bg-emerald-900/40 text-emerald-300 border-emerald-800' },
    { id: 'mystery', label: 'Mystery & Intrigue (غموض وتحقيق)', range: [161, 170], color: 'bg-indigo-900/40 text-indigo-300 border-indigo-800' },
    { id: 'extreme', label: 'Extreme Survival (ظروف قاسية ومغامرة)', range: [171, 180], color: 'bg-orange-900/40 text-orange-300 border-orange-850' },
    { id: 'artistic', label: 'Artistic & Stage (مسرح وفنون)', range: [181, 190], color: 'bg-teal-900/40 text-teal-300 border-teal-800' },
    { id: 'mythical', label: 'Mythical (عجائب وقوى خارقة)', range: [191, 200], color: 'bg-violet-900/40 text-violet-300 border-violet-800' },
    { id: 'football', label: 'Football & Transfers (كرة القدم والانتقالات)', range: [201, 300], color: 'bg-green-950/40 text-green-300 border-green-800' }
  ];

  const filteredFrames = useMemo(() => {
    if (activeCategory === 'favorites') {
      return frames.filter(f => favorites.includes(f.id));
    }
    if (activeCategory === 'all') return frames;
    const cat = categories.find(c => c.id === activeCategory);
    if (!cat) return frames;
    return frames.filter(f => {
      const idNum = parseInt(f.id);
      return idNum >= cat.range[0] && idNum <= cat.range[1];
    });
  }, [frames, activeCategory, favorites]);

  const getFrameColorClass = (id: string) => {
    const idNum = parseInt(id);
    const cat = categories.find(c => idNum >= c.range[0] && idNum <= c.range[1] && c.id !== 'all');
    if (!cat) return 'border-slate-800 group-hover:border-slate-600';
    return `border-${cat.color.split('-')[1]}-800/50 group-hover:border-${cat.color.split('-')[1]}-500/80`;
  };

  const getFrameGlowColor = (id: string) => {
    const idNum = parseInt(id);
    const cat = categories.find(c => idNum >= c.range[0] && idNum <= c.range[1] && c.id !== 'all');
    if (!cat) return 'from-[#07090f]';
    return `from-${cat.color.split('-')[1]}-950/40`;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyPrompt = async () => {
    if (!selectedPrompt) return;
    try {
      await navigator.clipboard.writeText(selectedPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = (imageUrl: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering the card click
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `IdentityLock_${title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('identityLockApiKeys', settingsKeys.trim());
    localStorage.setItem('identityLockModel', selectedModel);
    localStorage.setItem('identityLockBgStyle', backgroundStyle);
    setShowSettings(false);
  };

  const executeWithFailover = async (executeFn: (ai: GoogleGenAI, apiKey: string) => Promise<any>) => {
    const customKeysStr = localStorage.getItem('identityLockApiKeys') || '';
    let apiKeys = customKeysStr.split(/[\n,\s]+/).map(k => k.trim()).filter(k => k.startsWith('AIza'));
    
    const systemKey = process.env.GEMINI_API_KEY as string;
    
    // Always append the system key at the end to act as a fallback
    if (systemKey && !apiKeys.includes(systemKey)) {
        apiKeys.push(systemKey);
    }
    
    if (apiKeys.length === 0) {
      setShowSettings(true);
      throw new Error("يرجى إدخال مفتاح Google Gemini API...");
    }

    let lastError: any;
    let attempts = [];

    for (let i = 0; i < apiKeys.length; i++) {
        const apiKey = apiKeys[i];
        if (!apiKey) continue;
        const ai = new GoogleGenAI({ apiKey });
        const isSystemKey = apiKey === systemKey;
        try {
            console.log(`Trying API Key ${i + 1}/${apiKeys.length}... (${isSystemKey ? 'System' : 'Custom'})`);
            return await executeFn(ai, apiKey);
        } catch (e: any) {
            const errorMsg = e?.message || JSON.stringify(e);
            console.warn(`Key ${i + 1} failed. Error:`, errorMsg);
            
            let status = 'مرفوض/خطأ';
            if (errorMsg.toLowerCase().includes('429') || errorMsg.toLowerCase().includes('exhausted')) {
                status = 'نفذت الحصة (Quota)';
            } else if (errorMsg.toLowerCase().includes('403') || errorMsg.toLowerCase().includes('permission')) {
                status = 'لا يوجد تصريح/غير مدفوع';
            }
            
            attempts.push(`مفتاح ${i + 1} (${isSystemKey ? 'النظام الأساسي' : 'مفتاح مخصص'}): ${status}`);
            lastError = e;
            // continue to next key
        }
    }
    
    if (lastError && attempts.length > 0) {
        lastError.attemptsLog = attempts.join('\n');
    }
    
    throw lastError;
  };

  const handleCopyHeadline = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedHeadlineIndex(index);
    setTimeout(() => setCopiedHeadlineIndex(null), 1500);
  };

  const applyFilterToCanvasAndDownload = (imageUrl: string, filterCss: string, title: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (filterCss && filterCss !== 'none') {
          ctx.filter = filterCss;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          const url = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = url;
          link.download = `IdentityLock_Studio_${title.replace(/\s+/g, '_')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (err) {
          console.error('Canvas download error, falling back', err);
          const link = document.createElement('a');
          link.href = imageUrl;
          link.download = `IdentityLock_${title.replace(/\s+/g, '_')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    };
  };

  const handleGenerateHeadlines = async () => {
    if (!activeStudioItem) return;
    setIsGeneratingHeadlines(true);
    setGeneratedHeadlines([]);
    setColorMatchingAdvise('');
    
    // Choose selected stage label
    const stageLabels: Record<string, string> = {
      here_we_go: 'تمت الصفقة رسمياً (Here We Go!)',
      negotiating: 'مفاوضات سرية متقدمة',
      leaked: 'تسريب حصري من كواليس الإدارة',
      rumor: 'إشاعة ساخنة من الصحافة العالمية',
      failed: 'انهيار الصفقة تماماً وصدمة جماهيرية',
      renewal: 'تجديد الولاء والعهد مع الفريق'
    };
    const headlineStageLabel = stageLabels[headlineStage] || headlineStage;

    const promptText = `أنت خبير تسويق رياضي وصانع محتوى كرة قدم محترف متخصص في صياغة عناوين ومقاطع يوتيوب وتيك توك جذابة جداً (Clickbait CTR) وصحفي ميركاتو خبير.
بناءً على المعطيات التالية:
1. اسم اللاعب أو النادي المعني بالخبر: "${headlinePlayer || 'لاعب ميركاتو غامض'}"
2. طبيعة الخبر أو مرحلة انتقال الميركاتو: "${headlineStageLabel}"
3. تفاصيل وضعية الصورة ونوع التعبير الكاريزمي الحالي: "${activeStudioItem.title} - ${activeStudioItem.detail}"

المطلوب منك صياغة مستند نصي مخصص ومقسّم بوضوح تام كالتالي:

[TITLES]
اكتب 5 عناوين مخصصة لغلاف الفيديو واليوتيوب لزيادة نسبة النقر (CTR)، يجب أن تكون باللغة العربية ومثيرة جداً للاهتمام مع استخدام الرموز تعبيرية (Emojis) الرياضية القوية (مثل 🔥، 🚨، ✈️، ✍️، 😱، 💣). اكتب كل عنوان في سطر مستقل يبدأ بشرطة (-).

[TIPS]
اكتب فقرة من 2-3 أسطر باللغة العربية تشرح فيها أفضل الألوان والتدرجات التي يجب استخدامها كخلفية لثمنيل اليوتيوب، وعناصر التوهج (Glow Colors) والتصميم المناسبة لهذه الوضعية بالتحديد "${activeStudioItem.title}" والصورة المولدة لكي تظهر الصورة بأقصى مستوى من التناسق والجاذبية.

يرجى التقيد التام بالأقسام أعلاه وكتابة العناوين مباشرة دون مقدمات أو تعقيبات إضافية.`;

    try {
      const responseText = await executeWithFailover(async (ai, currentApiKey) => {
        try {
          return await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ text: promptText }]
          });
        } catch (e: any) {
          e.step = 'توليد العناوين والدليل اللوني للثمنيل';
          throw e;
        }
      });

      const responseBody = responseText.text || '';
      
      // Parse Output Robustly
      let titles: string[] = [];
      let tips = '';

      if (responseBody.includes('[TITLES]') || responseBody.includes('[TIPS]')) {
        const parts = responseBody.split('[TIPS]');
        const titleSection = parts[0].replace('[TITLES]', '').trim();
        tips = parts[1] ? parts[1].trim() : '';

        titles = titleSection
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line))
          .map(line => line.replace(/^[-*\d.\s]+/, '').trim());
      } else {
        // Fallback generic splitting
        const lines = responseBody.split('\n').map(l => l.trim()).filter(Boolean);
        titles = lines.slice(0, 5);
        tips = lines.slice(5).join('\n');
      }

      if (titles.length === 0) {
        titles = [
          `🚨 عاجل: صفقة القرن تقترب! تفاصيل غامضة لـ ${headlinePlayer || 'النجم المنتظر'}`,
          `🔥 رسمياً: "تم الاتفاق"! تفاصيل انتقال ${headlinePlayer || 'اللاعب الجديد'} وكواليس الصفقة`,
          `💣 تسريب صادم: حقيقة توقيع ${headlinePlayer || 'اللاعب'} الذي هز الشارع الرياضي`,
          `✈️ هبطت الطائرة! الكشف عن وجهة ${headlinePlayer || 'النجم العالمي'} الجديدة`,
          `😱 ماذا يحدث خلف الأبواب المغلقة؟ مفاجأة كبرى بخصوص ${headlinePlayer || 'عقد اللاعب'}`
        ];
      }
      
      setGeneratedHeadlines(titles.slice(0, 5));
      setColorMatchingAdvise(tips || 'يُنصح باستخدام خلفيات بتدرجات النيون والأزرق الداكن المتناسبة مع إضاءة الموضوع الرياضي لزيادة نسبة لفت الانتباه والبريق على يوتيوب.');

    } catch (e: any) {
      console.error("Headline Generation Error:", e);
      const errorMsg = e?.message || JSON.stringify(e);
      setErrorModal({
        title: "فشل توليد العناوين",
        message: `تعذر التواصل مع الموديل لتوليد العناوين.\n\nالتفاصيل:\n${errorMsg}`
      });
    } finally {
      setIsGeneratingHeadlines(false);
    }
  };

  const handleGenerateSingle = async (item: Frame, forceRegenerate: boolean = false) => {
    // If it already has an image, just show the prompt unless forceRegenerate is true
    if (item.imageUrl && !forceRegenerate) {
      if (item.prompt) setSelectedPrompt(item.prompt);
      return;
    }

    if (!referenceImage) {
      setErrorModal({
        title: "الصورة المرجعية مطلوبة",
        message: "يرجى رفع الصورة المرجعية (Upload) أولاً قبل التوليد."
      });
      return;
    }

    if (generatingId) return; // Prevent multiple clicks

    // Clear item image/prompt visually during generation if it's a regeneration
    if (forceRegenerate) {
      deleteImageFromDB(item.id).catch(err => console.error('IndexedDB delete error', err));
      setFrames(prev => prev.map(f => f.id === item.id ? { ...f, imageUrl: undefined, prompt: undefined } : f));
      setSelectedPrompt(null);
    } else if (!item.prompt) {
      setSelectedPrompt(null);
    }

    setGeneratingId(item.id);
    
    try {
      const base64Data = referenceImage.split(',')[1];
      const mimeType = referenceImage.split(';')[0].split(':')[1];

      // Custom background configuration based on selected backgroundStyle
      let bgStyleInstructionText = '';
      let bgStyleImagePromptAppend = '';

      if (backgroundStyle === 'bokeh') {
        bgStyleInstructionText = `IMPORTANT BACKGROUND CONSTRAINT: The background environment must have extreme cinematic out-of-focus blur, professional lens bokeh, shallow depth of field (DoF), and heavy DSLR cinematic blur with beautiful bright defocused bokeh circles. The background setting details should be fully smooth, soft, and completely indistinguishable so the focus is 100% on the subject.`;
        bgStyleImagePromptAppend = `[BACKGROUND STYLE: EXTREMELY BLURRY OUT-OF-FOCUS BACKGROUND, HEAVY DSLR BOKEH, SHALLOW DEPTH OF FIELD, SOFT BEAUTIFUL LENS BLUR WITH DEFOCUSED BOKEH CIRCLES. Absolutely zero sharp details in the background. The subject stands out perfectly with a clean professional separation.]`;
      } else if (backgroundStyle === 'studio') {
        bgStyleInstructionText = `IMPORTANT BACKGROUND CONSTRAINT: The background must be a completely clean, solid, minimalist professional photo studio backdrop roll (such as a smooth, solid plain neutral grey, dark charcoal, or soft muted dark blue wall) with elegant single-source portrait studio lighting on the subject. No actual environmental details, elements, or objects in the background - it must be 100% flat, simple, and plain solid studio backdrop, perfect for clean thumbnails.`;
        bgStyleImagePromptAppend = `[BACKGROUND STYLE: PLAIN SOLID STUDIO PORTRAIT BACKDROP, STATIC PLAIN GREY OR DARK MONOCHROMATIC WALL/BACKGROUND, CLEAN PROFESSIONAL MINIMALIST PHOTO PORTRAIT STUDIO ENVIRONMENT. Absolutely zero other objects or clutter in the background. High contrast focus on the subject.]`;
      } else if (backgroundStyle === 'chromakey') {
        bgStyleInstructionText = `IMPORTANT BACKGROUND CONSTRAINT: The background MUST be a perfectly uniform, solid, flat, and vivid chromakey green screen background (pure screen color like hex #00FF00 or light lime-green). It must have zero shadows, zero texture, and absolutely no details, gradients, or other colors. Active bright green screen backdrop, optimized for instant automatic background removal.`;
        bgStyleImagePromptAppend = `[BACKGROUND STYLE: PERFECT SOLID FLAT CHROMAKEY GREEN SCREEN (#00FF00) OR BRIGHT LIME GREEN BACKDROP. No shadows, no gradients, 100% flat uniform solid green color behind the subject for effortless automatic cutout.]`;
      } else {
        bgStyleInstructionText = ``;
        bgStyleImagePromptAppend = ``;
      }

      // Custom clothing color configuration
      const selectedColorObj = clothingColors.find(c => c.id === clothingColor);
      const clothingColorInstruction = selectedColorObj && selectedColorObj.id !== 'none'
        ? `IMPORTANT CLOTHING COLOR CONSTRAINT: The main clothing shirt, suit, jacket, or sports jersey worn by the subject MUST be strictly and vividly colored in "${selectedColorObj.value}". Do not use any other major color for the upper clothing.`
        : '';

      const clothingColorPromptAppend = selectedColorObj && selectedColorObj.id !== 'none'
        ? `[CLOTHING COLOR: The subject's clothing/jersey/shirt must be strictly styled in ${selectedColorObj.value}.]`
        : '';

      // 1. Always generate a fresh text prompt to ensure variability while strictly capturing identity
      const promptText = `أنت خبير هندسة Prompts لمولدات الصور ومحلل دقيق للملامح الجسدية.

مهمتك صياغة Prompt إنجليزي دقيق جداً للصورة.

السمة الإلزامية التي **يجب** أن تبدأ بها الـ Prompt بشكل حرفي:
"A highly realistic, unedited RAW photograph, waist-up shot of [INSERT MICRO-DETAILED PHYSICAL DESCRIPTION]. The face must be a 100% exact, flawless, and photorealistic preservation of the reference image's facial identity, capturing unique micro-expressions, skin pores, imperfections, and exact skin tone. NO plastic or AI-smoothed skin. Hands and upper torso are fully visible. "

استبدل [INSERT MICRO-DETAILED PHYSICAL DESCRIPTION] بوصف دقيق جداً للملامح الجسدية للوجه وملمس البشرة والشعر للشخص فقط مستخرجة من الصورة المرجعية. قم بتحليل ملامح الوجه بدقة، واكتب وصفاً باللغة الإنجليزية يشمل الوجه والملامح فقط دون وصف ملابس الصورة المرجعية أو خلفيتها نهائياً:
- شكل الوجه وتفاصيله الهندسية الدقيقة (شكل الفك، الأنف، العيون، الجبهة، التجاعيد الدقيقة جداً، نسيج الجلد الحقيقي، أية عيوب طبيعية، وملامح العمر).
- تفاصيل الشعر بشكل قاطع (هل هو أصلع تماماً؟ خفيف؟ طويل؟ التسريحة واللون الدقيق؟).
- غطاء الرأس (هل يرتدي قبعة؟ نظارات؟ صِفْها بدقة).
- شعر الوجه (مستوى اللحية بالضبط، شكلها، الشارب، أو حلاقة نظيفة).
يجب أن يضمن الوصف استنساخ وجه الشخص وهيئته بنسبة 100% ليصبح نسخة طبق الأصل وبواقعية شديدة لتجنب مظهر 'الذكاء الاصطناعي'.

ثم أكمل الـ Prompt بوصف التفاصيل التالية بأسلوب دقيق يعزز الواقعية القصوى:
- التعبير والملامح الوجهية: حافظ بصرامة وقوة على هذا التعبير المطلوب بالضبط دون أي تغيير: (${item.title}) مع الحفاظ على الدقة والملمس البشري الحقيقي للحركة.
- الإضاءة والبيئة: ${item.detail}. ${bgStyleInstructionText} (Lighting must emphasize skin texture, pores, and natural shadows. VERY IMPORTANT: You MUST completely ignore and discard the background, environment, or setting of the reference image. Do NOT describe the background of the reference image under any circumstances. Instead, describe a highly detailed, creative, brand-new backdrop, setting, and environment matching this exact theme: "${item.detail}" to place the subject in an entirely new context).
- الألوان السينمائية (Color Grading): أضف تدرجاً لونياً سينمائياً واضحاً (مثل Teal and Orange، Moody Blue، Neon، Golden Hour) يعكس تماماً شعور المشهد الموصوف في البيئة ويجعل الصورة احترافية وجذابة.
- حركة الجسم واليدين: ابتكر حركة يد ووضعية جسد (Waist-up) عفوية وجديدة تماماً (مثلاً: أذرع متقاطعة، يد على الذقن، حركة تعبيرية باليد، إلخ). نريد وضعيات حيوية وغير متكررة وتظهر بشكل طبيعي كصورة ملتقطة.
- الملابس: قم باستنتاج ملابس مبتكرة بالكامل ومختلفة 100% عن الملابس الموجودة بالصورة المرجعية، صِف ملابس متميزة (كاجوال، كلاسيكي، شتوي، عصري، إلخ) تناسب البيئة الجديدة تماماً مع إضافة تفاصيل للقماش والنسيج. ${clothingColorInstruction ? `ملاحظة هامّة جداً وقاطعة وحتمية: يجب أن تكون ملابس الشخصية/التيشيرت/القميص بلون رئيسي واحد هو (${selectedColorObj?.value || ''}) دون دمج أي ألوان أخرى معه.` : ''}
- رمز التجديد (لضمان اختلاف النتيجة في كل مرة): ${Date.now().toString(36) + Math.random().toString(36).substring(2, 7)}
- الجودة (أضفها كـ كلمات مفتاحية في النهاية): Shot on 35mm lens, f/1.8, extremely highly detailed, raw, unedited, candid, photographic, real human skin texture, pores visible, natural imperfections, award winning photography, ultra-realistic, 8k resolution, masterpiece, no CGI, no smoothed skin.

أرجع فقط نص الـ Prompt النهائي باللغة الإنجليزية مباشرة، ولا تضف أي نص آخر أو علامات توضيحية.`;

        const responseText = await executeWithFailover(async (ai, currentApiKey) => {
          try {
            return await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [{
                role: 'user',
                parts: [
                  { text: promptText },
                  { inlineData: { data: base64Data, mimeType } }
                ]
              }]
            });
          } catch (e: any) {
            e.step = 'تحليل الصورة وكتابة الـ Prompt';
            throw e;
          }
        });

        let currentPrompt = (responseText.text || '').trim();
        setFrames(prev => prev.map(f => f.id === item.id ? { ...f, prompt: currentPrompt } : f));
        setSelectedPrompt(currentPrompt);

      // 2. Generate the actual image
      const imageResponse = await executeWithFailover(async (ai, currentApiKey) => {
        const isSystem = currentApiKey === process.env.GEMINI_API_KEY;
        const primaryModel = isSystem ? 'gemini-2.5-flash-image' : selectedModel;
        
        const generateWithModel = async (modelName: string) => {
          return await ai.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                { inlineData: { data: base64Data, mimeType } },
                { text: `[CRITICAL: HIGH-FIDELITY IDENTITY PRESERVATION, COMPLETE BACKGROUND AND CLOTHING REPLACEMENT] You MUST perfectly clone the exact facial features, identity, skin tone, hair/baldness, and facial hair of the person in the reference image with extreme realism. Preserve ALL natural skin textures, pores, imperfections, and subtle facial micro-structures. Do NOT produce a smoothed, plastic, or "AI-generated" look. The face MUST remain 100% identical and photorealistic to the reference.
IMPORTANT: You MUST completely discard and ignore the background, environment, clothing, and overall layout of the reference image. Do NOT blend or carry over any of the original background, environment, lighting colors, or clothing from the reference image. The subject MUST be placed in an entirely new background and wear completely different clothing precisely as described in the scene prompt below. The only thing you keep from the reference image is the person's precise head/face identity.
${bgStyleImagePromptAppend}
${clothingColorPromptAppend}
Apply the following scene prompt exactly: ${currentPrompt}` }
              ]
            },
            config: {
              imageConfig: {
                aspectRatio: "3:4"
              }
            }
          });
        };

        try {
          return await generateWithModel(primaryModel);
        } catch (e: any) {
          const errMsg = e?.message || JSON.stringify(e);
          // If custom key hits quota or permission issues on 3.1, fallback to 2.5
          if (!isSystem && primaryModel !== 'gemini-2.5-flash-image' && 
              (errMsg.includes('429') || errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('RESOURCE_EXHAUSTED'))) {
             console.log(`Falling back to gemini-2.5-flash-image for this key due to error...`);
             try {
                return await generateWithModel('gemini-2.5-flash-image');
             } catch (fallbackErr: any) {
                fallbackErr.step = 'توليد الصورة النهائية (Fallback Model)';
                throw fallbackErr;
             }
          }
          e.step = 'توليد الصورة النهائية';
          throw e;
        }
      });

      let newImageUrl = '';
      const parts = imageResponse.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          const imgBase64 = part.inlineData.data;
          newImageUrl = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${imgBase64}`;
          break;
        }
      }

      if (newImageUrl) {
        saveImageToDB(item.id, newImageUrl).catch(err => console.error('IndexedDB save error', err));
        setFrames(prev => prev.map(f => f.id === item.id ? { ...f, imageUrl: newImageUrl } : f));
      } else {
        setErrorModal({
          title: "فشل التوليد",
          message: "الموديل لم يرجع صورة. قد تكون المشكلة من سياسات الأمان أو إعدادات الموديل."
        });
      }
      
    } catch (e: any) {
      console.error("Image Generation Error:", e);
      const errorMsg = e?.message || JSON.stringify(e);
      
      if (errorMsg.includes("يرجى إدخال مفتاح")) {
         return; // The settings modal is already opened, just exit.
      }

      if (errorMsg.toLowerCase().includes('resource_exhausted') || errorMsg.includes('429')) {
         setErrorModal({
           title: "🚨 نفذت الحصة (Quota Exhausted)",
           message: `مرحلة الخطأ: ${e.step || 'غير معروف'}\n\nلقد تم استهلاك جميع المحاولات المجانية.\n\nتوضيح هام جداً:\n1. شركة جوجل تطبق "حد أقصى للطلبات" (Quota) بناءً على عنوان الإنترنت (IP Address) الخاص بك، وليس فقط على المفتاح.\n2. إذا قمت بإنشاء مفاتيح جديدة من إيميلات مختلفة ولكنك تستخدم نفس شبكة الـ Wi-Fi (نفس الـ IP)، فسيقوم نظام جوجل برفضها جميعاً لأن الحصة مرتبطة بالـ IP.\n3. لتجاوز هذا يجب استخدام شبكة إنترنت أخرى (مثل بيانات الهاتف 4G) أو استخدام حساب Google Cloud مدفوع (Billing Enabled).\n\nتاريخ المحاولات:\n${e.attemptsLog || ''}`
         });
      } else if (errorMsg.toLowerCase().includes('403') || errorMsg.toLowerCase().includes('permission') || errorMsg.toLowerCase().includes('not valid')) {
         setErrorModal({
           title: "⚠️ المفتاح غير مصرح",
           message: `مرحلة الخطأ: ${e.step || 'غير معروف'}\n\nيواجه مفتاح API الخاص بك مشكلة في الصلاحيات. ربما لأنك تستخدم مفتاح مجاني لا يدعم توليد الصور، أو النظام يطلب منك تفعيل Billing.\n\nالمحاولات:\n${e.attemptsLog || ''}\n\nالتفاصيل:\n${errorMsg}`
         });
      } else {
         setErrorModal({
           title: "حدث خطأ غير متوقع",
           message: `مرحلة الخطأ: ${e.step || 'غير معروف'}\n\nحدث خطأ أثناء التوليد. تأكد من أن الـ API Key يعمل.\n\nالتاريخ:\n${e.attemptsLog || ''}\n\nالتفاصيل:\n${errorMsg}`
         });
      }
    } finally {
      setGeneratingId(null);
    }
  };

  const generatedCount = frames.filter(f => f.imageUrl).length;

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-300 font-sans selection:bg-slate-800 flex items-center justify-center p-0 md:p-4 lg:p-8">
      
      {/* Main App Container */}
      <div className="w-full max-w-[1600px] min-h-screen md:min-h-[90vh] md:h-[90vh] bg-[#0b0f17] border-0 md:border border-slate-800/60 md:rounded-2xl shadow-none md:shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative md:ring-1 ring-white/5">
        
        {/* Header Section */}
        <header className="h-auto md:h-16 py-4 md:py-0 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 bg-[#0a0d14] gap-4 md:gap-0 shrink-0">
          <div className="flex items-center space-x-3 text-slate-200">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 shadow-inner">
              <Sparkles size={16} className="text-slate-300" />
            </div>
            <h1 className="text-xl md:text-lg font-medium tracking-tight">IdentityLock <span className="text-slate-400 font-semibold tracking-wide">Studio Gen-V3</span></h1>
          </div>
          <div className="flex items-center flex-wrap justify-center gap-3 text-xs font-medium tracking-wide">
            <button 
              onClick={() => setShowSettings(true)}
              className="px-4 md:px-3 py-2 md:py-1.5 focus:outline-none flex items-center space-x-2 text-slate-400 hover:text-slate-200 transition-colors bg-slate-900 hover:bg-slate-800 rounded-full border border-slate-800"
            >
              <Settings size={14} />
              <span>Settings</span>
            </button>
            <div className="flex items-center text-slate-400 bg-slate-900/50 px-4 md:px-3 py-2 md:py-1.5 rounded-full border border-slate-800">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
              Ready
            </div>
            <div className="text-slate-300 bg-slate-800/80 px-4 md:px-3 py-2 md:py-1.5 rounded-full border border-slate-700">
              {generatedCount} / {frames.length} Created
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden relative">
          
          {/* Sidebar: Constraints & Reference */}
          <aside className="w-full md:w-80 lg:w-72 border-b md:border-b-0 md:border-r border-slate-800 bg-[#07090f]/50 backdrop-blur-xl p-4 md:p-6 flex flex-col z-10 shrink-0 md:overflow-y-auto">
            <div className="mb-8 relative group">
              <label className="text-[10px] uppercase text-slate-500 mb-3 block tracking-widest font-semibold group-hover:text-slate-300 transition-colors">
                Source Identity
              </label>
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square w-full bg-[#0a0d14] border-2 border-dashed border-slate-800 hover:border-slate-600 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center transition-all cursor-pointer group hover:bg-[#0c101a]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                {referenceImage ? (
                  <>
                    <img src={referenceImage} alt="Reference" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-black/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                       <span className="bg-slate-900/90 backdrop-blur text-slate-200 text-[10px] px-2.5 py-1 rounded-full font-medium shadow-lg border border-slate-700 flex items-center">
                         <Check size={12} className="mr-1.5 text-slate-400" /> 100% Locked
                       </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-600 group-hover:text-slate-400 transition-colors">
                    <Upload size={28} className="mb-3 opacity-50 group-hover:opacity-100 group-hover:-translate-y-1 transition-all" />
                    <span className="text-xs font-medium tracking-wide">Upload portrait</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-medium tracking-wide text-slate-400">
                  <span>Face Preservation</span>
                  <span className="text-slate-300">Strict</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-900 w-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-slate-600 w-full shadow-[0_0_10px_rgba(71,85,105,0.3)]"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-medium text-slate-500 tracking-wide">
                  <span>Baldness Anchor</span>
                  <span>Fixed</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-900 w-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-slate-700 w-full"></div>
                </div>
              </div>

              {/* Background Removal / Blurring Segmented Control */}
              <div className="space-y-2 pt-4 border-t border-slate-800/60 text-right" dir="rtl">
                <label className="text-[11px] font-semibold text-slate-400 block tracking-wide flex items-center justify-end">
                  <span>نمط خلفية الصورة (لتسهيل القص والتصميم)</span>
                  <Sparkles size={11} className="ml-1 text-indigo-400" />
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1 px-0.5">
                  <button
                    type="button"
                    title="خلفية مُموهة بالكامل"
                    onClick={() => {
                      setBackgroundStyle('bokeh');
                      localStorage.setItem('identityLockBgStyle', 'bokeh');
                    }}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-medium transition-all flex flex-col items-center justify-center text-center ${
                      backgroundStyle === 'bokeh'
                        ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)]'
                        : 'border-slate-800/80 bg-[#07090f]/50 text-slate-400 hover:border-slate-700 hover:text-slate-300 hover:bg-[#0c101a]'
                    }`}
                  >
                    <span className="font-semibold block text-[11px]">عزل سينمائي</span>
                    <span className="text-[8px] opacity-75 block mt-0.5">تمويه Bokeh</span>
                  </button>

                  <button
                    type="button"
                    title="خلفية استوديو ساده سهلة الإزالة"
                    onClick={() => {
                      setBackgroundStyle('studio');
                      localStorage.setItem('identityLockBgStyle', 'studio');
                    }}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-medium transition-all flex flex-col items-center justify-center text-center ${
                      backgroundStyle === 'studio'
                        ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)]'
                        : 'border-slate-800/80 bg-[#07090f]/50 text-slate-400 hover:border-slate-700 hover:text-slate-300 hover:bg-[#0c101a]'
                    }`}
                  >
                    <span className="font-semibold block text-[11px]">استوديو ساده</span>
                    <span className="text-[8px] opacity-75 block mt-0.5">رمادي احترافي</span>
                  </button>

                  <button
                    type="button"
                    title="خلفية كروما خضراء للقص المباشر في ثواني"
                    onClick={() => {
                      setBackgroundStyle('chromakey');
                      localStorage.setItem('identityLockBgStyle', 'chromakey');
                    }}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-medium transition-all flex flex-col items-center justify-center text-center ${
                      backgroundStyle === 'chromakey'
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                        : 'border-slate-800/80 bg-[#07090f]/50 text-slate-400 hover:border-emerald-800/50 hover:text-emerald-300 hover:bg-[#0c101a]'
                    }`}
                  >
                    <span className="font-semibold block text-[11px]">كروما خضراء</span>
                    <span className="text-[8px] opacity-75 block mt-0.5">قص مثالي لكفرات</span>
                  </button>

                  <button
                    type="button"
                    title="خلفية طبيعية في المشهد كما صمم بالوضعية"
                    onClick={() => {
                      setBackgroundStyle('original');
                      localStorage.setItem('identityLockBgStyle', 'original');
                    }}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-medium transition-all flex flex-col items-center justify-center text-center ${
                      backgroundStyle === 'original'
                        ? 'border-slate-600 bg-slate-800 text-slate-200'
                        : 'border-slate-800/80 bg-[#07090f]/50 text-slate-400 hover:border-slate-700 hover:text-slate-300 hover:bg-[#0c101a]'
                    }`}
                  >
                    <span className="font-semibold block text-[11px]">طبيعي (المشهد)</span>
                    <span className="text-[8px] opacity-75 block mt-0.5">خلفية الوضعية</span>
                  </button>
                </div>
              </div>

              {/* Clothing Color Selection */}
              <div className="space-y-2 pt-4 border-t border-slate-800/60 text-right" dir="rtl">
                <label className="text-[11px] font-semibold text-slate-400 block tracking-wide flex items-center justify-end">
                  <span>لون ملابس الشخصية (تحت الخلفية)</span>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 ml-1.5 animate-pulse" />
                </label>
                <div className="grid grid-cols-3 gap-1.5 mt-1 px-0.5">
                  {clothingColors.map((colorObj) => {
                    const isSelected = clothingColor === colorObj.id;
                    return (
                      <button
                        key={colorObj.id}
                        type="button"
                        onClick={() => {
                          setClothingColor(colorObj.id);
                          localStorage.setItem('identityLockClothingColor', colorObj.id);
                        }}
                        className={`py-1.5 px-1 rounded-lg border text-[11px] font-medium transition-all flex items-center justify-center gap-1 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.2)]'
                            : 'border-slate-800/80 bg-[#07090f]/50 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${colorObj.class} shrink-0`} />
                        <span className="truncate">{colorObj.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <div className="p-4 rounded-xl border border-slate-800/50 bg-[#0a0d14] relative overflow-hidden group hover:bg-[#0c101a] transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-700/50 group-hover:bg-slate-600 transition-colors"></div>
                <p className="text-xs leading-relaxed text-slate-400 rtl opacity-80 group-hover:opacity-100 transition-opacity">
                  "ممنوع تغيير الملامح تماماً، الهوية أصلع بالكامل. التوليد بدقة سينمائية."
                </p>
              </div>
            </div>
          </aside>

          {/* Generation Grid */}
          <main className="flex-1 p-4 sm:p-6 bg-[#0b0f17] md:overflow-y-auto scroll-smooth relative min-h-screen md:min-h-0">
            
            {/* Empty State Instructions */}
            {frames.filter(f => f.imageUrl).length === 0 && !generatingId && referenceImage && (
               <div className="mb-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-slate-300 text-sm flex items-start space-x-3 shadow-inner">
                 <Activity size={18} className="shrink-0 mt-0.5 text-slate-400" />
                 <p>الصورة جاهزة للاستخدام! اضغط على أي بطاقة بالأسفل للبدء بتوليد الصورة الخاصة بها والمحافظة على الهوية. كل بطاقة تمثل جلسة وإنتاج مستقل.</p>
               </div>
            )}

            {/* Categories Navigation */}
            <div className="mb-6 flex space-x-2 overflow-x-auto pb-2 scrollbar-none snap-x custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`snap-center shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all border ${
                    activeCategory === cat.id 
                      ? cat.color + ' shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 auto-rows-max pb-32">
              {filteredFrames.map((item) => {
                const isGenerating = generatingId === item.id;
                const dynamicBorder = getFrameColorClass(item.id);
                const dynamicGlow = getFrameGlowColor(item.id);
                
                return (
                <div 
                  key={item.id} 
                  onClick={() => {
                    if (item.imageUrl) {
                      setActiveStudioItem(item);
                      setHeadlinePlayer('');
                      setGeneratedHeadlines([]);
                      setColorMatchingAdvise('');
                    } else {
                      handleGenerateSingle(item);
                    }
                  }}
                  className={`group relative aspect-[3/4] rounded-xl border overflow-hidden cursor-pointer transition-all duration-300
                    ${selectedPrompt === item.prompt && item.prompt ? 'border-slate-400 ring-2 ring-slate-400/50 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : dynamicBorder}
                    ${item.imageUrl ? 'bg-black' : 'bg-[#0a0d14]'}
                  `}
                >
                  
                  {/* Favorite Star Toggle Button */}
                  <button
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className={`absolute top-3 left-3 z-[35] p-1.5 rounded-lg backdrop-blur-md border transition-all duration-300
                      ${favorites.includes(item.id)
                        ? 'bg-amber-500/25 border-amber-500/50 text-amber-400 opacity-100 scale-100 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                        : 'bg-slate-900/80 border-slate-750 text-slate-500 hover:text-amber-400 hover:border-amber-500/40 opacity-0 group-hover:opacity-100 scale-95 hover:scale-100'
                      }`}
                    title={favorites.includes(item.id) ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                  >
                    <Star size={12} fill={favorites.includes(item.id) ? "currentColor" : "none"} className="transition-transform active:scale-125" />
                  </button>
                  
                  {/* Generated Image */}
                  {item.imageUrl ? (
                    <>
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        style={{ filter: getFilterCss(item.selectedFilter) }}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className={`absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t ${dynamicGlow} via-[#07090f]/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity`}></div>

                      
                      {/* Action buttons appear on hover */}
                      <div className="absolute top-3 inset-x-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                         <div className="bg-slate-900/80 backdrop-blur-md rounded-lg px-2 py-1 text-[10px] font-mono text-slate-300 border border-slate-700 shadow-md ml-9">
                           #{item.id}
                         </div>
                         <div className="flex gap-1.5">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               setActiveStudioItem(item);
                               setHeadlinePlayer('');
                               setGeneratedHeadlines([]);
                               setColorMatchingAdvise('');
                             }}
                             className="bg-amber-600 hover:bg-amber-500 text-white p-2 rounded-lg backdrop-blur-md border border-amber-500/50 transition-colors shadow-lg"
                             title="استوديو ثمنيل الميركاتو والعناوين الذكية"
                           >
                             <Palette size={14} />
                           </button>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               handleGenerateSingle(item, true);
                             }}
                             className="bg-slate-900/80 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-lg backdrop-blur-md border border-slate-700 transition-colors shadow-lg"
                             title="توليد نتيجة جديدة (Regenerate)"
                           >
                             <RefreshCw size={14} />
                           </button>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               const filterVal = getFilterCss(item.selectedFilter);
                               if (filterVal !== 'none') {
                                 applyFilterToCanvasAndDownload(item.imageUrl!, filterVal, item.title);
                               } else {
                                 handleDownload(item.imageUrl!, item.title, e);
                               }
                             }} 
                             className="bg-slate-900/80 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-lg backdrop-blur-md border border-slate-700 transition-colors shadow-lg"
                             title="تحميل الصورة بالجودة الأصلية فلتر"
                           >
                             <Download size={14} />
                           </button>
                         </div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 transition-colors group-hover:text-slate-600">
                      <ImageIcon size={24} className="mb-2 opacity-50" />
                      <span className="text-[10px] font-mono tracking-widest opacity-80">#{item.id}</span>
                    </div>
                  )}

                  {/* Footer Formatting */}
                  <div className={`absolute bottom-0 inset-x-0 p-4 pb-3 flex flex-col justify-end transition-opacity z-10 ${item.imageUrl ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                    <h3 className={`text-sm font-semibold mb-1 leading-tight ${item.imageUrl ? 'text-slate-100' : 'text-slate-300'}`}>{item.title}</h3>
                    <p className={`text-[9px] uppercase tracking-wider font-mono truncate ${item.imageUrl ? 'text-slate-400' : 'text-slate-500'}`}>{item.detail}</p>
                  </div>

                  {/* Generating Overlay State */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-[#07090f]/80 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center border-2 border-slate-700 rounded-xl">
                       <Activity size={24} className="text-slate-400 animate-pulse mb-3" />
                       <span className="text-[10px] text-slate-300 font-mono tracking-widest animate-pulse font-medium">RENDERING...</span>
                    </div>
                  )}

                  {/* Generate Hover Hint */}
                  {!item.imageUrl && !isGenerating && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-950/60 backdrop-blur-sm transition-opacity">
                       <div className="flex items-center space-x-2 bg-slate-800 border border-slate-600 text-slate-200 rounded-lg px-4 py-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all">
                         <Sparkles size={14} className="text-slate-400" />
                         <span className="text-[10px] font-bold tracking-wider uppercase">Generate</span>
                       </div>
                    </div>
                  )}

                </div>
              )})}
            </div>

            {/* Empty State for Favorites Category */}
            {activeCategory === 'favorites' && filteredFrames.length === 0 && (
              <div className="w-full py-20 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800/60 rounded-2xl bg-slate-950/25 max-w-lg mx-auto mt-8 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/35 flex items-center justify-center mb-5 animate-pulse">
                  <Star size={24} className="text-amber-400" fill="currentColor" />
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-2">قائمة المفضلة فارغة حالياً</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm" dir="rtl">
                  لم تقم بإضافة أي وضعيات للمفضلة بعد. اضغط على أيقونة النجمة (⭐) الموجودة في زاوية أي بطاقة لإضافتها هنا. ستساعدك هذه الميزة على تجميع قوالب الميركاتو الحصرية والأوضاع المفضلة لديك للوصول إليها وتوليدها بشكل فوري وسريع!
                </p>
              </div>
            )}
            
            {/* Floating Prompt Viewer Panel */}
            {selectedPrompt && (
              <div className="fixed bottom-6 md:bottom-8 left-4 right-4 md:left-[320px] md:right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                <div className="bg-[#0f1420]/95 backdrop-blur-xl border border-slate-700 shadow-[0_10px_50px_rgba(0,0,0,0.8)] rounded-2xl p-5 flex flex-col relative ring-1 ring-white/5 mx-auto max-w-4xl">
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-800/80">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center">
                      <Sparkles size={14} className="mr-2" /> Engineered Configuration
                    </span>
                    <button 
                      onClick={() => setSelectedPrompt(null)} 
                      className="text-slate-500 hover:text-slate-300 transition-colors bg-slate-800/50 hover:bg-slate-700 rounded-lg p-1.5 border border-transparent hover:border-slate-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <p className="text-sm text-slate-300 font-mono leading-relaxed select-all overflow-y-auto max-h-32 pr-2 custom-scrollbar">
                    {selectedPrompt}
                  </p>
                  
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={handleCopyPrompt}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors border shadow-sm ${isCopied ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 hover:text-white'}`}
                    >
                      {isCopied ? (
                        <><Check size={14} /> <span>Copied!</span></>
                      ) : (
                        <><Copy size={14} /> <span>Copy Prompt</span></>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
          </main>
        </div>
      </div>

      {/* Error Modal */}
      {errorModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0f1420] border border-red-500/30 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto shadow-red-900/20">
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-red-500/5">
              <h2 className="text-lg font-medium text-red-400 flex items-center space-x-2">
                <span>{errorModal.title}</span>
              </h2>
              <button 
                onClick={() => setErrorModal(null)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed text-right rtl" dir="rtl">
                {errorModal.message}
              </p>
            </div>
            <div className="p-5 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setErrorModal(null)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border border-slate-700"
              >
                <span>حسناً فهمت</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f1420] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
              <h2 className="text-lg font-medium text-slate-200 flex items-center space-x-2">
                <Settings size={18} className="text-slate-400" />
                <span>API Keys Settings</span>
              </h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="mb-4 text-sm text-slate-400 rtl text-right" dir="rtl">
                <p className="mb-2 font-medium text-slate-200">الاستخدام الشخصي والمفاتيح (API Keys):</p>
                <p className="mb-3">هذه الأداة مصممة بحيث يمكن لأي شخص إدخال المفتاح الخاص به لضمان عدم مشاركة الحصة (Quota) مع الآخرين.</p>
                <div className="bg-indigo-900/30 border border-indigo-500/30 p-3 rounded-lg mb-4">
                  <p className="mb-2">لا يمكن سحب المفتاح تلقائياً بمجرد تسجيل الدخول بحساب جوجل لأسباب أمنية تفرضها جوجل. يجب جلب المفتاح يدوياً.</p>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 underline font-medium"
                  >
                    👉 اضغط هنا للحصول على مفتاحك المجاني من Google AI Studio
                  </a>
                </div>
                <p>قم بلصق المفتاح (أو المفاتيح، كل واحد في سطر) بالأسفل لتعمل الأداة بحسابك مباشرة.</p>
              </div>

              {/* Model Selection Option */}
              <div className="mb-6 space-y-2 text-right" dir="rtl">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 flex items-center justify-end">
                  <Sparkles size={14} className="ml-2 text-indigo-400" /> موديل توليد الصور المختار
                </label>
                <div className="grid grid-cols-2 gap-3 mt-1 text-center font-sans">
                  <button
                    type="button"
                    onClick={() => setSelectedModel('gemini-3.1-flash-image-preview')}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center ${
                      selectedModel === 'gemini-3.1-flash-image-preview'
                        ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 shadow-md shadow-indigo-500/10'
                        : 'border-slate-800 bg-[#0d111a]/80 text-slate-400 hover:border-slate-700 hover:bg-[#111622]'
                    }`}
                  >
                    <span className="font-semibold text-xs text-slate-200">Gemini 3.1 Image</span>
                    <span className="text-[10px] opacity-70 mt-1">جودة فائقة (يتطلب فوترة)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedModel('gemini-2.5-flash-image')}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center ${
                      selectedModel === 'gemini-2.5-flash-image'
                        ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 shadow-md shadow-indigo-500/10'
                        : 'border-slate-800 bg-[#0d111a]/80 text-slate-400 hover:border-slate-700 hover:bg-[#111622]'
                    }`}
                  >
                    <span className="font-semibold text-xs text-slate-200">Gemini 2.5 Image</span>
                    <span className="text-[10px] opacity-70 mt-1">أسرع ومجاني للمفاتيح العادية</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 flex items-center">
                  <Key size={14} className="mr-2" /> API Keys (One per line)
                </label>
                <textarea
                  className="w-full h-40 bg-[#07090f] border border-slate-700 rounded-xl p-3 text-sm text-slate-300 font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none resize-none transition-all placeholder:text-slate-600"
                  placeholder="AIzaSy..."
                  value={settingsKeys}
                  onChange={(e) => setSettingsKeys(e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>
            <div className="p-5 border-t border-slate-800/80 bg-[#0a0d14] flex justify-end">
              <button 
                onClick={handleSaveSettings}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
              >
                <Save size={16} />
                <span>Save Keys</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Studio & AI Headline Assistant Modal */}
      {activeStudioItem && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b0f19] border border-slate-700/60 w-full max-w-6xl rounded-2xl shadow-3xl overflow-hidden flex flex-col lg:flex-row pointer-events-auto max-h-[95vh] lg:h-[85vh] animate-in zoom-in-95 duration-200">
            
            {/* COLUMN 1: Visual Studio & CSS Filters (Left/Top) */}
            <div className="w-full lg:w-[42%] border-b lg:border-b-0 lg:border-r border-slate-800 p-5 md:p-6 flex flex-col overflow-y-auto h-full bg-[#07090f]/70">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-slate-200">
                  <Palette size={18} className="text-amber-400" />
                  <span className="font-semibold text-sm">ألوان وفلاتر الثمنيل الرياضي</span>
                </div>
                <button 
                  onClick={() => {
                    setActiveStudioItem(null);
                    setGeneratedHeadlines([]);
                  }}
                  className="text-slate-400 hover:text-white transition-colors lg:hidden p-1.5 bg-slate-900 border border-slate-800 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Thumbnail Display Box */}
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-slate-700 bg-black group shadow-2xl">
                {/* 16:9 cinematic bounding crop box */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src={activeStudioItem.imageUrl} 
                    alt={activeStudioItem.title} 
                    style={{ filter: getFilterCss(activeStudioItem.selectedFilter) }}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Glow & Dark Gradients to match YouTube thumb style */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>
                <div className="absolute bottom-3 right-3 bg-[#0d1017]/90 px-2.5 py-1 rounded-full border border-slate-800 text-[10px] font-mono font-medium text-amber-400 tracking-wider">
                  YT THUMBNAIL PREVIEW
                </div>
              </div>

              {/* Title & Detail of selected reaction style */}
              <div className="mt-4 text-right" dir="rtl">
                <h3 className="text-sm font-semibold text-slate-200">{activeStudioItem.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{activeStudioItem.detail}</p>
              </div>

              {/* Interactive Visual Filters Selection */}
              <div className="mt-6 flex-1 text-right" dir="rtl">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                  🎨 اختر فلتر جذب المشاهدات المتناسق (CTR Boost Filters):
                </label>
                <div className="space-y-2.5">
                  {thumbnailFilters.map((filter) => {
                    const isSelected = (activeStudioItem.selectedFilter || 'none') === filter.id;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => {
                          const updatedFilter = filter.id;
                          setFrames(prev => prev.map(f => f.id === activeStudioItem.id ? { ...f, selectedFilter: updatedFilter } : f));
                          setActiveStudioItem(prev => prev ? { ...prev, selectedFilter: updatedFilter } : null);
                        }}
                        className={`w-full text-right p-3 rounded-xl border transition-all text-xs flex flex-col ${
                          isSelected 
                            ? 'border-amber-500 bg-amber-500/10 text-amber-200' 
                            : 'border-slate-800/80 bg-[#0c0f16]/90 text-slate-400 hover:border-slate-700 hover:bg-[#111520]'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full mb-1">
                          <span className={`font-bold ${isSelected ? 'text-amber-400' : 'text-slate-300'}`}>{filter.nameAr}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">{filter.tag}</span>
                        </div>
                        <span className="text-[10px] leading-relaxed text-slate-400 font-normal">{filter.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Column buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 shrink-0">
                <button
                  onClick={() => {
                    const filterVal = getFilterCss(activeStudioItem.selectedFilter);
                    applyFilterToCanvasAndDownload(activeStudioItem.imageUrl!, filterVal, activeStudioItem.title);
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <Download size={14} className="mr-1" />
                  <span>تحميل بالفلتر ⚡</span>
                </button>
                <button
                  onClick={() => {
                    setActiveStudioItem(null);
                    setGeneratedHeadlines([]);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 px-4 rounded-xl text-xs transition-all border border-slate-700"
                >
                  إغلاق الاستوديو ✕
                </button>
              </div>
            </div>

            {/* COLUMN 2: AI Headlines & Color Matching Advice (Right/Bottom) */}
            <div className="w-full lg:w-[58%] p-5 md:p-6 flex flex-col overflow-y-auto h-full bg-[#0a0d14]">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/80">
                <button 
                  onClick={() => {
                    setActiveStudioItem(null);
                    setGeneratedHeadlines([]);
                  }}
                  className="hidden lg:block text-slate-500 hover:text-slate-300 transition-colors bg-slate-900 border border-slate-800 rounded-lg p-1.5"
                >
                  <X size={18} />
                </button>
                <span className="text-sm font-semibold text-slate-200 flex items-center text-right rtl" dir="rtl">
                  <Sparkles size={16} className="ml-2 text-indigo-400 animate-pulse" />
                  مساعد الميركاتو والعناوين الذكي (AI Thumbnail Suite)
                </span>
              </div>

              {/* Interactive Input Form */}
              <div className="bg-[#0c0f17] border border-slate-800/80 p-5 rounded-2xl text-right space-y-4 mb-6" dir="rtl">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center justify-end">
                   توليد عناوين وبوستر يوتيوب بضغطة واحدة
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-400">
                      اسم اللاعب أو النادي المستهدف بالخبر:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: ميسي، محمد صلاح، الهلال السعودي..."
                      value={headlinePlayer}
                      onChange={(e) => setHeadlinePlayer(e.target.value)}
                      className="w-full bg-[#07090f] border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-400">
                      طبيعة الخبر ومرحلة الانتقال:
                    </label>
                    <select
                      value={headlineStage}
                      onChange={(e) => setHeadlineStage(e.target.value)}
                      className="w-full bg-[#07090f] border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                    >
                      <option value="here_we_go">🟢 صفقة تمت رسمياً وإعلان قادم (Here We Go!)</option>
                      <option value="negotiating">🟡 مفاوضات سرية كواليس متقدمة جداً</option>
                      <option value="leaked">🔴 تسريبات حصرية غامضة وتحركات سرية</option>
                      <option value="rumor">🔥 إشاعة ساخنة جداً من الصحف العالمية</option>
                      <option value="renewal">🤝 تجديد عقد لاعب أو ارتباط مستقبلي</option>
                      <option value="failed">❌ انهيار المفاوضات رسمياً وصدمة للجمهور</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleGenerateHeadlines}
                    disabled={isGeneratingHeadlines}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 disabled:cursor-not-allowed text-white text-xs font-bold py-3 px-5 rounded-xl transition-all shadow-lg shadow-indigo-500/15 flex items-center justify-center space-x-2"
                  >
                    {isGeneratingHeadlines ? (
                      <>
                        <Activity size={14} className="animate-spin mr-2" />
                        <span>جاري صياغة العناوين وتنسيق الألوان...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="mr-2" />
                        <span>توليد 5 عناوين ميركاتو جذابة ودليل الألوان 🧠✨</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Render Section: Generated Headlines & Aesthetic Guide */}
              {generatedHeadlines.length > 0 ? (
                <div className="space-y-6 flex-1 text-right" dir="rtl">
                  
                  {/* Generated Headlines List */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 mb-3 flex items-center justify-end">
                      <span>عناوين مقترحة فائقة الانتباه (CTR Clickbait Hook):</span>
                    </h4>
                    <div className="space-y-2.5">
                      {generatedHeadlines.map((headline, idx) => (
                        <div 
                          key={idx} 
                          className="bg-[#0c0f16] hover:bg-[#111520] border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between transition-all group scale-100 hover:scale-[1.01]"
                        >
                          <button
                            onClick={() => handleCopyHeadline(headline, idx)}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border shrink-0 ${
                              copiedHeadlineIndex === idx
                                ? 'bg-emerald-990/40 text-emerald-400 border-emerald-800/40'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <span>{copiedHeadlineIndex === idx ? 'تم النسخ!' : 'نسخ العنوان'}</span>
                          </button>
                          <span className="text-xs font-medium text-slate-200 leading-relaxed pr-3 text-right">
                            {headline}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Thumbnail Color Guide */}
                  {colorMatchingAdvise && (
                    <div className="bg-amber-500/5 border border-amber-500/25 p-4 rounded-xl text-right animate-in fade-in duration-300">
                      <div className="flex items-center justify-end space-x-2 text-amber-400 mb-2 font-bold text-xs">
                        <span>دليل تنسيق ألوان غلاف الميركاتو (Aesthetic Guide) 🎨</span>
                        <Palette size={14} />
                      </div>
                      <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line font-medium opacity-95">
                        {colorMatchingAdvise}
                      </p>
                    </div>
                  )}

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 max-w-xl mx-auto w-full my-auto">
                  <Sparkles size={28} className="text-indigo-500/40 mb-3 animate-pulse" />
                  <h5 className="text-sm font-semibold text-slate-300 mb-1">لم يتم توليد أي عناوين بعد</h5>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm" dir="rtl">
                    أدخل اسم اللاعب أو النادي بالأعلى ثم اضغط على زر توليد العناوين. سيقوم الذكاء الاصطناعي باقتراح عناوين ومصطلحات مثيرة تتناسب تماماً مع وضعية الصورة، مع تقديم نصائح لتعيين تباين وتناسق ألوان احترافي للثمنيل لجذب النقرات!
                  </p>
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
