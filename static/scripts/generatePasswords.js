// Function to generate a random password
const generatePassword = (length) => {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_+=[]{}|;:,.<>?';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};

// Function to generate passwords
const generateUniquePasswords = (length) => {
  const passwords = new Set();

  while (passwords.size < 5) {
    const newPassword = generatePassword(length);

    if (!passwords.has(newPassword)) passwords.add(newPassword);
  }

  return Array.from(passwords);
};

// Function to generate passwords and display them
const generateAndDisplayPasswords = () => {
  const passwordsContainer = document.getElementById('passwords-container');
  passwordsContainer.innerHTML = ''; // Clear previous passwords

  const passwords = generateUniquePasswords(20);

  passwords.forEach((password) => {
    const passwordCard = document.createElement('div');
    passwordCard.classList.add('password-card');

    const passwordText = document.createElement('div');
    passwordText.classList.add('password');
    passwordText.textContent = password;
    passwordCard.appendChild(passwordText);

    const copyIcon = document.createElement('span');
    copyIcon.classList.add('copy-icon');
    copyIcon.innerHTML = '&#x1F4CB;'; // Unicode for copy icon

    copyIcon.addEventListener('click', () => {
      copyPassword(password);

      copyIcon.innerHTML = 'Copied!';
      setTimeout(() => {
        copyIcon.innerHTML = '&#x1F4CB;';
      }, 2000); // Reset icon after 3 seconds
    });

    passwordCard.appendChild(copyIcon);

    passwordsContainer.appendChild(passwordCard);
  });
};

// Function to generate passwords based on user requirements and display them
const generateAndDisplayRequirementsPasswords = () => {
  const regenerateButton = document.querySelector('.requirements-regenerate-button');

  regenerateButton.disabled = false;

  // Retrieve user input values
  const lengthInput = document.getElementById('length');
  const numbersInput = document.getElementById('numbers');
  const uppercaseInput = document.getElementById('uppercase');
  const lowercaseInput = document.getElementById('lowercase');
  const specialInput = document.getElementById('special');

  const length = parseInt(lengthInput.value);
  const numbersCount = parseInt(numbersInput.value);
  const uppercaseCount = parseInt(uppercaseInput.value);
  const lowercaseCount = parseInt(lowercaseInput.value);
  const specialCount = parseInt(specialInput.value);

  // Display helper text if any input field is empty but allow a value of 0
  displayHelperText(lengthInput, length === 0, 'Please input length larger than 0.');
  displayHelperText(numbersInput, numbersCount === 0, 'This field is required.');
  displayHelperText(uppercaseInput, uppercaseCount === 0, 'This field is required.');
  displayHelperText(lowercaseInput, lowercaseCount === 0, 'This field is required.');
  displayHelperText(specialInput, specialCount === 0, 'This field is required.');

  // // Disable regenerate button if any input field is empty or negative
  // if (
  //   length === 0 ||
  //   length <= 0 ||
  //   numbersCount < 0 ||
  //   uppercaseCount < 0 ||
  //   lowercaseCount < 0 ||
  //   specialCount < 0 ||
  //   isNaN(length) ||
  //   isNaN(numbersCount) ||
  //   isNaN(uppercaseCount) ||
  //   isNaN(lowercaseCount) ||
  //   isNaN(specialCount)
  // ) {
  //   regenerateButton.disabled = true;
  //   return;
  // }

  // Clear previous helper text and remove invalid input class
  clearHelperText(lengthInput);
  clearHelperText(numbersInput);
  clearHelperText(uppercaseInput);
  clearHelperText(lowercaseInput);
  clearHelperText(specialInput);

  // Display error or warning messages as helper text
  displayHelperText(
    lengthInput,
    numbersCount + uppercaseCount + lowercaseCount + specialCount > length,
    'Sum of all fields lengths exceeds the input length.'
  );
  displayHelperText(numbersInput, numbersCount > length, 'Numbers count exceeds length.');
  displayHelperText(uppercaseInput, uppercaseCount > length, 'Uppercase count exceeds length.');
  displayHelperText(lowercaseInput, lowercaseCount > length, 'Lowercase count exceeds length.');
  displayHelperText(specialInput, specialCount > length, 'Special character count exceeds length.');

  // If any input field has invalid data, stop further processing
  if (
    length <= 0 ||
    numbersCount + uppercaseCount + lowercaseCount + specialCount > length ||
    numbersCount > length ||
    uppercaseCount > length ||
    lowercaseCount > length ||
    specialCount > length
  ) {
    return;
  }

  // Generate and display five passwords
  const passwordsContainer = document.getElementById('requirements-passwords-container');
  passwordsContainer.innerHTML = ''; // Clear previous passwords

  for (let i = 0; i < 5; i++) {
    let password = '';

    password += generateCharacters(numbersCount, '1234567890');
    password += generateCharacters(uppercaseCount, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    password += generateCharacters(lowercaseCount, 'abcdefghijklmnopqrstuvwxyz');
    password += generateCharacters(specialCount, '!@#$%^&*()-_+=[]{}|;:,.<>?');

    const remainingLength = length - password.length;

    password += generateCharacters(
      remainingLength,
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    );

    // Shuffle the password characters
    password = shuffleString(password);

    const passwordCard = document.createElement('div');
    passwordCard.classList.add('password-card');

    const passwordText = document.createElement('div');
    passwordText.classList.add('password');
    passwordText.textContent = password;
    passwordCard.appendChild(passwordText);

    const copyIcon = document.createElement('span');
    copyIcon.classList.add('copy-icon');
    copyIcon.innerHTML = '&#x1F4CB;'; // Unicode for copy icon

    copyIcon.addEventListener('click', () => {
      copyPassword(password);
      copyIcon.innerHTML = 'Copied!';
      setTimeout(() => {
        copyIcon.innerHTML = '&#x1F4CB;';
      }, 2000); // Reset icon after 2 seconds
    });

    passwordCard.appendChild(copyIcon);

    passwordsContainer.appendChild(passwordCard);
  }
};

// Function to display helper text for input fields
const displayHelperText = (inputElement, condition, message) => {
  const helperTextElement = inputElement.nextElementSibling; // Get the next sibling element (helper text)
  if (condition) {
    helperTextElement.textContent = message; // Display error or warning message
    inputElement.classList.add('invalid-input'); // Add a class to highlight the input field
  } else {
    helperTextElement.textContent = ''; // Clear the helper text
  }
};

// Function to clear helper text and remove invalid input class
const clearHelperText = (inputElement) => {
  const helperTextElement = inputElement.nextElementSibling; // Get the next sibling element (helper text)
  helperTextElement.textContent = ''; // Clear the helper text
  inputElement.classList.remove('invalid-input'); // Remove the class if present
};

// Function to generate characters based on count and charset
const generateCharacters = (count, charset) => {
  let characters = '';
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    characters += charset[randomIndex];
  }
  return characters;
};

// Function to shuffle a string
const shuffleString = (str) => {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
};

// Function to copy password to clipboard
const copyPassword = (password) => {
  const el = document.createElement('textarea');
  el.value = password;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

// Add event listener to the regenerate button
const regenerateButton = document.querySelector('.requirements-regenerate-button');
regenerateButton.addEventListener('click', generateAndDisplayRequirementsPasswords);

// Add event listener to input fields to enable/disable the button
const inputFields = document.querySelectorAll('.generator-input input');

inputFields.forEach((input) => {
  input.addEventListener('input', () => {
    const regenerateButton = document.querySelector('.requirements-regenerate-button');
    let allFieldsFilled = true;
    inputFields.forEach((input) => {
      if (input.value === '') {
        allFieldsFilled = false;
      }
    });
    regenerateButton.disabled = !allFieldsFilled;
  });
});

// Add event listener to the generate button
const generateButton = document.getElementById('generator-card');
generateButton.addEventListener('click', generateAndDisplayPasswords);
