const user = { name: "Shaheer", username: "shaheer123", email: "test@test.com", password: "password123" };
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(user)
}).then(res => res.json()).then(console.log);