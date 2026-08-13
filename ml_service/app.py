from flask import Flask, request, jsonify
from deepface import DeepFace
import base64
import cv2
import numpy as np

app = Flask(__name__)

def base64_to_image(base64_string):
    # Remove header if exists
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    img_data = base64.b64decode(base64_string)
    np_arr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

@app.route('/verify', methods=['POST'])
def verify_face():
    data = request.json
    if 'image' not in data:
        return jsonify({"error": "No image provided"}), 400

    try:
        img = base64_to_image(data['image'])
        
        # Analyze face using DeepFace (checks age, gender, emotion)
        analysis = DeepFace.analyze(img, actions=['age', 'emotion'], enforce_detection=True)
        
        # enforce_detection=True ensures that a real face MUST be present in the image
        # If no face is found, DeepFace throws an exception and it goes to the except block.
        
        estimated_age = analysis[0]['age']
        
        return jsonify({
            "is_human": True,
            "age": estimated_age
        })
    except Exception as e:
        # Fails if image is blurry, no face is detected, or it's a fake image
        return jsonify({
            "is_human": False,
            "age": 0
        }), 400

if __name__ == '__main__':
    app.run(port=5000)
