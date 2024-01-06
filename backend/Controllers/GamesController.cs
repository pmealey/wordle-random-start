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

        if (DateTime.TryParse(dateString, out var date)) {
            if (_games != null) {
                return Ok(_games);
            }
        } else {
            date = now;
        }

        // every day should result in the same games selected
        var seed = date.Year * 1000 + date.DayOfYear;
        var rand = new Random(seed);

        var randomlySelectedOtherGames = _resultParsers
            .Where(rp => rp.CountWinner && !rp.Default)
            .OrderBy(rp => rand.Next())
            .Take(2);

        _games = _resultParsers
            .Where(rp => rp.HideAfter > now)
            .Select(rp => new
            {
                CountWinner = rp.CountWinner && (rp.Default || randomlySelectedOtherGames.Contains(rp)),
                GameName = rp.GameName,
                GolfScoring = rp.GolfScoring,
                HelpText = rp.HelpText,
                Url = rp.Url
            })
            .ToList();

        return Ok(_games);
    }
}
