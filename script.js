// Quiz data
const quizData = [
    {
        question: "What is the main cause of climate change?",
        options: ["Deforestation", "Burning fossil fuels", "Plastic pollution", "Overfishing"],
        correct: 1
    },
    {
        question: "Which of these is a renewable energy source?",
        options: ["Coal", "Natural Gas", "Solar Power", "Nuclear Power"],
        correct: 2
    },
    {
        question: "What percentage of Earth's water is freshwater?",
        options: ["3%", "10%", "25%", "50%"],
        correct: 0
    },
    {
        question: "What is the primary greenhouse gas?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        correct: 1
    },
    {
        question: "Which activity contributes most to deforestation?",
        options: ["Urbanization", "Agriculture", "Mining", "Tourism"],
        correct: 1
    }
];

// DOM elements
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const resultEl = document.getElementById('result');
const totalPointsEl = document.getElementById('total-points');
const badgesListEl = document.getElementById('badges-list');
const registrationForm = document.getElementById('registration-form');
const registrationMessage = document.getElementById('registration-message');

// Quiz variables
let currentQuestion = 0;
let score = 0;
let selectedOption = null;

// Load data from localStorage
function loadFromStorage() {
    const storedPoints = localStorage.getItem('quickcompPoints');
    const storedBadges = localStorage.getItem('quickcompBadges');
    const storedTasks = localStorage.getItem('quickcompTasks');
    const storedQuizScore = localStorage.getItem('quickcompQuizScore');

    if (storedPoints) {
        totalPointsEl.textContent = storedPoints;
    }
    if (storedBadges) {
        const badges = JSON.parse(storedBadges);
        displayBadges(badges);
    }
    if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        tasks.forEach(task => markTaskCompleted(task));
    }
    if (storedQuizScore) {
        score = parseInt(storedQuizScore);
    }
}

// Save data to localStorage
function saveToStorage(key, value) {
    localStorage.setItem(key, value);
}

// Update points
function updatePoints(points) {
    const currentPoints = parseInt(totalPointsEl.textContent);
    const newPoints = currentPoints + points;
    totalPointsEl.textContent = newPoints;
    saveToStorage('quickcompPoints', newPoints.toString());

    // Check for badges
    checkBadges(newPoints);
}

// Check and award badges
function checkBadges(points) {
    const badges = JSON.parse(localStorage.getItem('quickcompBadges') || '[]');
    const newBadges = [];

    if (points >= 10 && !badges.includes('QuickComp Beginner')) {
        newBadges.push('QuickComp Beginner');
    }
    if (points >= 25 && !badges.includes('QuickComp Warrior')) {
        newBadges.push('QuickComp Warrior');
    }
    if (points >= 50 && !badges.includes('Green Champion')) {
        newBadges.push('Green Champion');
    }

    if (newBadges.length > 0) {
        badges.push(...newBadges);
        saveToStorage('quickcompBadges', JSON.stringify(badges));
        displayBadges(badges);
        alert(`Congratulations! You earned new badges: ${newBadges.join(', ')}`);
    }
}

// Display badges
function displayBadges(badges) {
    badgesListEl.innerHTML = '';
    badges.forEach(badge => {
        const li = document.createElement('li');
        li.className = 'badge';
        li.textContent = badge;
        badgesListEl.appendChild(li);
    });
}

// Mark task as completed
function markTaskCompleted(taskId) {
    const taskEl = document.querySelector(`[data-task="${taskId}"]`);
    if (taskEl) {
        const btn = taskEl.querySelector('.complete-btn');
        btn.textContent = 'Completed';
        btn.classList.add('completed');
        btn.disabled = true;
    }
}

// Quiz functions
function loadQuestion() {
    const question = quizData[currentQuestion];
    questionEl.textContent = question.question;

    optionsEl.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'option';
        optionEl.textContent = option;
        optionEl.addEventListener('click', () => selectOption(index, optionEl));
        optionsEl.appendChild(optionEl);
    });

    nextBtn.style.display = 'none';
    resultEl.textContent = '';
    selectedOption = null;
}

function selectOption(index, element) {
    // Remove previous selection
    document.querySelectorAll('.option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedOption = index;
    nextBtn.style.display = 'block';
}

function showResult(isCorrect) {
    resultEl.className = isCorrect ? 'correct' : 'incorrect';
    resultEl.textContent = isCorrect ? 'Correct! +5 points' : 'Incorrect. The correct answer is: ' + quizData[currentQuestion].options[quizData[currentQuestion].correct];
    if (isCorrect) {
        updatePoints(5);
    }
}

function nextQuestion() {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === quizData[currentQuestion].correct;
    showResult(isCorrect);

    currentQuestion++;
    if (currentQuestion < quizData.length) {
        setTimeout(() => {
            loadQuestion();
        }, 2000);
    } else {
        setTimeout(() => {
            questionEl.textContent = 'Quiz completed!';
            optionsEl.innerHTML = '';
            nextBtn.style.display = 'none';
            saveToStorage('quickcompQuizScore', score.toString());
        }, 2000);
    }
}

// Task completion
function setupTaskListeners() {
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskEl = this.parentElement;
            const taskId = taskEl.dataset.task;

            markTaskCompleted(taskId);
            updatePoints(10);

            // Save completed tasks
            const completedTasks = JSON.parse(localStorage.getItem('quickcompTasks') || '[]');
            if (!completedTasks.includes(taskId)) {
                completedTasks.push(taskId);
                saveToStorage('quickcompTasks', JSON.stringify(completedTasks));
            }
        });
    });
}

