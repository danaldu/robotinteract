from flask import Flask, render_template, request, jsonify
import openai
from gtts import gTTS
import os
import uuid

app = Flask(__name__)

openai.api_key = 'your-api-key'
messages = [
    {"role": "system", "content": "You are a kind helpful assistant."},
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_audio', methods=['POST'])
def process_audio():
    text = request.json['text']
    
    # Add user message to the conversation
    messages.append({"role": "user", "content": text})
    
    # Get ChatGPT response
    chat = openai.ChatCompletion.create(
        model="gpt-3.5-turbo", messages=messages
    )
    
    reply = chat.choices[0].message.content
    
    # Add assistant's reply to the conversation
    messages.append({"role": "assistant", "content": reply})
    
    # Convert reply to speech
    tts = gTTS(text=reply, lang='ar')
    audio_file = f"static/response_{uuid.uuid4()}.wav"
    tts.save(audio_file)
    
    return jsonify({'result': reply, 'audio_file': audio_file})

if __name__ == '__main__':
    app.run(debug=True)