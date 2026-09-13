---
title: "Práctica Vocal"
description: "Un espacio de entrenamiento vocal enfocado para ejercicios de canto rápidos y prácticos."

hero:
    kicker: "Entrenamiento vocal diario"
    title: "Construye primero los hábitos básicos."
    intro: "Una serie de ejercicios vocales prácticos y seguros para principiantes: postura, respiración, calentamiento, afinación, resonancia, rango y articulación."
    primaryAction: "Empezar con respiración"
    secondaryAction: "Ver temas"

recommendedSequence:
    label: "Flujo recomendado"
    note: "Usa este orden para una sesión equilibrada, o salta al tema que necesites."
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
      title: "Respiración"
      icon: "lucide:wind"
      summary: "Entrena un flujo de aire estable antes de añadir altura tonal."
      concept: "Cantar bien empieza con una inhalación fácil y una salida controlada. El objetivo no es tomar una respiración enorme; es lograr un flujo de aire silencioso y repetible sin apretar la garganta."
      guidance: "Usa las señales temporizadas para sentir cómo se abren las costillas y luego deja que el aire salga de forma uniforme."
      safetyCue: "Detente si sientes mareo, presión en la garganta o falta de aire. Usa respiraciones más pequeñas."
      visual:
          type: "breathing"
      checkpoints:
          - "La inhalación es silenciosa"
          - "Los hombros permanecen relajados"
          - "La salida se mantiene uniforme"
      exercises:
          - id: "breath-steady-s"
            title: "Inhalación fácil y S estable"
            shortTitle: "Salida en S"
            icon: "lucide:wind"
            style: "breath"
            duration: 45
            prompt: "Inhala con facilidad durante 3 tiempos. Suelta en S durante 6."
            videoGuide:
                title: "5 Breathing Exercises - from Easy to Super Challenging!"
                channel: "Healthy Vocal Technique"
                youtubeId: "RbxxqHJymBI"
            steps:
                - "Coloca una mano sobre las costillas inferiores."
                - "Inhala en silencio durante tres tiempos sin levantar los hombros."
                - "Suelta el aire con una S estable durante seis tiempos."
                - "Reinicia con calma antes de la siguiente respiración."
            sound:
                mode: "cue"
                title: "Señal de flujo 3 a 6"
                description: "Toma una respiración cómoda y mantén uniforme la salida."
                cues:
                    - label: "Inhala 3"
                      duration: 3
                      frequency: 660
                    - label: "S durante 6"
                      duration: 6
                      frequency: 440
          - id: "breath-s-to-z"
            title: "Flujo de S a Z"
            shortTitle: "Salida Zz"
            icon: "lucide:waves"
            style: "breath"
            duration: 45
            prompt: "Mantén el mismo flujo cuando S se convierta en una Z suave."
            videoGuide:
                title: "Breath Support for Strong Clear Voice"
                channel: "Fauquier ENT"
                youtubeId: "GEJ30bnp780"
            steps:
                - "Toma una inhalación pequeña y silenciosa de tres tiempos."
                - "Empieza en S y añade voz para formar Z sin empujar."
                - "Mantén la mandíbula y la lengua relajadas."
                - "Detente antes de que el final del aire se sienta apretado."
            sound:
                mode: "cue"
                title: "Señal de S a Z"
                description: "Conecta un flujo estable con una voz fácil."
                cues:
                    - label: "Inhala"
                      duration: 3
                      frequency: 660
                    - label: "S a Z"
                      duration: 6
                      frequency: 494
    - slug: "posture"
      title: "Postura"
      icon: "lucide:person-standing"
      summary: "Reduce la tensión corporal que bloquea un sonido fácil."
      concept: "La postura para cantar es equilibrada y flexible. Cabeza, costillas y caderas deben alinearse sin bloquearse para que la respiración pueda moverse."
      guidance: "Revisa la alineación y luego conserva esa forma mientras produces un sonido muy ligero."
      safetyCue: "Muévete con suavidad. No fuerces la posición del cuello, la mandíbula ni los hombros."
      visual:
          type: "posture"
      checkpoints:
          - "La mandíbula sigue suelta"
          - "El cuello se siente largo"
          - "El cuerpo puede balancearse un poco"
      exercises:
          - id: "posture-balanced-setup"
            title: "Preparación corporal equilibrada"
            shortTitle: "Escaneo"
            icon: "lucide:scan-line"
            style: "body"
            duration: 40
            prompt: "Alinea pies, caderas, costillas y cabeza antes de cantar."
            videoGuide:
                title: "Singing Posture"
                channel: "30 Day Singer"
                youtubeId: "8CtkxM9huSg"
            steps:
                - "Coloca los pies debajo de las caderas y desbloquea las rodillas."
                - "Siente las costillas abiertas sin empujar el pecho hacia arriba."
                - "Deja que la cabeza flote sobre la columna y suaviza la mandíbula."
                - "Balancéate ligeramente para comprobar que el cuerpo no está bloqueado."
          - id: "posture-release"
            title: "Liberación de mandíbula, cuello y hombros"
            shortTitle: "Liberar"
            icon: "lucide:smile"
            style: "body"
            duration: 35
            prompt: "Libera las zonas que suelen tensarse antes de cantar."
            videoGuide:
                title: "Jaw Tension Release for Singing"
                channel: "Tina's Vocal Studio"
                youtubeId: "-fawt7WgwMw"
            steps:
                - "Gira lentamente la cabeza hacia la derecha y la izquierda."
                - "Deja caer la mandíbula como si empezaras a bostezar y ciérrala con suavidad."
                - "Rueda los hombros una vez y déjalos asentarse."
                - "Vuelve a una alineación alta y cómoda."
    - slug: "warm-ups"
      title: "Calentamientos"
      icon: "lucide:flame-kindling"
      summary: "Despierta la voz con vibración de bajo esfuerzo."
      concept: "Los sonidos iniciales más seguros son semioclusivos o ligeramente cerrados, como trinos de labios, tarareos tipo pajita y tarareo suave. Ayudan a iniciar la voz sin empujar."
      guidance: "Mantente en un volumen medio-suave. Si el trino o el tarareo se corta, reduce volumen y flujo de aire."
      safetyCue: "Mantén esto silencioso y fácil. Detente si la voz se vuelve áspera o presionada."
      visual:
          type: "pitch"
      checkpoints:
          - "El tono empieza fácilmente"
          - "El volumen se mantiene medio-suave"
          - "No hay apretón en la garganta"
      exercises:
          - id: "warmup-lip-trill"
            title: "Trino de labios 1-3-5-3-1"
            shortTitle: "Trino labios"
            icon: "lucide:music-2"
            style: "syllable"
            duration: 60
            prompt: "Usa un trino fácil sobre un patrón corto de cinco tonos."
            videoGuide:
                title: "Lip Trill Vocal Warm Up"
                channel: "Allison Surratt Music"
                youtubeId: "1BtLhIX0D-g"
            steps:
                - "Empieza cerca de tu rango hablado."
                - "Deja que los labios vibren con aire estable."
                - "Sigue las notas sin subir el volumen en la parte alta."
                - "Descansa y respira antes de que el patrón suba."
            sound:
                mode: "pattern"
                title: "Guía de trino de labios"
                description: "Un patrón SOVT compacto que sube gradualmente."
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
            title: "Deslizamiento suave en mm"
            shortTitle: "Tarareo"
            icon: "lucide:waves"
            style: "range"
            duration: 50
            prompt: "Desliza sobre un mm suave con labios y mandíbula sueltos."
            videoGuide:
                title: "Vocal Straw Exercises (Semi-Occluded Vocal Tract) Voice Therapy"
                channel: "Fauquier ENT"
                youtubeId: "eC_BFfTzhYE"
            steps:
                - "Mantén los labios suavemente cerrados y los dientes separados."
                - "Empieza en la nota grave con un mm fácil."
                - "Desliza hacia arriba sin aumentar presión."
                - "Vuelve al inicio y respira."
            sound:
                mode: "glide"
                title: "Deslizamiento en mm"
                description: "Un deslizamiento suave para calentar sin fuerza."
                from: "G3"
                to: "D4"
                duration: 3
                waveform: "sine"
                restDuration: 3
    - slug: "pitch"
      title: "Afinación"
      icon: "lucide:audio-lines"
      summary: "Aprende a escuchar y emparejar notas con limpieza."
      concept: "La afinación mejora cuando escuchar va antes que cantar. Los patrones pequeños y los anclajes repetidos facilitan oír el centro de una nota."
      guidance: "Escucha primero, canta suave y corrige con cuidado en lugar de deslizar fuerte."
      safetyCue: "Empareja suavemente. No persigas la afinación con volumen ni tensión de garganta."
      visual:
          type: "pitch"
      checkpoints:
          - "La nota inicial se mantiene estable"
          - "Las correcciones son suaves"
          - "Los cambios de afinación son limpios"
      exercises:
          - id: "pitch-listen-match"
            title: "Escucha, recuerda y empareja"
            shortTitle: "Emparejar"
            icon: "lucide:ear"
            style: "ear"
            duration: 50
            prompt: "Escucha primero. Canta solo después de que la guía se detenga."
            videoGuide:
                title: "Voice Techniques: How to Match Pitch"
                channel: "Berklee Online"
                youtubeId: "00vt7RAvG70"
            steps:
                - "Escucha sin cantar encima de la nota de referencia."
                - "Empáréjala suavemente con mm."
                - "Abre a ah sin cambiar la afinación."
                - "Reinicia si la nota se desplaza."
            sound:
                mode: "tone"
                title: "Guía de emparejar afinación"
                description: "Escucha una nota clara y reprodúcela durante el turno silencioso."
                note: "C4"
                duration: 1.5
                waveform: "sine"
                restDuration: 4
                restLabel: "Tu turno"
          - id: "pitch-three-note"
            title: "Patrón de tres notas en Ma"
            shortTitle: "Escala Ma"
            icon: "lucide:step-forward"
            style: "ear"
            duration: 55
            prompt: "Canta Ma en 1-2-3-2-1 y respira antes de subir."
            videoGuide:
                title: "Vocal Warm up | 5 Note Scale Up and Down"
                channel: "Dots Singing"
                youtubeId: "-EEZpiEjB2s"
            steps:
                - "Escucha una vez el patrón corto."
                - "Canta Ma en cada nota con una consonante ligera."
                - "Mantén la mandíbula liberada mientras el patrón sube."
                - "Respira durante la pausa antes de repetir."
            sound:
                mode: "pattern"
                title: "Guía de escala Ma"
                description: "Un patrón pequeño por grados para cambios de afinación precisos."
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
      title: "Resonancia"
      icon: "lucide:radio-tower"
      summary: "Encuentra una vibración clara sin empujar."
      concept: "El trabajo de resonancia ayuda a que la voz se sienta frontal y eficiente. Los tarareos y sonidos NG son útiles porque fomentan una vibración fácil antes de abrir a vocales."
      guidance: "Busca una vibración fácil alrededor de labios, nariz o cara. No subas el volumen para forzar la sensación."
      safetyCue: "No fuerces la vibración. Si la garganta se tensa, vuelve a un tarareo más suave."
      visual:
          type: "resonance"
      checkpoints:
          - "La vibración sigue fácil"
          - "La lengua se libera hacia delante"
          - "El tono se mantiene claro"
      exercises:
          - id: "resonance-hum-vowel"
            title: "Tarareo a vocal"
            shortTitle: "Tarareo vocal"
            icon: "lucide:radio"
            style: "resonance"
            duration: 50
            prompt: "Empieza con mm y luego abre a una vocal clara."
            videoGuide:
                title: "3 Better HUMMING TIPS for your Vocal Warm Up"
                channel: "Find a Way to SING"
                youtubeId: "19VcX-_ojp0"
            steps:
                - "Escucha el tono de referencia y luego tararéalo suavemente."
                - "Nota la vibración sin presionar."
                - "Abre a ah manteniendo la misma facilidad."
                - "Vuelve a mm si la garganta se tensa."
            sound:
                mode: "tone"
                title: "Tono de resonancia en tarareo"
                description: "Mantén un tarareo fácil y luego abre a una vocal."
                note: "A3"
                duration: 2.4
                waveform: "sine"
                restDuration: 4
                restLabel: "Tararea y abre"
          - id: "resonance-ng-vowel"
            title: "NG a ee"
            shortTitle: "NG vocal"
            icon: "lucide:move-right"
            style: "resonance"
            duration: 50
            prompt: "Pasa de NG a ee sin cambiar el esfuerzo ni la afinación."
            videoGuide:
                title: "Vocal Lessons: NG Singing Exercise For Building Pharyngeal Resonance"
                channel: "MSM"
                youtubeId: "-NwChqg2nG8"
            steps:
                - "Mantén el NG final de la palabra sing."
                - "Abre a ee sin tirar la lengua hacia atrás."
                - "Mantén la mandíbula fácil y el volumen moderado."
                - "Vuelve a NG si la garganta empieza a ayudar."
            sound:
                mode: "pattern"
                title: "Guía de NG a ee"
                description: "Usa un patrón pequeño 1-3-1 para mantener una resonancia fácil."
                notes:
                    - "A3"
                    - "C4"
                    - "A3"
                tempo: 56
                waveform: "sine"
                progression: false
                restDuration: 3
    - slug: "range"
      title: "Rango vocal"
      icon: "lucide:move-vertical"
      summary: "Explora notas agudas y graves sin fuerza."
      concept: "El rango se explora con coordinación suave. Las sirenas y las notas de toque breve son más seguras que intentar sostener alturas difíciles."
      guidance: "Muévete solo por notas cómodas. Detente antes de sentir tensión, aspereza o presión en la garganta."
      safetyCue: "Permanece dentro de un rango cómodo. Detente antes de dolor, presión o pérdida de control."
      visual:
          type: "range"
      checkpoints:
          - "No hay apretón en la garganta"
          - "El tono sigue conectado"
          - "Los extremos se mantienen suaves"
      exercises:
          - id: "range-comfortable-siren"
            title: "Sirena cómoda de quinta"
            shortTitle: "Sirena"
            icon: "lucide:waves"
            style: "range"
            duration: 55
            prompt: "Desliza suavemente por una quinta cómoda y descansa."
            videoGuide:
                title: "The Siren Technique"
                channel: "Vinh Giang"
                youtubeId: "9AmQc1wjZVA"
            steps:
                - "Empieza con un uu relajado o un trino de labios."
                - "Sigue el deslizamiento hacia arriba."
                - "Vuelve sin añadir presión."
                - "Repite solo donde la voz siga cómoda."
            sound:
                mode: "glide"
                title: "Sirena de rango"
                description: "Un deslizamiento moderado para explorar coordinación sin presionar."
                from: "G3"
                to: "D4"
                duration: 3
                waveform: "sine"
                restDuration: 3
          - id: "range-top-touch"
            title: "Toque ligero 1-3-5-3-1"
            shortTitle: "Toque alto"
            icon: "lucide:move-up"
            style: "range"
            duration: 55
            prompt: "Toca brevemente la quinta en Noo y vuelve."
            videoGuide:
                title: "How to sing HIGH NOTES!"
                channel: "Jodie Langel"
                youtubeId: "31OvtpkFoew"
            steps:
                - "Usa un Gee o Noo ligero."
                - "Canta el patrón a volumen medio-suave."
                - "Deja que la nota alta sea rápida, no sostenida."
                - "Vuelve hacia abajo antes de que aumente la tensión."
            sound:
                mode: "pattern"
                title: "Guía de toque de nota alta"
                description: "Un patrón ascendente corto que sube gradualmente."
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
      title: "Articulación"
      icon: "lucide:message-circle"
      summary: "Da forma a consonantes y vocales sin tensión de mandíbula."
      concept: "Cantar con claridad necesita labios y lengua activos con una mandíbula relajada. Las sílabas simples y los patrones de vocales mejoran la dicción sin forzar volumen."
      guidance: "Mantén el patrón de notas simple mientras la boca hace el trabajo de coordinación."
      safetyCue: "Mantén la mandíbula suelta. Detente si la lengua, la mandíbula o la garganta empiezan a empujar."
      visual:
          type: "styles"
          labels:
              - "Me"
              - "May"
              - "Mah"
      checkpoints:
          - "La mandíbula sigue liberada"
          - "La lengua sigue flexible"
          - "Las palabras siguen claras"
      exercises:
          - id: "articulation-vowel-chain"
            title: "Mee May Mah Moh Moo"
            shortTitle: "Vocales"
            icon: "lucide:message-circle"
            style: "syllable"
            duration: 55
            prompt: "Pasa por las vocales sin bloquear la mandíbula."
            videoGuide:
                title: "Mi Mo Mu Help Your Choir Tune Whole Steps"
                channel: "Roger Hale"
                youtubeId: "436vvPSssoE"
            steps:
                - "Di las sílabas una vez a volumen normal."
                - "Canta cada sílaba sobre el patrón."
                - "Deja que labios y lengua cambien la forma de la vocal."
                - "Mantén la mandíbula fácil y la afinación estable."
            sound:
                mode: "pattern"
                title: "Guía de patrón de vocales"
                description: "Un patrón compacto de vocales que sube gradualmente."
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
            title: "Patrón ligero Da-Ga"
            shortTitle: "Lengua"
            icon: "lucide:align-center"
            style: "syllable"
            duration: 45
            prompt: "Alterna Da y Ga sin mover la mandíbula."
            videoGuide:
                title: "Better Diction in Singing - MAKE YOUR SONGS COME TO LIFE!"
                channel: "Healthy Vocal Technique"
                youtubeId: "96KWLPo1Fpg"
            steps:
                - "Toca ligeramente detrás de los dientes superiores para D."
                - "Forma G con la parte posterior de la lengua, no con la mandíbula."
                - "Mantén la vocal abierta después de la consonante."
                - "Detente si la mandíbula empieza a ayudar demasiado."
            sound:
                mode: "pattern"
                title: "Guía Da-Ga"
                description: "Un patrón corto 1-2-3-2-1 para independencia de la lengua."
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