// Registration form
function setupRegistrationForm() {
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const schoolName = document.getElementById('school-name').value;
        const schoolEmail = document.getElementById('school-email').value;
        const contactPerson = document.getElementById('contact-person').value;

        // Save registration data
        const registrationData = {
            schoolName,
            schoolEmail,
            contactPerson,
            timestamp: new Date().toISOString()
        };

        const registrations = JSON.parse(localStorage.getItem('quickcompRegistrations') || '[]');
        registrations.push(registrationData);
        saveToStorage('quickcompRegistrations', JSON.stringify(registrations));

        // Show success message
        registrationMessage.className = 'success';
        registrationMessage.textContent = 'Registration successful! Thank you for joining QuickComp.';

        // Clear form
        registrationForm.reset();
    });
}

// Initialize the app
function init() {
    loadFromStorage();
    loadQuestion();
    setupTaskListeners();
    setupRegistrationForm();

    // Hide main content and nav initially
    document.querySelector('main').style.display = 'none';
    document.getElementById('main-nav').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';

    nextBtn.addEventListener('click', nextQuestion);

    // Setup login form submission handler
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('login-name').value;
        const password = document.getElementById('login-password').value;

        // Simple validation (for demo purposes)
        if (name === '' || password === '') {
            loginMessage.textContent = 'Please enter both name and password.';
            loginMessage.style.color = 'red';
            return;
        }

        // Save user data to localStorage
        const userData = {
            name: name,
            password: password,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('ecoSphereUser', JSON.stringify(userData));

        // For demo, accept any non-empty credentials as successful login
        loginMessage.textContent = 'Login successful!';
        loginMessage.style.color = 'green';

        // Hide login section and show main content and nav
        document.getElementById('login-section').style.display = 'none';
        document.querySelector('main').style.display = 'block';
        document.getElementById('main-nav').style.display = 'block';
    });

    // Setup forgot password and sign up link handlers
    const forgotPasswordLink = document.getElementById('forgot-password');
    const signUpLink = document.getElementById('sign-up');
    const backToLoginLink = document.getElementById('back-to-login');

    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');

    const signupForm = document.getElementById('signup-form');
    const signupMessage = document.getElementById('signup-message');

    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Forgot password functionality is not implemented yet.');
    });

    signUpLink.addEventListener('click', function(e) {
        e.preventDefault();
        // Show sign-up form and hide login form
        loginSection.style.display = 'none';
        signupSection.style.display = 'block';
        signupMessage.textContent = '';
    });

    backToLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        // Show login form and hide sign-up form
        signupSection.style.display = 'none';
        loginSection.style.display = 'block';
        document.getElementById('login-message').textContent = '';
    });

    // Handle sign-up form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            signupMessage.style.color = 'red';
            signupMessage.textContent = 'Please fill in all fields.';
            return;
        }

        if (password !== confirmPassword) {
            signupMessage.style.color = 'red';
            signupMessage.textContent = 'Passwords do not match.';
            return;
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('ecoSphereUsers') || '[]');
        if (users.some(user => user.email === email)) {
            signupMessage.style.color = 'red';
            signupMessage.textContent = 'An account with this email already exists.';
            return;
        }

        // Save new user
        users.push({ name, email, password, createdAt: new Date().toISOString() });
        localStorage.setItem('ecoSphereUsers', JSON.stringify(users));

        signupMessage.style.color = 'green';
        signupMessage.textContent = 'Sign-up successful! You can now log in.';

        // Clear form
        signupForm.reset();
    });

    // Handle forgot password form submission
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('forgot-password-email').value.trim();

        if (!email) {
            forgotPasswordMessage.style.color = 'red';
            forgotPasswordMessage.textContent = 'Please enter your email address.';
            return;
        }

        const users = JSON.parse(localStorage.getItem('ecoSphereUsers') || '[]');
        const user = users.find(user => user.email === email);

        if (!user) {
            forgotPasswordMessage.style.color = 'red';
            forgotPasswordMessage.textContent = 'No account found with that email address.';
            return;
        }

        // For demo, just show success message (no actual email sending)
        forgotPasswordMessage.style.color = 'green';
        forgotPasswordMessage.textContent = 'Password reset link sent to your email address.';

        // Clear form
        forgotPasswordForm.reset();
    });
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
