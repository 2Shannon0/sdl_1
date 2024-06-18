const fs = require('fs');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const rl = readline.createInterface({ input, output });

// Функция для запроса данных у пользователя
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function toConnect() {
  try {
    const user = await askQuestion('Введите имя пользователя: ');
    const pass = await askQuestion('Введите пароль: ');
    rl.close();

    const { Client } = require('pg');
    const dbConfig = JSON.parse(fs.readFileSync('dbConfig.json', 'utf8'));
    const client = new Client({
      user: user,
      password: pass,
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database
    });

    client
      .connect()
      .then(() => {
        console.log('Подключено к базе данных PostgreSQL');

        client.query('SELECT VERSION();', (err, result) => {
          if (err) {
            console.error('Ошибка при выполнении запроса:', err);
          } else {
            console.log('Версия PostgreSQL:', result.rows[0].version);
          }

          client
            .end()
            .then(() => {
              console.log('Подключение к базе данных PostgreSQL закрыто');
            })
            .catch((err) => {
              console.error('Ошибка при отключении: ', err);
            });
        });
      })
      .catch((err) => {
        console.error('Ошибка при подключение к базе данных PostgreSQL', err);
      });
  } catch (err) {
    console.error('Ошибка:', err);
    rl.close();
  }
}

toConnect();