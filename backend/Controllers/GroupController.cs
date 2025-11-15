using backend.Data;
using backend.Models;
using backend.Services;
using backend.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.ObjectPool;

namespace backend.Controllers;

[ApiController]
[Route("[controller]")]
public class GroupController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ILogger<GroupController> _logger;
    private readonly IEnumerable<ResultParser> _resultParsers;

    public static List<Group> Groups = new List<Group>
    {
        new() { Name = "family", SelectGames = true },
        new() { Name = "libo", SelectGames = false },
        new() { Name = "powerschool", SelectGames = false}
    };

    public GroupController(DataContext context, ILogger<GroupController> logger, IEnumerable<ResultParser> resultParsers)
    {
        _context = context;
        _logger = logger;
        _resultParsers = resultParsers;
    }

    [HttpGet("{name}")]
    public IActionResult Get(string name)
    {
        var group = Groups.FirstOrDefault(g => g.Name == name);

        if (group == null) {
            return NotFound();
        }

        var now  = TimeUtility.GetNowEasternStandardTime();
        var today = now.Date;
        var seed = today.Year * 1000 + today.DayOfYear;
        var lastWeek = today.AddDays(-7);
        var rand = new Random(seed);

        var lastWeeksResults = _context.DailyResult
            .AsQueryable()
            .Where(dr => dr.Date.Date != today.Date && dr.Date >= lastWeek && dr.Groups.Contains(name))
            .ToList();

        // calculate popularity for each individual game in each individual group
        var popularity = _resultParsers
            .ToDictionary(
                rp => rp,
                rp => lastWeeksResults.Count(dr => dr.Game == rp.GameName)
            );

        var allParsersByPopularity = _resultParsers
            .Where(rp => rp.HideAfter > now && rp.CountWinner)
            .OrderByDescending(rp => popularity[rp])
            .ThenBy(rp => rand.Next())
            .ToList();

        var mostPopularGames = allParsersByPopularity.Take(6);

        return Ok(new
        {
            group.Name,
            group.Description,
            group.SelectGames,
            games = _resultParsers
                .ToDictionary(
                    rp => rp.GameName,
                    rp => new
                    {
                        popularity = popularity[rp],
                        countWinner = mostPopularGames.Contains(rp)
                    }
                )
        });
    }
}
