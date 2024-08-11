$(document).ready(function() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'ar-SA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let isListening = false;

    $('#startButton').click(function() {
        isListening = true;
        recognition.start();
        $('#startButton').prop('disabled', true);
        $('#stopButton').prop('disabled', false);
        $('.wave-container').removeClass('wave-animation-paused');
    });

    $('#stopButton').click(function() {
        stopListening();
    });

    function stopListening() {
        isListening = false;
        recognition.stop();
        $('#startButton').prop('disabled', false);
        $('#stopButton').prop('disabled', true);
        $('.wave-container').addClass('wave-animation-paused');
    }

    recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;
        
        $.ajax({
            url: '/process_audio',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({text: text}),
            success: function(response) {
                $('#output').append('<p><strong>أنت:</strong> ' + text + '</p>');
                $('#output').append('<p><strong>ChatGPT:</strong> ' + response.result + '</p>');
                
                // Play audio response
                const audioPlayer = $('#audioPlayer');
                audioPlayer.attr('src', response.audio_file);
                audioPlayer.show();
                audioPlayer[0].play();
                
                if (text.trim().toLowerCase() === 'توقف') {
                    stopListening();
                } else {
                    // Temporarily stop listening after each phrase
                    recognition.stop();
                }
            }
        });
    };

    recognition.onend = function() {
        if (isListening) {
            // Short delay before restarting recognition
            setTimeout(() => {
                recognition.start();
            }, 1000);
        } else {
            $('.wave-container').addClass('wave-animation-paused');
        }
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        stopListening();
    };
});