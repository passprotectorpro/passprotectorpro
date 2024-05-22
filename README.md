# PassProtectorPro

## Description

PassProtectorPro is an application designed to analyze the complexity of passwords and provide insights into their strength. It utilizes machine learning models to predict the complexity of passwords based on various factors such as length, character types, entropy, and common patterns.

## Features

- **Password Complexity Prediction:** Predicts the complexity of passwords as Weak, Medium, or Strong.
- **Crack Time Estimation:** Estimates the time required to crack a password using different attack types.
- **Entropy Calculation:** Calculates the entropy of passwords to measure randomness and unpredictability.
- **Password Strength Analysis:** Analyzes the strength of passwords based on length, character types, and entropy.
- **Common Password Detection:** Identifies if a password is commonly used or leaked.
- **Repeating Pattern Detection:** Detects repeating patterns in passwords, which may reduce their strength.
- **Leet Speak Substitutions Detection:** Checks for Leet Speak substitutions in passwords.
- **CSV File Processing:** Allows processing multiple passwords from a CSV file and provides complexity analysis for each password.

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, Flask
- **Machine Learning:** Scikit-learn
- **Data Storage:** CSV files for input data
- **File Upload:** Flask file upload handling
- **Security:** Hashing (SHA256) for common password detection

## Prerequisites

Before running the application, ensure you have the following installed:

- [Python](https://www.python.org/downloads/)
- [Flask](https://flask.palletsprojects.com/en/2.0.x/installation/)
- [Scikit-learn](https://scikit-learn.org/stable/install.html)

## Usage

1. Navigate to the project directory.
2. Install required Python packages: `pip install -r requirements.txt`
3. Run the application using the following command: `gunicorn app:app`
4. Access the application through the browser at `http://localhost:8000`.
5. Enter a password in the input field and click on the "Predict Complexity" button to analyze its complexity.
6. Upload a CSV file containing passwords to analyze multiple passwords at once.
7. View detailed analysis and suggestions for password improvement on the dashboard.
