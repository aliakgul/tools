---
title: "Vocal Practice"
description: "A focused vocal training workspace for quick, practical singing exercises."

hero:
    kicker: "Daily vocal training"
    title: "Build the core habits first."
    intro: "A beginner-safe set of practical vocal exercises for posture, breath, warm-up, pitch, resonance, range, and articulation."
    primaryAction: "Start with breathing"
    secondaryAction: "Browse topics"

recommendedSequence:
    label: "Recommended flow"
    note: "Use this order for a balanced session, or jump to any topic you need."
    topics:
        - "breathing"
        - "posture"
        - "warm-ups"
        - "pitch"
        - "resonance"
        - "range"
        - "articulation"

topics:
    - slug: "breathing"
      title: "Breathing"
      icon: "lucide:wind"
      summary: "Train steady airflow before adding pitch."
      concept: "Good singing starts with an easy inhale and a controlled release. The goal is not a huge breath; it is quiet, repeatable airflow without throat squeeze."
      guidance: "Use the timed cues to feel the ribs widen, then let the air leave evenly."
      safetyCue: "Stop if you feel dizziness, throat pressure, or air hunger. Use smaller breaths."
      visual:
          type: "breathing"
      checkpoints:
          - "Inhale is silent"
          - "Shoulders stay relaxed"
          - "Release stays even"
      exercises:
          - id: "breath-steady-s"
            title: "Easy inhale and steady S"
            shortTitle: "S release"
            icon: "lucide:wind"
            style: "breath"
            duration: 45
            prompt: "Inhale easily for 3 counts. Release on S for 6."
            videoGuide:
                title: "5 Breathing Exercises - from Easy to Super Challenging!"
                channel: "Healthy Vocal Technique"
                youtubeId: "RbxxqHJymBI"
            steps:
                - "Place one hand on the lower ribs."
                - "Inhale quietly for three counts without lifting the shoulders."
                - "Release on a steady S sound for six counts."
                - "Reset calmly before the next breath."
            sound:
                mode: "cue"
                title: "3 to 6 airflow cue"
                description: "Use a comfortable breath, then keep the release even."
                cues:
                    - label: "Inhale 3"
                      duration: 3
                      frequency: 660
                    - label: "S for 6"
                      duration: 6
                      frequency: 440
          - id: "breath-s-to-z"
            title: "S to Z airflow"
            shortTitle: "Zz release"
            icon: "lucide:waves"
            style: "breath"
            duration: 45
            prompt: "Keep the same airflow as S becomes a gentle Z."
            videoGuide:
                title: "Breath Support for Strong Clear Voice"
                channel: "Fauquier ENT"
                youtubeId: "GEJ30bnp780"
            steps:
                - "Take a small, quiet three-count inhale."
                - "Begin on S, then add voice to make Z without pushing."
                - "Keep the jaw and tongue relaxed."
                - "Stop before the end of the breath feels squeezed."
            sound:
                mode: "cue"
                title: "S to Z cue"
                description: "Connect steady airflow to easy voicing."
                cues:
                    - label: "Inhale"
                      duration: 3
                      frequency: 660
                    - label: "S to Z"
                      duration: 6
                      frequency: 494
    - slug: "posture"
      title: "Posture"
      icon: "lucide:person-standing"
      summary: "Remove body tension that blocks easy sound."
      concept: "Posture for singing is balanced and flexible. The head, ribs, and hips should stack without locking so the breath can move."
      guidance: "Check alignment, then keep that shape while making a very light sound."
      safetyCue: "Move gently. Do not force neck, jaw, or shoulder positions."
      visual:
          type: "posture"
      checkpoints:
          - "Jaw remains loose"
          - "Neck feels long"
          - "Body can sway slightly"
      exercises:
          - id: "posture-balanced-setup"
            title: "Balanced singing setup"
            shortTitle: "Scan"
            icon: "lucide:scan-line"
            style: "body"
            duration: 40
            prompt: "Stack feet, hips, ribs, and head before singing."
            videoGuide:
                title: "Singing Posture"
                channel: "30 Day Singer"
                youtubeId: "8CtkxM9huSg"
            steps:
                - "Place feet under the hips and unlock the knees."
                - "Let the ribs feel open without pushing the chest up."
                - "Float the head over the spine and soften the jaw."
                - "Sway slightly to confirm the body is balanced, not locked."
          - id: "posture-release"
            title: "Jaw, neck, and shoulder release"
            shortTitle: "Release"
            icon: "lucide:smile"
            style: "body"
            duration: 35
            prompt: "Release the areas that commonly tighten before singing."
            videoGuide:
                title: "Jaw Tension Release for Singing"
                channel: "Tina's Vocal Studio"
                youtubeId: "-fawt7WgwMw"
            steps:
                - "Let the head slowly turn right and left."
                - "Drop the jaw as if starting a yawn, then close gently."
                - "Roll the shoulders once and let them settle."
                - "Return to tall, easy alignment."
    - slug: "warm-ups"
      title: "Warm-ups"
      icon: "lucide:flame-kindling"
      summary: "Wake the voice with low-effort vibration."
      concept: "The safest first sounds are semi-occluded or lightly closed sounds, such as lip trills, straw-style hums, and gentle humming. They help the voice start without pushing."
      guidance: "Stay medium-soft. If the trill or hum stops, reduce volume and airflow."
      safetyCue: "Keep this quiet and easy. Stop if the voice gets scratchy or pressed."
      visual:
          type: "pitch"
      checkpoints:
          - "Tone starts easily"
          - "Volume stays medium-soft"
          - "No throat squeeze"
      exercises:
          - id: "warmup-lip-trill"
            title: "Lip trill 1-3-5-3-1"
            shortTitle: "Lip trill"
            icon: "lucide:music-2"
            style: "syllable"
            duration: 60
            prompt: "Use an easy lip trill on a short five-tone pattern."
            videoGuide:
                title: "Lip Trill Vocal Warm Up"
                channel: "Allison Surratt Music"
                youtubeId: "1BtLhIX0D-g"
            steps:
                - "Start near speaking range."
                - "Let the lips bubble with steady air."
                - "Follow the short pattern without getting louder at the top."
                - "Rest and breathe before the pattern moves up."
            sound:
                mode: "pattern"
                title: "Lip trill guide"
                description: "A compact SOVT pattern that moves up gradually."
                notes:
                    - "C4"
                    - "E4"
                    - "G4"
                    - "E4"
                    - "C4"
                tempo: 84
                waveform: "sine"
                progression:
                    steps: 5
                restDuration: 3
          - id: "warmup-hum-glide"
            title: "Gentle hum glide"
            shortTitle: "Hum glide"
            icon: "lucide:waves"
            style: "range"
            duration: 50
            prompt: "Glide on a quiet mm with loose lips and jaw."
            videoGuide:
                title: "Vocal Straw Exercises (Semi-Occluded Vocal Tract) Voice Therapy"
                channel: "Fauquier ENT"
                youtubeId: "eC_BFfTzhYE"
            steps:
                - "Keep lips gently closed and teeth apart."
                - "Start on the low note with an easy, quiet mm."
                - "Glide upward without increasing pressure."
                - "Return to the start and breathe."
            sound:
                mode: "glide"
                title: "Hum glide"
                description: "A gentle glide for warming up without force."
                from: "G3"
                to: "D4"
                duration: 3
                waveform: "sine"
                restDuration: 3
    - slug: "pitch"
      title: "Pitch"
      icon: "lucide:audio-lines"
      summary: "Learn to hear and match notes cleanly."
      concept: "Pitch improves when listening comes before singing. Small patterns and repeated anchors make it easier to hear the center of a note."
      guidance: "Listen first, sing softly, then correct gently instead of sliding around loudly."
      safetyCue: "Match softly. Do not chase pitch with volume or throat tension."
      visual:
          type: "pitch"
      checkpoints:
          - "Starting note stays stable"
          - "Corrections are gentle"
          - "Pitch changes are clean"
      exercises:
          - id: "pitch-listen-match"
            title: "Listen, remember, match"
            shortTitle: "Match"
            icon: "lucide:ear"
            style: "ear"
            duration: 50
            prompt: "Listen first. Sing the note only after the guide stops."
            videoGuide:
                title: "Voice Techniques: How to Match Pitch"
                channel: "Berklee Online"
                youtubeId: "00vt7RAvG70"
            steps:
                - "Listen without singing over the reference note."
                - "Match it softly with mm."
                - "Open to ah without changing pitch."
                - "Reset if the note drifts."
            sound:
                mode: "tone"
                title: "Pitch match guide"
                description: "Hear one clear note, then reproduce it during the quiet turn."
                note: "C4"
                duration: 1.5
                waveform: "sine"
                restDuration: 4
                restLabel: "Your turn"
          - id: "pitch-three-note"
            title: "Three-note pattern on Ma"
            shortTitle: "Ma scale"
            icon: "lucide:step-forward"
            style: "ear"
            duration: 55
            prompt: "Use Ma on 1-2-3-2-1, then breathe before it moves up."
            videoGuide:
                title: "Vocal Warm up | 5 Note Scale Up and Down"
                channel: "Dots Singing"
                youtubeId: "-EEZpiEjB2s"
            steps:
                - "Listen to the short pattern once."
                - "Sing Ma on each note with a light consonant."
                - "Keep the jaw released as the pattern moves up."
                - "Breathe during the gap before repeating."
            sound:
                mode: "pattern"
                title: "Ma scale guide"
                description: "A small stepwise pattern for accurate pitch changes."
                notes:
                    - "C4"
                    - "D4"
                    - "E4"
                    - "D4"
                    - "C4"
                tempo: 68
                waveform: "sine"
                progression:
                    steps: 5
                restDuration: 3
    - slug: "resonance"
      title: "Resonance"
      icon: "lucide:radio-tower"
      summary: "Find clear vibration without pushing."
      concept: "Resonance work helps the voice feel forward and efficient. Humming and NG sounds are useful because they encourage easy vibration before opening to vowels."
      guidance: "Look for an easy buzz around the lips, nose, or face. Do not add volume to force the sensation."
      safetyCue: "Do not force vibration. If the throat tightens, return to a softer hum."
      visual:
          type: "resonance"
      checkpoints:
          - "Buzz stays easy"
          - "Tongue releases forward"
          - "Tone stays clear"
      exercises:
          - id: "resonance-hum-vowel"
            title: "Hum to vowel"
            shortTitle: "Hum vowel"
            icon: "lucide:radio"
            style: "resonance"
            duration: 50
            prompt: "Start with mm, then open to a clear vowel."
            videoGuide:
                title: "3 Better HUMMING TIPS for your Vocal Warm Up"
                channel: "Find a Way to SING"
                youtubeId: "19VcX-_ojp0"
            steps:
                - "Listen to the reference tone, then hum it softly."
                - "Notice vibration without pressing."
                - "Open to ah while keeping the same ease."
                - "Return to mm if the throat tightens."
            sound:
                mode: "tone"
                title: "Hum resonance tone"
                description: "Hold an easy hum, then open to a vowel."
                note: "A3"
                duration: 2.4
                waveform: "sine"
                restDuration: 4
                restLabel: "Hum, then open"
          - id: "resonance-ng-vowel"
            title: "NG to ee"
            shortTitle: "NG vowel"
            icon: "lucide:move-right"
            style: "resonance"
            duration: 50
            prompt: "Move from NG to ee without changing effort or pitch."
            videoGuide:
                title: "Vocal Lessons: NG Singing Exercise For Building Pharyngeal Resonance"
                channel: "MSM"
                youtubeId: "-NwChqg2nG8"
            steps:
                - "Hold the final NG from sing."
                - "Open to ee without pulling the tongue back."
                - "Keep the jaw easy and the volume moderate."
                - "Return to NG if the throat starts helping."
            sound:
                mode: "pattern"
                title: "NG to ee guide"
                description: "Use a small 1-3-1 pattern to keep resonance easy."
                notes:
                    - "A3"
                    - "C4"
                    - "A3"
                tempo: 56
                waveform: "sine"
                progression: false
                restDuration: 3
    - slug: "range"
      title: "Vocal range"
      icon: "lucide:move-vertical"
      summary: "Explore high and low notes without force."
      concept: "Range is explored through gentle coordination. Sirens and short touch notes are safer than trying to hold difficult pitches."
      guidance: "Move only through comfortable notes. Stop before strain, scratchiness, or throat pressure."
      safetyCue: "Stay inside a comfortable range. Stop before pain, pressure, or loss of control."
      visual:
          type: "range"
      checkpoints:
          - "No throat squeeze"
          - "Tone stays connected"
          - "Edges remain gentle"
      exercises:
          - id: "range-comfortable-siren"
            title: "Comfortable fifth siren"
            shortTitle: "Siren"
            icon: "lucide:waves"
            style: "range"
            duration: 55
            prompt: "Slide lightly across a comfortable fifth, then rest."
            videoGuide:
                title: "The Siren Technique"
                channel: "Vinh Giang"
                youtubeId: "9AmQc1wjZVA"
            steps:
                - "Start on a relaxed oo or lip trill."
                - "Follow the glide upward."
                - "Return without adding pressure."
                - "Repeat only where the voice stays comfortable."
            sound:
                mode: "glide"
                title: "Range siren"
                description: "A modest glide for exploring coordination without pressing."
                from: "G3"
                to: "D4"
                duration: 3
                waveform: "sine"
                restDuration: 3
          - id: "range-top-touch"
            title: "Light 1-3-5-3-1 touch"
            shortTitle: "Top touch"
            icon: "lucide:move-up"
            style: "range"
            duration: 55
            prompt: "Touch the fifth briefly on Noo, then return."
            videoGuide:
                title: "How to sing HIGH NOTES!"
                channel: "Jodie Langel"
                youtubeId: "31OvtpkFoew"
            steps:
                - "Use a light Gee or Noo."
                - "Sing the pattern at medium-soft volume."
                - "Let the top note be quick, not held."
                - "Come back down before tension builds."
            sound:
                mode: "pattern"
                title: "Top-note touch guide"
                description: "A short ascending pattern that moves up gradually."
                notes:
                    - "C4"
                    - "E4"
                    - "G4"
                    - "E4"
                    - "C4"
                tempo: 80
                waveform: "sine"
                progression:
                    steps: 4
                restDuration: 3
    - slug: "articulation"
      title: "Articulation"
      icon: "lucide:message-circle"
      summary: "Shape consonants and vowels without jaw tension."
      concept: "Clear singing needs active lips and tongue with a relaxed jaw. Simple syllables and vowel patterns make diction clearer without forcing volume."
      guidance: "Keep the pitch pattern simple while the mouth does the coordination work."
      safetyCue: "Keep the jaw loose. Stop if the tongue, jaw, or throat starts pushing."
      visual:
          type: "styles"
          labels:
              - "Me"
              - "May"
              - "Mah"
      checkpoints:
          - "Jaw stays released"
          - "Tongue stays flexible"
          - "Words stay clear"
      exercises:
          - id: "articulation-vowel-chain"
            title: "Mee May Mah Moh Moo"
            shortTitle: "Vowels"
            icon: "lucide:message-circle"
            style: "syllable"
            duration: 55
            prompt: "Move through the vowels without locking the jaw."
            videoGuide:
                title: "Mi Mo Mu Help Your Choir Tune Whole Steps"
                channel: "Roger Hale"
                youtubeId: "436vvPSssoE"
            steps:
                - "Speak the syllables once at normal volume."
                - "Sing each syllable on the pattern."
                - "Let the lips and tongue change the vowel shape."
                - "Keep the jaw easy and the pitch steady."
            sound:
                mode: "pattern"
                title: "Vowel pattern guide"
                description: "A compact vowel pattern that moves up gradually."
                notes:
                    - "C4"
                    - "E4"
                    - "G4"
                    - "E4"
                    - "C4"
                tempo: 72
                waveform: "triangle"
                progression:
                    steps: 4
                restDuration: 3
          - id: "articulation-da-ga"
            title: "Light Da-Ga pattern"
            shortTitle: "Tongue"
            icon: "lucide:align-center"
            style: "syllable"
            duration: 45
            prompt: "Alternate Da and Ga without moving the jaw."
            videoGuide:
                title: "Better Diction in Singing - MAKE YOUR SONGS COME TO LIFE!"
                channel: "Healthy Vocal Technique"
                youtubeId: "96KWLPo1Fpg"
            steps:
                - "Touch D lightly behind the upper teeth."
                - "Make G with the back of the tongue, not the jaw."
                - "Keep the vowel open after the consonant."
                - "Stop if the jaw starts helping too much."
            sound:
                mode: "pattern"
                title: "Da-Ga guide"
                description: "A short 1-2-3-2-1 pattern for tongue independence."
                notes:
                    - "C4"
                    - "D4"
                    - "E4"
                    - "D4"
                    - "C4"
                tempo: 70
                waveform: "sine"
                progression:
                    steps: 5
                restDuration: 3
---
