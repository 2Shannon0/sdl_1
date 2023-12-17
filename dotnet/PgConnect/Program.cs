// See https://aka.ms/new-console-template for more information
using Npgsql;
using Microsoft.Extensions.Configuration;
using System.Data;
Console.WriteLine("Введи имя пользователя");
var username = Console.ReadLine();
Console.WriteLine("Введи пароль");
var userpass = Console.ReadLine();
Console.WriteLine($"Пользователь: {username}");
Console.WriteLine($"Пароль: {userpass}");



var builder = new ConfigurationBuilder() 
.SetBasePath(Directory.GetCurrentDirectory()) 
.AddJsonFile("connection.json", optional: false); 
 
IConfiguration config = builder.Build();

var connString = config.GetConnectionString("DefaultConnection");

await using var conn = NpgsqlDataSource.Create(string.Format(connString!, username, userpass));

// await conn.OpenAsync();

// Retrieve all rows
await using (var cmd = conn.CreateCommand("SELECT VERSION();"))
await using (var reader = await cmd.ExecuteReaderAsync())
{
while (await reader.ReadAsync())
    Console.WriteLine(reader.GetString(0));
}
