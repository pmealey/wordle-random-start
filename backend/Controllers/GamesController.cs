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
    private readonly IEnumerable<ResultParser> _resultParsers;
    private static IEnumerable<object>? _games;

    private static readonly Dictionary<string, int> GameCategoryCounts = new Dictionary<string, int>
    {
        { "Word", 1 },
        { "Media", 1 },
        { "Other", 1 },
        { "Madness Inducing", 1 }
    };

    public GamesController(DataContext context, ILogger<GamesController> logger, IEnumerable<ResultParser> resultParsers)
    {
        _context = context;
        _logger = logger;
        _resultParsers = resultParsers;
    }

    [HttpGet("{dateString?}")]
    public IActionResult Get(string? dateString)
    {
        var now = TimeUtility.GetNowEasternStandardTime();
        var categories = _resultParsers
            .Where(rp => rp.CountWinner && rp.ActiveAfter <= now && rp.ActiveBefore > now)
            .GroupBy(rp => rp.Category)
            .ToDictionary(g => g.Key, g => g.Select(rp => rp.GameName).ToList());

        if (DateTime.TryParse(dateString, out var date)) {
            if (_games != null) {
                return Ok(_games);
            }
        } else {
            date = now;
        }

        // every day should result in the same 
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

        _games = _resultParsers
            .Select(rp => new
            {
                Category = rp.Category,
                CountWinner = rp.CountWinner && categories.ContainsKey(rp.Category) && categories[rp.Category].Contains(rp.GameName),
                GameName = rp.GameName,
                GolfScoring = rp.GolfScoring,
                HelpText = rp.HelpText,
                Url = rp.Url
            })
            .ToList();

        return Ok(_games);
    }
}
