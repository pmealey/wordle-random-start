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

    public GamesController(DataContext context, ILogger<GamesController> logger, IEnumerable<ResultParser> resultParsers)
    {
        _context = context;
        _logger = logger;
        _resultParsers = resultParsers;
    }

    [HttpGet("{dateString?}")]
    public IActionResult Get(string? dateString, [FromQuery] string? user)
    {
        var now = TimeUtility.GetNowEasternStandardTime();

        if (!DateTime.TryParse(dateString, out var date)) {
            date = now;
        }

        // every day should result in the same games selected
        var seed = date.Year * 1000 + date.DayOfYear;
        var rand = new Random(seed);

        var today = now.Date;
        var lastWeek = today.AddDays(-7);

        var lastWeeksResults = _context.DailyResult
            .AsQueryable()
            .Where(dr => dr.Date.Date != today.Date && dr.Date >= lastWeek)
            .ToList();

        var games = _resultParsers
            .Where(rp => rp.HideAfter > now)
            .Select(rp => new
            {
                GameName = rp.GameName,
                GolfScoring = rp.GolfScoring,
                HelpText = rp.HelpText,
                MyPopularity = lastWeeksResults.Where(dr => dr.User == user).Count(dr => dr.Game == rp.GameName),
                Url = rp.Url
            })
            .ToList();

        return Ok(games);
    }
}
