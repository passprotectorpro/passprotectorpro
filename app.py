import re
import os
import csv
import math
import string
import hashlib
import psutil # type: ignore
import joblib # type: ignore
import numpy as np # type: ignore
import pandas as pd # type: ignore
from numpy import ndarray # type: ignore
from scipy.sparse import hstack # type: ignore
from xgboost import XGBClassifier  # type: ignore
from werkzeug.utils import secure_filename # type: ignore
from flask import Flask, jsonify, render_template, request # type: ignore

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(PROJECT_DIR, 'uploads')

common_passwords = [
    "123456", "123456789", "picture1", "password", "12345678", "111111", "123123", "12345", "1234567890",
    "senha", "1234567", "qwerty", "abc123", "Million2", "0", "1234", "iloveyou", "aaron431", "password1",
    "qqww1122", "123", "omgpop", "123321", "654321", "qwertyuiop", "qwer123456", "123456a", "a123456",
    "666666", "asdfghjkl", "ashley", "987654321", "unknown", "zxcvbnm", "112233", "chatbooks", "20100728",
    "123123123", "princess", "jacket025", "evite", "123abc", "123qwe", "sunshine", "121212", "dragon",
    "1q2w3e4r", "5201314", "159753", "123456789", "pokemon", "qwerty123", "Bangbang123", "jobandtalent",
    "monkey", "1qaz2wsx", "abcd1234", "default", "aaaaaa", "soccer", "123654", "ohmnamah23", "12345678910",
    "zing", "shadow", "102030", "11111111", "asdfgh", "147258369", "qazwsx", "qwe123", "michael", "football",
    "baseball", "1q2w3e4r5t", "party", "daniel", "asdasd", "222222", "myspace1", "asd123", "555555",
    "a123456789", "888888", "7777777", "fuckyou", "1234qwer", "superman", "147258", "999999", "159357",
    "love123", "tigger", "purple", "samantha", "charlie", "babygirl", "88888888", "jordan23", "789456123",
    "jordan", "anhyeuem", "killer", "basketball", "michelle", "1q2w3e", "lol123", "qwerty1", "789456",
    "6655321", "nicole", "naruto", "master", "chocolate", "maggie", "computer", "hannah", "jessica",
    "123456789a", "password123", "hunter", "686584", "iloveyou1", "987654321", "justin", "cookie", "hello",
    "blink182", "andrew", "25251325", "love", "987654", "bailey", "princess1", "123456", "101010", "12341234",
    "a801016", "1111", "1111111", "anthony", "yugioh", "fuckyou1", "amanda", "asdf1234", "trustno1", "butterfly",
    "x4ivygA51F", "iloveu", "batman", "starwars", "summer", "michael1", "lovely", "jakcgt333", "buster",
    "jennifer", "babygirl1", "family", "456789", "azerty", "andrea", "q1w2e3r4", "qwer1234", "hello123",
    "10203", "matthew", "pepper", "12345a", "letmein", "joshua", "131313", "123456b", "madison", "Sample123",
    "777777", "football1", "jesus1", "taylor", "b123456", "whatever", "welcome", "ginger", "flower", "333333",
    "1111111111", "robert", "samsung", "a12345", "loveme", "gabriel", "alexander", "cheese", "passw0rd", "142536",
    "peanut", "11223344", "thomas", "angel1"
]

passwords_list = []
complexity_list = []

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app = Flask(__name__, static_url_path='/static')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def calculate_entropy(password):
    charset = 0
    charset += 26 if any(char.islower() for char in password) else 0
    charset += 26 if any(char.isupper() for char in password) else 0
    charset += 10 if any(char.isdigit() for char in password) else 0
    charset += 32 if bool(re.search(r"[!@#$%^&*()_+\-\=[\]{};:'|,.<>/?]", password)) else 0

    if charset > 0:
        entropy = math.log2(charset) * len(password)
        return entropy
    else:
        return 0

def has_repeating_patterns(password, threshold=3):
    if threshold <= 1:
        return False

    pattern = re.compile(r"(.+?)\1{" + str(threshold - 1) + r",}")
    return bool(pattern.search(password))

def has_leet_speak_substitutions(password):
    leet_substitutions = {
        'a': ['4', '@'],
        'b': ['8'],
        'e': ['3'],
        'g': ['9', '6'],
        'i': ['1', '!', '|'],
        'l': ['1', '|', '!'],
        'o': ['0'],
        's': ['$', '5'],
        't': ['7', '+']
    }

    for char, substitutions in leet_substitutions.items():
        if any(sub in password.lower() for sub in substitutions):
            return 1

    return 0

def is_common_password(password, common_passwords):
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    for common_pwd in common_passwords:
        if hashed_password == common_pwd:
            return True
    return False

