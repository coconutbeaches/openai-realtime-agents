async function fetchSessionToken() {
            const response = await fetch('/api/session', { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                return data.client_secret.value;
            }
            throw new Error('Failed to get session token');
        }

        async function fetchAgentInstructions() {
            const response = await fetch('/api/instructions');
            if (response.ok) {
                const data = await response.json();
                return data.instructions;
            }
            throw new Error('Failed to get agent instructions');
        }

        async function initializeVoiceChat() {
            const recordButton = document.getElementById('recordButton');
            const status = document.getElementById('status');
            const responseBubble = document.getElementById('responseBubble');

            let session = null;
            let isRecording = false;

            try {
                status.textContent = 'Initializing...';
                recordButton.disabled = true;
                
                // Get session token and instructions
                const [sessionToken, instructions] = await Promise.all([
                    fetchSessionToken(),
                    fetchAgentInstructions()
                ]);

                console.log('Session token obtained, creating agent...');
                
                // Create agent and session using the correct global object
                const { RealtimeAgent, RealtimeSession } = window.OpenAIAgentsRealtime;
                
                const agent = new RealtimeAgent({ 
                    name: 'Resort Helper', 
                    instructions: instructions
                });
                
                session = new RealtimeSession(agent, {
                    model: 'gpt-4o-realtime-preview-2025-06-03',
                    voice: 'alloy',
                    input_audio_format: 'pcm16',
                    output_audio_format: 'pcm16',
                    turn_detection: null, // Disable server VAD for manual push-to-talk
                    input_audio_transcription: {
                        model: 'whisper-1'
                    }
                });

                console.log('Connecting to session...');
                
                // Connect to the session
                await session.connect({ apiKey: sessionToken });
                
                console.log('Session connected successfully!');
                
                status.textContent = 'Ready! Press and hold to talk.';
                recordButton.textContent = 'Press to talk';
                recordButton.disabled = false;

                // Set up event listeners
                session.on('response.started', () => {
                    console.log('Assistant started responding');
                    status.textContent = 'Assistant is responding...';
                });

                session.on('response.completed', (response) => {
                    console.log('Assistant completed response:', response);
                    status.textContent = 'Ready! Press and hold to talk.';
                    
                    // Display the response text
                    if (response.output && response.output.length > 0) {
                        const lastOutput = response.output[response.output.length - 1];
                        if (lastOutput.type === 'message' && lastOutput.content) {
                            const textContent = lastOutput.content.find(c => c.type === 'text');
                            if (textContent) {
                                responseBubble.textContent = textContent.text;
                                responseBubble.style.display = 'block';
                            }
                        }
                    }
                });

                session.on('error', (error) => {
                    console.error('Session error:', error);
                    status.textContent = 'Error occurred. Please refresh and try again.';
                });

                // Set up proper push-to-talk using OpenAI Realtime buffer control
                let isPTTUserSpeaking = false;
                
                const startPushToTalk = () => {
                    if (isRecording || !session) return;
                    
                    console.log('Starting push-to-talk...');
                    
                    // Clear the input audio buffer - this is the key!
                    session.transport.sendEvent({ type: 'input_audio_buffer.clear' });
                    
                    isRecording = true;
                    isPTTUserSpeaking = true;
                    recordButton.classList.add('recording');
                    recordButton.textContent = 'Release to send';
                    status.textContent = 'Listening... speak now!';
                    responseBubble.style.display = 'none';
                    
                    console.log('Push-to-talk started - audio buffer cleared');
                };
                
                const stopPushToTalk = () => {
                    if (!isRecording || !isPTTUserSpeaking) return;
                    
                    console.log('Stopping push-to-talk...');
                    
                    isRecording = false;
                    isPTTUserSpeaking = false;
                    recordButton.classList.remove('recording');
                    recordButton.textContent = 'Press to talk';
                    status.textContent = 'Processing...';
                    
                    // Commit the audio buffer and create response - this triggers processing!
                    session.transport.sendEvent({ type: 'input_audio_buffer.commit' });
                    session.transport.sendEvent({ type: 'response.create' });
                    
                    console.log('Push-to-talk stopped - audio buffer committed');
                };

                // Mouse events
                recordButton.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    startPushToTalk();
                });

                recordButton.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    stopPushToTalk();
                });

                recordButton.addEventListener('mouseleave', (e) => {
                    if (isRecording) {
                        stopPushToTalk();
                    }
                });

                // Touch events for mobile
                recordButton.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    startPushToTalk();
                });

                recordButton.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    stopPushToTalk();
                });

                recordButton.addEventListener('touchcancel', (e) => {
                    e.preventDefault();
                    if (isRecording) {
                        stopPushToTalk();
                    }
                });

            } catch (error) {
                console.error('Initialization error:', error);
                status.textContent = 'Failed to initialize. Please refresh and try again.';
                recordButton.textContent = 'Initialization Failed';
                recordButton.disabled = true;
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing voice chat...');
            initializeVoiceChat();
        });

        // Prevent context menu on long press (mobile)
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });