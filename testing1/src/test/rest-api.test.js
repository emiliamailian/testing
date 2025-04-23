import { beforeAll, describe, beforeEach, afterEach, test, expect } from 'vitest';

let jwtToken;

beforeAll(async () => {
  const url = 'https://tokenservice-jwt-2025.fly.dev/token-service/v1/request-token';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'Kallepelle', 
      password: 'kallespassword', 
    }),
  });

  jwtToken = await res.text();
});

// --- GET-tester ---

describe('GET-tester', () => {
  let createdMovie;
  let description = 'En spännande sci-fi-film med trettio bokstäver';

  beforeEach(async () => {
    const res = await fetch('https://tokenservice-jwt-2025.fly.dev/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        title: 'Testfilm GET',
        director: 'Regissör GET',
        description: description,
        productionYear: 2023,
      }),
    });

    createdMovie = await res.json();
  });

  afterEach(async () => {
    await fetch(`https://tokenservice-jwt-2025.fly.dev/movies/${createdMovie.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
  });

  test('GET /movies returnerar array med minst en film', async () => {
    const res = await fetch('https://tokenservice-jwt-2025.fly.dev/movies', {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /movies/:id returnerar korrekt film', async () => {
    const res = await fetch(`https://tokenservice-jwt-2025.fly.dev/movies/${createdMovie.id}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.title).toBe('Testfilm GET');
    expect(data.director).toBe('Regissör GET');
    expect(data.description).toBe(description);
    expect(data.productionYear).toBe(2023);
  });
});

// --- DELETE-test ---

describe('DELETE-test', () => {
  let createdMovie;

  beforeEach(async () => {
    const res = await fetch('https://tokenservice-jwt-2025.fly.dev/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        title: 'Testfilm DELETE',
        director: 'Regissör DELETE',
        description: 'En intressant film att ta bort med trettio bokstäver',
        productionYear: 2022,
      }),
    });

    createdMovie = await res.json();
  });

  test('DELETE /movies/:id returnerar status 204', async () => {
    const res = await fetch(`https://tokenservice-jwt-2025.fly.dev/movies/${createdMovie.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    expect(res.status).toBe(204);
  });
});

// --- POST + DELETE i samma test ---

describe('POST + DELETE i samma test', () => {
  test('Skapa och ta bort film i samma test', async () => {
    const postRes = await fetch('https://tokenservice-jwt-2025.fly.dev/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        title: 'Post och Delete',
        director: 'Regissör POST o DELETE',
        description: 'Filmen som skapas och tas bort med trettio bokstäver',
        productionYear: 2024,
      }),
    });

    expect(postRes.status).toBe(201);
    const newMovie = await postRes.json();

    const deleteRes = await fetch(`https://tokenservice-jwt-2025.fly.dev/movies/${newMovie.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    expect(deleteRes.status).toBe(204);
  });
});

// --- PUT + GET i samma test ---

describe('PUT + GET', () => {
  let createdMovie;

  beforeEach(async () => {
    const res = await fetch('https://tokenservice-jwt-2025.fly.dev/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        title: 'Originaltitel',
        director: 'Regissör med trettio bokstäver',
        description: 'En gammal film med trettio bokstäver',
        productionYear: 2021,
      }),
    });

    createdMovie = await res.json();
  });

  afterEach(async () => {
    await fetch(`https://tokenservice-jwt-2025.fly.dev/movies/${createdMovie.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
  });

  test('Uppdatera titel och verifiera', async () => {
    const putRes = await fetch(`https://tokenservice-jwt-2025.fly.dev/movies/${createdMovie.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        title: 'Uppdaterad titel',
        director: 'Regissör med trettio bokstäver',
        description: 'En uppdaterad beskrivning med trettio bokstäver',
        productionYear: 2021,
      }),
    });

    const json = await putRes.json(); 
    console.log('PUT response JSON:', json);

    expect(putRes.status).toBe(200);

    const getRes = await fetch(`https://tokenservice-jwt-2025.fly.dev/movies/${createdMovie.id}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    const updatedMovie = await getRes.json();
    expect(updatedMovie.title).toBe('Uppdaterad titel');
    expect(updatedMovie.director).toBe('Regissör med trettio bokstäver');
    expect(updatedMovie.description).toBe('En uppdaterad beskrivning med trettio bokstäver');
    expect(updatedMovie.productionYear).toBe(2021);
  });
});
