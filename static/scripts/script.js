const backButton = document.querySelector('.back-button');
const uploadCard = document.getElementById('upload-card');
const checkerCard = document.getElementById('checker-card');
const uploadContent = document.getElementById('upload-content');
const generatorCard = document.getElementById('generator-card');
const checkerContent = document.getElementById('checker-content');
const generatorContent = document.getElementById('generator-content');
const requirementsGeneratorCard = document.getElementById('requirements-generator-card');
const requirementsGeneratorContent = document.getElementById('requirements-generator-content');

const toggleOption = (option) => {
  if (option === 'checker') {
    uploadCard.style.display = 'none';
    checkerCard.style.display = 'none';
    generatorCard.style.display = 'none';
    requirementsGeneratorCard.style.display = 'none';

    checkerContent.style.display = 'block';
    backButton.classList.add('show-back-button');
  } else if (option === 'generator') {
    uploadCard.style.display = 'none';
    checkerCard.style.display = 'none';
    generatorCard.style.display = 'none';
    requirementsGeneratorCard.style.display = 'none';

    generatorContent.style.display = 'block';
    backButton.classList.add('show-back-button');
  } else if (option === 'requirements-generator') {
    uploadCard.style.display = 'none';
    checkerCard.style.display = 'none';
    generatorCard.style.display = 'none';
    requirementsGeneratorCard.style.display = 'none';

    requirementsGeneratorContent.style.display = 'block';
    backButton.classList.add('show-back-button');
  } else if (option === 'upload') {
    uploadCard.style.display = 'none';
    checkerCard.style.display = 'none';
    generatorCard.style.display = 'none';
    requirementsGeneratorCard.style.display = 'none';

    uploadContent.style.display = 'block';
    backButton.classList.add('show-back-button');
  }
};

const showOptions = () => {
  uploadCard.style.display = 'block';
  checkerCard.style.display = 'block';
  generatorCard.style.display = 'block';
  requirementsGeneratorCard.style.display = 'block';

  uploadContent.style.display = 'none';
  checkerContent.style.display = 'none';
  generatorContent.style.display = 'none';
  requirementsGeneratorContent.style.display = 'none';
  backButton.classList.remove('show-back-button');
};

document.getElementById('predictButton').addEventListener('click', () => {
  const password = document.getElementById('password').value;

  fetch('/predict_complexity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'password=' + encodeURIComponent(password),
  })
    .then((response) => response.json())
    .then((data) => {
      // Update password and complexity
      document.getElementById('passwordResult').textContent = data.password;
      document.getElementById('predictedComplexityResult').textContent = data.predicted_complexity;

      // Show the dynamic content
      document.getElementById('predictionResults').style.display = 'block';

      // Update the link to include the password in the query string
      const password = data.password;
      const passwordDetailsLink = document.getElementById('passwordDetailsLink');
      passwordDetailsLink.href = '/dashboard?password=' + encodeURIComponent(password);
    })
    .catch((error) => {
      console.error('Error occurred:', error);
    });
});
