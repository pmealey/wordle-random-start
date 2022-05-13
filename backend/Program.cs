using backend.Data;
using backend.Models;
using backend.Services;
using backend.Services.Parsers;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers(options => 
{
    options.Conventions.Add(new RouteTokenTransformerConvention(new SlugifyParameterTransformer()));
});
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<DataContext>(p => p.UseNpgsql(connectionString));

// order here matters - this is how we display the games
builder.Services.AddScoped<ResultParser, WordleParser>();
builder.Services.AddScoped<ResultParser, QuordleParser>();
builder.Services.AddScoped<ResultParser, WaffleParser>();
builder.Services.AddScoped<ResultParser, Crosswordle1Parser>();
builder.Services.AddScoped<ResultParser, Crosswordle2Parser>();
builder.Services.AddScoped<ResultParser, AbsurdleParser>();
builder.Services.AddScoped<ResultParser, LewdleParser>();
builder.Services.AddScoped<ResultParser, AntiwordleParser>();
builder.Services.AddScoped<ResultParser, WorldleParser>();
builder.Services.AddScoped<ResultParser, GlobleParser>();
builder.Services.AddScoped<ResultParser, CloudleParser>();
builder.Services.AddScoped<ResultParser, NerdleParser>();
builder.Services.AddScoped<ResultParser, HeardleParser>();
builder.Services.AddScoped<ResultParser, BoxOfficeGameParser>();
builder.Services.AddScoped<ResultParser, FramedParser>();
builder.Services.AddScoped<ResultParser, NytMiniParser>();
builder.Services.AddScoped<ResultParser, NytCrosswordParser>();
builder.Services.AddScoped<ResultParser, PimantleParser>();
builder.Services.AddScoped<ResultParser, SemantleParser>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
