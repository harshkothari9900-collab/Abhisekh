(async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/abhisekh/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'abhisekh@gmail.com', password: 'Abhisekh@1709' }),
    });

    const loginJson = await loginRes.json();
    console.log('Login response:', loginJson);

    if (!loginJson.token) {
      console.error('Could not get token; aborting test.');
      process.exit(loginJson.success === false ? 1 : 2);
    }

    const token = loginJson.token;
    const categoryName = `TestCategory_${Date.now()}`;

    const createRes = await fetch('http://localhost:5000/abhisekh/category/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ category_name: categoryName }),
    });

    const createJson = await createRes.json();
    console.log('Create category response:', createJson);

    const allRes = await fetch('http://localhost:5000/abhisekh/category/all');
    const allJson = await allRes.json();
    console.log('All categories count:', allJson.count);

    process.exit(0);
  } catch (err) {
    console.error('Test script error:', err);
    process.exit(1);
  }
})();
