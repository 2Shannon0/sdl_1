const fs = require('fs');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
// const { table } = require('console');
const rl = readline.createInterface({ input, output });
const consoleTable = require('console.table');

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function toConnect() {
  try {
    const { Client } = require('pg');
    const dbConfig = JSON.parse(fs.readFileSync('dbConfig.json', 'utf8'));
    const client = new Client({
      user: 'sdl_user',
      password: 'password',
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database
    });

    await client.connect();
    console.log('Подключено к базе данных PostgreSQL');
    await performActions(client);
  } catch (err) {
    console.error('Ошибка:', err);
  } finally {
    rl.close();
  }
}

async function performActions(client) {
  let exitA = false;
  let exitT = false;
  let curTable
  while (!exitT) {
    const tableList = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';`);
    // console.log(tableList.rows)
    console.log('\nВыберите таблицу для работы:');
    for (let i = 0; i < tableList.rows.length; i++) {
      console.log(`${i+1}: ${tableList.rows[i].table_name}`)
    }
    let action = false
    while (!action) {
      
        const curTableNumber = await askQuestion('Введите номер тыблицы: ');
        if (curTableNumber === 'exit') {
          await client.end();
          exitA = true
          exitT = true
          action = true
        } else {
          try {
            curTable = tableList.rows[curTableNumber-1].table_name
            action = true
            exitA = false;
          } catch (err) {
            console.error('Ошибка:', err);
          }
        }
        
      
    }
    
    while (!exitA) {
      console.log(`Текущая таблица: ${curTable}`)
      console.log('\nВыберите действие:');
      console.log('1. Просмотреть таблицу');
      console.log('2. Обновить таблицу');
      console.log('3. Внести в таблицу');
      console.log('4. Выйти');
  
      const choice = await askQuestion('Введите номер действия: ');
  
      switch (choice) {
        case '1':
          await viewTable(client, curTable);
          break;
        case '2':
          await updateTable(client, curTable);
          break;
        case '3':
          // await insertInTable(client, curTable);
          break;
        case '4':
          exitA = true;
          break;
        default:
          console.log('Некорректный выбор. Попробуйте еще раз.');
      }
    }
  }

  await client.end();
  console.log('Подключение к базе данных PostgreSQL закрыто');
}

async function viewTable(client, curTable) {
  console.log(`\nПросмотр таблицы ${curTable}:`);
  console.log('1. Без фильтрации');
  console.log('2. С фильтрацией по нескольким значениям');

  const choice = await askQuestion('Введите номер действия: ');

  let query = `SELECT * FROM ${curTable}`;
  let conditions = [];
  let values = [];
  let paramIndexVal = 1;
  const columns = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${curTable}' AND table_schema = 'public';`)
  const whiteListColumns = columns.rows.map((el) => el.column_name);

  switch (choice) {
    case '2':
      let moreFilters = true;
      while (moreFilters) {
        const column = await askQuestion('Введите имя столбца для фильтрации: ');
        if (whiteListColumns.includes(column)) {

          const value = await askQuestion('Введите значение для фильтрации: ');
  
          conditions.push(`${column} = $${paramIndexVal}`);
          values.push(value);
          paramIndexVal++
          const more = await askQuestion('Добавить еще одно условие? (д/н): ');
          if (more.toLowerCase() !== 'д') {
            moreFilters = false;
          }
        } else {
          console.log('В таблице нет такого столбца.')
        }
      }
      break;
    case '1':
    default:
      break;
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  try {
    const result = await client.query(query, values);
    console.log('Результаты:\n');
    console.table(result.rows)
  } catch (err) {
    console.error('Ошибка при выполнении запроса:', err.message);
  }
}

async function updateTable(client, curTable) {
  console.log(`\nОбновление ${curTable}:`);
  console.log('1. Без фильтрации');
  console.log('2. С фильтрацией по нескольким значениям');

  const choice = await askQuestion('Введите номер действия: ');

  let query = `SELECT * FROM ${curTable}`;
  let conditions = [];
  let values = [];
  let paramIndexVal = 1;
  const columns = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${curTable}' AND table_schema = 'public';`)
  const whiteListColumns = columns.rows.map((el) => el.column_name);

  switch (choice) {
    case '2':
      let moreFilters = true;
      while (moreFilters) {
        const column = await askQuestion('Введите имя столбца для фильтрации: ');
        if (whiteListColumns.includes(column)) {

          const value = await askQuestion('Введите значение для фильтрации: ');
  
          conditions.push(`${column} = $${paramIndexVal}`);
          values.push(value);
          paramIndexVal++
          const more = await askQuestion('Добавить еще одно условие? (д/н): ');
          if (more.toLowerCase() !== 'д') {
            moreFilters = false;
          }
        } else {
          console.log('В таблице нет такого столбца.')
        }
      }
      break;
    case '1':
    default:
      break;
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  try {
    const result = await client.query(query, values);
    console.log('Результаты:\n');
    console.table(result.rows)
  } catch (err) {
    console.error('Ошибка при выполнении запроса:', err.message);
  }
}

toConnect();
toConnect();