def is_complex(password):
    complexity_threshold = 3
    complexity = 0
    complexity += 1 if any(char.islower() for char in password) else 0
    complexity += 1 if any(char.isupper() for char in password) else 0
    complexity += 1 if any(char.isdigit() for char in password) else 0
    complexity += 1 if bool(re.search(r"[!@#$%^&*()_+\-\=[\]{};:'|,.<>/?]", password)) else 0

    return complexity >= complexity_threshold


def load_common_passwords(filename):
    with open(filename, 'r') as file:
        common_passwords = [line.strip() for line in file]
    return common_passwords


def extract_features(password):
    features = {}
    common_passwords = load_common_passwords('most common2023.txt')

    if not isinstance(password, str):
        password = str(password)

    features['length'] = len(password)
    features['uppercase_ratio'] = sum(c.isupper() for c in password) / len(password)
    features['lowercase_ratio'] = sum(c.islower() for c in password) / len(password)
    features['digit_ratio'] = sum(c.isdigit() for c in password) / len(password)
    features['special_ratio'] = len(re.findall(r'[^a-zA-Z0-9]', password)) / len(password)

    return features

def analyze_password(password):
    length = len(password)
    upper = sum(1 for char in password if char.isupper())
    lower = sum(1 for char in password if char.islower())
    digits = sum(1 for char in password if char.isdigit())
    special = sum(1 for char in password if not char.isalnum())
    entropy = calculate_entropy(password)
    return length, upper, lower, digits, special, entropy

def calculate_crack_time(password):
    options = {
        'upper': any(char.isupper() for char in password),
        'lower': any(char.islower() for char in password),
        'digit': any(char.isdigit() for char in password),
        'special': any(not char.isalnum() for char in password)
    }

    password_description = []
    total_possible_characters = 0
    password_length = len(password)

    for option, value in options.items():
        if value:
            password_description.append(option)
            if option == 'upper':
                total_possible_characters += 26
            elif option == 'lower':
                total_possible_characters += 26
            elif option == 'digit':
                total_possible_characters += 10
            elif option == 'special':
                total_possible_characters += 33


    freq = psutil.cpu_freq()
    if freq is not None:
      processor_speed=freq.current * 10**6  
    else:
        return "Unavailable"
    num_combinations = total_possible_characters ** password_length
    if processor_speed != "Unavailable":
        password_attempts_per_second = 1000000 
        avg_time_required_seconds = num_combinations / (password_attempts_per_second * (processor_speed / 10**6))  # Convert processor speed to operations per second
        return avg_time_required_seconds
    else:
        return None

def format_time(seconds):
    intervals = (
        ('year', 31536000),
        ('month', 2592000),
        ('week', 604800),
        ('day', 86400),
        ('hour', 3600),
        ('minute', 60),
        ('second', 1)
    )

    result = []

    for name, count in intervals:
        value = seconds // count
        if value:
            seconds -= value * count
            if value == 1:
                name = name.rstrip('s')
            result.append(f"{int(value)} {name}")

    if not result:
        return "less than a second"

    if len(result) == 1:
        return f"{result[0]}"

    return ', '.join(result[:-1]) + f" and {result[-1]}"

def suggest_improvement(password):
    suggestions = []

    if len(password) < 8:
        suggestions.append("Increase the length of the password.")

    if not any(char.isdigit() for char in password):
        suggestions.append("Include at least one digit (0-9) in the password.")
    if not any(char.islower() for char in password):
        suggestions.append("Include at least one lowercase letter (a-z) in the password.")
    if not any(char.isupper() for char in password):
        suggestions.append("Include at least one uppercase letter (A-Z) in the password.")
    if not any(char in string.punctuation for char in password):
        suggestions.append("Include at least one special character (!@#$%^&*()-_=+[]{}|;:',.<>?~) in the password.")

    if has_repeating_patterns(password):
        suggestions.append("Avoid repeating patterns in the password.")

    if has_leet_speak_substitutions(password):
        suggestions.append("Avoid using Leet Speak substitutions (e.g., replacing 'e' with '3' or 's' with '$').")

    return suggestions

def predict_complexity(password):
    model = joblib.load("new_train.pkl")
    password_features = extract_features(password)
    password_features_df = pd.DataFrame(password_features, index=[0])
    tfidf = joblib.load("new_tfidf.pkl")
    tf = tfidf.transform([password])
    password_features_reshaped = hstack([tf, password_features_df])
    predicted_strength = model.predict(password_features_reshaped)
    return int(predicted_strength[0])

