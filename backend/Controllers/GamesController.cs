using backend.Data;
using backend.Models;
using backend.Services;
using backend.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("[controller]")]
public class GamesController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ILogger<GamesController> _logger;
    private readonly IEnumerable<object> _games;
    private readonly Dictionary<string, int> GameCategoryCounts = new Dictionary<string, int>
    {
        { "Word", 2 },
        { "Media", 1 },
        { "Other", 1 },
        { "Madness Inducing", 1 }
    };

    public GamesController(DataContext context, ILogger<GamesController> logger, IEnumerable<ResultParser> resultParsers)
    {
        var categories = resultParsers
            .Where(rp => rp.CountWinner)
            .GroupBy(rp => rp.Category)
            .ToDictionary(g => g.Key, g => g.Select(rp => rp.GameName).ToList());

        var date = TimeUtility.GetNowEasternStandardTime();
        var seed = date.Year * 1000 + date.DayOfYear;
        var rand = new Random(seed);

        foreach (var category in categories.Where(kvp => GameCategoryCounts.ContainsKey(kvp.Key)))
        {
            var numberToSelect = GameCategoryCounts[category.Key];
            var numberToRemove = category.Value.Count() - numberToSelect;

            while (numberToRemove > 0)
            {
                var indexToRemove = rand.Next(category.Value.Count());
                category.Value.RemoveAt(indexToRemove);
                numberToRemove = category.Value.Count() - numberToSelect;
            }
        }

        _context = context;
        _logger = logger;
        _games = resultParsers
            .Select(rp => new
            {
                Category = rp.Category,
                CountWinner = CountWinner(rp.CountWinner, categories, rp.Category, rp.GameName),
                GameName = rp.GameName,
                GolfScoring = rp.GolfScoring,
                HelpText = rp.HelpText,
                Url = rp.Url
            })
            .ToList();
    }

    [HttpGet()]
    public IActionResult Get()
    {
        return Ok(_games);
    }

    private bool CountWinner(bool countWinnerForGame, Dictionary<string, List<string>> categories, string category, string gameName)
    {
        var countWinner = countWinnerForGame && categories.ContainsKey(category) && categories[category].Contains(gameName);
        return countWinner;
    }
}