def perform_incremental_learning(new_X, new_y):
    existing_model = joblib.load("new_train.pkl")
    existing_data = pd.read_csv('password_strengths.csv', header=None)
    existing_X = existing_data.iloc[:, :-1]
    existing_y = existing_data.iloc[:, -1]

    combined_X = pd.concat([existing_X, new_X], ignore_index=True)
    combined_y = pd.concat([existing_y, new_y], ignore_index=True)
    combined_y = combined_y.astype(int)

    new_model = XGBClassifier()
    new_model.fit(combined_X, combined_y.values.ravel())  

    joblib.dump(new_model, "new_train.pkl")

def get_complexity_label(complexity_value):
    if isinstance(complexity_value, ndarray):
        complexity_value = complexity_value[0]
    if complexity_value == 0:
        return 'Weak'
    elif complexity_value == 1:
        return 'Medium'
    elif complexity_value == 2:
        return 'Strong'

def incremental_learning_if_needed(new_X_df, complexity_value):
    existing_model = joblib.load("new_train.pkl")
    existing_data = pd.read_csv('password_strengths.csv', header=None)
    existing_X = existing_data.iloc[:, :-1]
    existing_y = existing_data.iloc[:, -1]

    try:
        
        if not isinstance(new_X_df, pd.DataFrame):
            new_X_df = pd.DataFrame(new_X_df)
    except Exception as e:
        print("Error converting new_X_df to DataFrame:", e)
        return

    if not isinstance(complexity_value, str):
        complexity_value = str(complexity_value)


    if complexity_value in ["very weak, due to it is leaked", "weak, due to repeated pattern"]:
        complexity_value = "weak"
    print("Type of new_X_df:", type(new_X_df))

    combined_X = pd.concat([existing_X, new_X_df], ignore_index=True)
    combined_y = pd.concat([existing_y, pd.Series([complexity_value])], ignore_index=True)

    perform_incremental_learning(combined_X, combined_y)


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict_complexity', methods=['POST'])
def predict_complexity_route():
    password = request.form['password']
    entropy = calculate_entropy(password)

    if password in common_passwords:
        complexity = 'very weak, due to it is leaked'
    elif has_repeating_patterns(password):
        complexity = 'weak, due to repeated pattern'
    else:
        complexity_value = predict_complexity(password)
        complexity = get_complexity_label(complexity_value)

    
        incremental_learning_if_needed(password, complexity_value)

    crack_time = calculate_crack_time(password)
    time_display = format_time(crack_time)
    length, upper, lower, digits, special, entropy = analyze_password(password)

  
    passwords_list.append(password)
    complexity_list.append(complexity)

    return jsonify({
        'password': password,
        'predicted_complexity': complexity,
        'crack_time': time_display,
        'length': length,
        'upper': upper,
        'lower': lower,
        'digits': digits,
        'special': special,
        'entropy': entropy
    })

@app.route('/dashboard')
def dashboard():
    password = request.args.get('password')
    length, upper, lower, digits, special, entropy = analyze_password(password)
    complexity = predict_complexity(password)
    crack_time = calculate_crack_time(password)
    time_display = format_time(crack_time)
    improvement_suggestions = suggest_improvement(password)

    return render_template('dashboard.html',
                           password=password,
                           length=length,
                           upper=upper,
                           lower=lower,
                           digits=digits,
                           special=special,
                           entropy=entropy,
                           predicted_complexity=complexity,
                           crack_time=time_display,
                           improvement_suggestions=improvement_suggestions
                           )
@app.route('/process_csv', methods=['POST'])
def process_csv():
    if 'csvFile' not in request.files:
        return jsonify({'error': 'No file part'})

    csv_file = request.files['csvFile']
    if csv_file.filename == '':
        return jsonify({'error': 'No selected file'})

    if not csv_file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be a CSV file'})

    filename = secure_filename(csv_file.filename)
    csv_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    with open(os.path.join(app.config['UPLOAD_FOLDER'], filename), 'r') as file:
        csv_reader = csv.reader(file)
        header = next(csv_reader)
        if len(header) != 1:
            return jsonify({'error': 'CSV file must have only one column'})

        password_complexities = []
        for row in csv_reader:
            password = row[0].strip()
            complexity = 'Weak'
            time = calculate_crack_time(row[0].strip())
            time_display = format_time(time)

            if password in common_passwords or is_common_password(password, common_passwords):
                complexity = 'very weak, due to it is leaked'
            elif has_repeating_patterns(password):
                complexity = 'weak, due to repeated pattern'
            else:
                complexity_value = predict_complexity(password)
                if complexity_value == 0:
                    complexity = 'Weak'
                elif complexity_value == 1:
                    complexity = 'Medium'
                elif complexity_value == 2:
                    complexity = 'Strong'

            password_complexities.append((password, complexity, time_display))

    os.remove(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    return jsonify({'password_complexities': password_complexities})

if __name__ == '__main__':
    app.run(debug=True)

